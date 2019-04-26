var templateEngine = (function () {
    var eObj = {};
    eObj.applyScope = function (htmlElem, scope) {

    };
    var E = function () { };
    E.prototype = eObj;

    return new E();
})();
var componentManager = (function () {
    var allComponents = [];
    var C = function () { };
    C.prototype.register = function (componentConfig) {
        allComponents.forEach(compItem => {
            if (compItem.name === componentConfig.name) {
                compItem.config = componentConfig;
            }
        });
    };
    C.prototype.getAllComponents = function () {
        return allComponents;
    };
    C.prototype.get = function (compName) {
        return allComponents.filter(c => c.name === compName)[0];
    }
    C.prototype.render = function (comp) {
        allComponents.forEach(compItem => {
            if (compItem.name === comp && compItem.files.length === compItem.files.filter(c => c.rendered).length) {
                if (compItem.config && compItem.config.render) {
                    compItem.config.render();
                }
            }
        });
    };
    C.prototype.handleFile = function (fileContent, file, comp) {
        switch (file.tag) {
            case 'HTML':
                let htmlToUpdate = '';
                if (file.fileType === 'JSON') {
                    try {
                        var domJson = JSON.parse(fileContent);
                        htmlToUpdate = domManager.convert(domJson, 'HTML_STR');
                    } catch (e) {
                        //swallow
                    }
                }
                if (file.fileType === 'HTML') {
                    htmlToUpdate = fileContent;
                }
                document.querySelectorAll('[ta-component="' + comp + '"]').forEach(elem => {
                    elem.innerHTML = htmlToUpdate;
                    scopeManager.applyScope(elem, this.get(comp));
                    elem.setAttribute('class', comp + ' component');
                });
                break;
            case 'STYLE':
                if (file.fileType === 'LESS' && less) {
                    less.render(fileContent).then(cssResponse => {
                        let styleTag = document.createElement('STYLE');
                        styleTag.textContent = cssResponse.css;
                        document.querySelector('head').appendChild(styleTag);
                    });
                }
                break;
            case 'SCRIPT':
                let scriptTag = document.createElement('SCRIPT');
                scriptTag.textContent = fileContent;
                document.querySelector('head').appendChild(scriptTag);
                break;
            default:
                break;
        }
        sandbox.nextTick(() => {
            file.rendered = true;
            this.render(comp);
        });
    };
    C.prototype.load = function (comp) {
        var filterComp = allComponents.filter(compItem => {
            return compItem.name === comp;
        });
        if (filterComp && filterComp.length > 0) {
            let filterItem = filterComp[0];
            filterItem.files.forEach(file => {
                apiManager.get({
                    url: '/components/' + comp + '/' + file.fileName,
                    isRaw: true
                }).then(content => {
                    file.loaded = true;
                    this.handleFile(content, file, comp, filterItem);
                });
            });
        }
    };

    fetch('/components/meta.json').then(response => {
        response.json().then((metaJson) => {
            allComponents = metaJson.components;
        });
    });

    return new C();
})();