var apiManager = (function () {
    var A = function () { };
    A.prototype.get = function (opts) {
        let url = opts.url;
        url = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'no-cache=' + (new Date).getTime();
        return fetch(url).then(response => {
            if (opts.isRaw) {
                return response.text();
            } else {
                return response.json();
            }
        });
    };
    A.prototype.post = function (opts) {
        return fetch(opts.url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'include',
            headers: {
                "Content-Type": "application/json"
            },
            referrer: 'no-referrer',
            body: JSON.stringify(opts.body)
        });
    }
    A.prototype.uploadFile = function (opts) {
        var formData = new FormData();
        formData.append('path', opts.path);
        formData.append('file', opts.file)
        return fetch(opts.url, {
            method: 'POST',
            body: formData
        });
    };
    return new A();

})();

var sandbox = (function () {
    var components = [], windowLoaded = false;
    var S = function () { };
    S.prototype.registerComponent = function (config) {
        components.push(config);
        if (windowLoaded) {
            config.render();
        }
    };
    S.prototype.onload = function () {
        windowLoaded = true;
        components.forEach((comp) => {
            comp.render();
        });
    };
    S.prototype.tryCatch = function (fn) {
        try {
            fn();
        } catch (e) {
            //swallow
        }
    };
    return new S();
})();


var handleFileContent = function (fileContent, file) {
    let scriptTag = document.createElement('SCRIPT');
    if (file.fileType === 'JSX' && file.tag === 'SCRIPT') {
        try {
            let result = Babel.transform(fileContent, { presets: ['react', 'es2015'] });
            if (result) {
                fileContent = result.code;
            }
            sandbox.tryCatch(function () {
                scriptTag.textContent = fileContent;
                document.querySelector('body').appendChild(scriptTag);
            });
        } catch (e) {
            //swallow
            console.log(e);
        }
    } else if (file.tag === 'STYLE' && (file.fileType === 'LESS' || file.fileType === 'SCSS')) {
        if (file.fileType === 'LESS') {
            less.render(fileContent).then(cssResponse => {
                let styleTag = document.createElement('STYLE');
                styleTag.textContent = cssResponse.css;
                document.querySelector('head').appendChild(styleTag);
            });
        }
        if (file.fileType === 'SCSS') {
            sass.compile(fileContent, (cssResponse) => {
                let styleTag = document.createElement('STYLE');
                styleTag.textContent = cssResponse.text;
                document.querySelector('head').appendChild(styleTag);
            });
        }
    }
};
var appendComponent = function (compName, files) {
    files.forEach(file => {
        apiManager.get({
            url: '/comps/' + compName + '/' + file.fileName,
            isRaw: true
        }).then(content => {
            handleFileContent(content, file);
        });
    });
}
window.onload = function () {
    sandbox.onload();
    let allComponents = [];
    fetch('/comps/meta.json').then(response => {
        response.json().then((metaJson) => {
            allComponents = metaJson.components;
            allComponents.forEach(comp => {
                appendComponent(comp.name, comp.files);
            });
        });
    });
    Sass.setWorkerUrl('/js/vendor/sass-worker.js');
    window.sass = new Sass('/js/vendor/sass-worker.js');
};