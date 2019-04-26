var domManager = (function () {
    var D = function () { };
    D.prototype.getTag = function (tagName, format, innerHTML, attributes, extraAttributes) {
        let attrStr = '';
        if (attributes && attributes instanceof Array && attributes.length > 0) {
            attributes.forEach(attr => {
                attrStr += attr.name + '="' + attr.value + '"';
            });
        }
        let tagStr = innerHTML;
        if (tagName) {
            let extras = Object.assign({}, extraAttributes);
            let extraKeys = Object.keys(extras);
            let extrsStr = '';
            for (let i = 0; i < extraKeys.length; i++) {
                extrsStr += extraKeys[i] + '="' + extras[extraKeys[i]] + '"';
            }
            tagStr = '<' + tagName + ' ' + attrStr + ' ' + extrsStr + ' >' + innerHTML + '</' + tagName + '>';
        }
        return tagStr;
    };
    D.prototype.convertSub = function (domJson, format) {
        if (domJson.name === 'TEXT') {
            return domJson.value;
        }
        if (format === 'HTML_STR') {
            let childrenStr = '';
            if (domJson.children && domJson.children.length > 0) {
                for (let i = 0; i < domJson.children.length; i++) {
                    childrenStr += this.convertSub(domJson.children[i], format);
                }
            } else {
                childrenStr = domJson.value || '';
            }
            let guid = Math.floor(Math.random() * 10000) + '' + (new Date).getTime();
            storeManager.scope(guid, domJson.data);
            return this.getTag(domJson.name, 'HTML_STR', childrenStr, domJson.attributes, {
                "data-scope-id": guid
            });
        }
    };
    D.prototype.convert = function (fileContent, format) {
        if (format === 'HTML_STR') {
            let childrenStr = '';
            if (fileContent.children && fileContent.children.length > 0) {
                for (let i = 0; i < fileContent.children.length; i++) {
                    childrenStr += this.convertSub(fileContent.children[i], format);
                }
            } else {
                childrenStr = fileContent.value || '';
            }
            let guid = Math.floor(Math.random() * 10000) + '' + (new Date).getTime();
            storeManager.scope(guid, fileContent.data);
            return this.getTag(fileContent.name, 'HTML_STR', childrenStr, fileContent.attributes, {
                "data-scope-id": guid
            });
        }
        if (format === 'HTML') {
            return domJson;
        }
    };
    return new D();
})();