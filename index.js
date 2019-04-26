// require('./fe-server')({ fePort: 3435, folder: 'site-builder' });

const fs = require('fs')
const path = require('path')
const http2 = require('http2')
const helper = require('./helper')
const mime = require('mime')
const url = require('url')

const { HTTP2_HEADER_PATH } = http2.constants
const PORT = process.env.PORT || 3435
const PUBLIC_PATH = path.join(__dirname, 'site-builder')

const publicFiles = helper.getFiles(PUBLIC_PATH)
const server = http2.createSecureServer({
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'localhost-privkey.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'localhost-cert.pem'))
}, onRequest)

// Push file
function push(stream, path) {
  const file = publicFiles.get(path)

  if (!file) {
    return
  }

  stream.pushStream({ [HTTP2_HEADER_PATH]: path }, (pushStream) => {
    pushStream.respondWithFD(file.fileDescriptor, file.headers)
  })
}


function pushJsFiles(stream, filePath) {
  const fileDescriptor = fs.openSync(path.join(PUBLIC_PATH, filePath), 'r');
  const stat = fs.fstatSync(fileDescriptor);
  const contentType = mime.lookup(filePath);
  let file = {
    fileDescriptor,
    headers: {
      'content-length': stat.size,
      'last-modified': stat.mtime.toUTCString(),
      'content-type': contentType
    }
  };

  stream.pushStream({ [HTTP2_HEADER_PATH]: filePath }, (err, pushStream) => {
    if (pushStream) {
      pushStream.respondWithFD(file.fileDescriptor, file.headers)
    }
  })
}
// Request handler
function onRequest(req, res) {
  var body = [];
  if (req.url.indexOf('api') >= 0) {
    var response = {};
    req.on('data', function (chunk) {
      body.push(chunk);
    });

    req.addListener('end', function () {
      body = Buffer.concat(body).toString();
      console.log('url', req.url, req.method);

      if (req.method === 'POST') {
        if (req.url.indexOf('/api/page') === 0) {
          let jsonData = JSON.parse(body);
          let filePath = path.join(__dirname, 'site-builder', 'pages', jsonData.pagePath + '.json');
          fs.writeFileSync(filePath, JSON.stringify(jsonData.fileContent, null, 4), {
            encoding: 'utf-8'
          });
        }
      } else if (req.method === 'GET') {
        if (req.url.indexOf('/api/component') === 0) {
          let componentMetaPath = path.join(__dirname, 'site-builder', 'components', 'meta.json');

        }
        if (req.url.indexOf('/api/page') === 0) {
          let urlParts = url.parse(req.url, true);
          if (urlParts.query.pageUrl) {
            let pageUrl = urlParts.query.pageUrl;
            let filePath = path.join(__dirname, 'site-builder', 'pages', pageUrl + '.json');
            response = fs.readFileSync(filePath, { encoding: 'utf-8' });
          }
        }
      }
      res.writeHead(200, {
        'Content-Type': 'application/json'
      });
      res.end(response);
    }).resume();

  } else {
    const reqPath = req.url === '/' ? '/index.html' : req.url
    const file = publicFiles.get(reqPath)

    // Push with index.html
    if (reqPath === '/index.html') {
      pushJsFiles(res.stream, "/js/vendor/less.min.js");
      pushJsFiles(res.stream, "/js/global/store-manager.js");
      pushJsFiles(res.stream, "/js/global/scope-manager.js");
      pushJsFiles(res.stream, "/js/global/dom-manager.js");
      pushJsFiles(res.stream, "/js/global/component-manager.js");
      pushJsFiles(res.stream, "/js/global.js");
      pushJsFiles(res.stream, "/js/sandbox.js");

      pushJsFiles(res.stream, "/components/meta.json");

      pushJsFiles(res.stream, "/css/global.less");
      pushJsFiles(res.stream, "/css/globals/index.less");

      pushJsFiles(res.stream, "/css/globals/_flex.less");
      pushJsFiles(res.stream, "/css/globals/_margins-and-paddings.less");
      pushJsFiles(res.stream, "/css/globals/_mixins.less");
      pushJsFiles(res.stream, "/css/globals/_variables.less");
      pushJsFiles(res.stream, "/css/globals/_animations.less");
      pushJsFiles(res.stream, "/css/globals/_utils.less");

    }

    if (file) {
      // Serve file
      res.stream.respondWithFD(file.fileDescriptor, file.headers)
    } else {
      let filePath = url.parse(req.url).pathname;
      const fileDescriptor = fs.openSync(path.join(__dirname, 'site-builder', filePath), 'r')
      const stat = fs.fstatSync(fileDescriptor)
      const contentType = mime.lookup(filePath)
      res.stream.respondWithFD(fileDescriptor, {
        'content-length': stat.size,
        'last-modified': stat.mtime.toUTCString(),
        'content-type': contentType
      });
    }
  }
}

server.listen(PORT, (err) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(`Server listening on ${PORT}`)
})