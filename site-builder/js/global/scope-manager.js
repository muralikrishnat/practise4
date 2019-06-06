var scopeManager = (function () {
    var S = function () {
        this.config = {};
    };
    S.prototype.applyScope = function (scopeElem, scope) {
        if (scopeElem) {
            scopeElem.querySelectorAll('[ta-bind]').forEach(elem => {
                let propName = elem.getAttribute('ta-bind');
                var scopeValue = scope[propName];
                if (scopeValue) {
                    elem.innerHTML = scopeValue;
                }
            });
            scopeElem.querySelectorAll('[ta-if]').forEach(elem => {
                let condition = elem.getAttribute('ta-if');
                let variablesStr = 'var ' + Object.keys(scope).map(k => {
                    return k + '=' + JSON.stringify(scope[k]);
                }).join(',') + ';';
                let fnToExecute = new Function(`
                    ${variablesStr}
                    return ${condition}; 
                `);
                try {
                    var conditionFlag = fnToExecute();
                } catch (e) {
                    //swallow
                }
                if (!conditionFlag) {
                    elem.className = elem.className + ' hidden';
                }
            });
            scopeElem.querySelectorAll('[ta-attr]').forEach(elem => {
                let condition = elem.getAttribute('ta-attr');
                let variablesStr = 'var ' + Object.keys(scope).map(k => {
                    return k + '=' + JSON.stringify(scope[k]);
                }).join(',') + ';';

                let fnToExecute = new Function(`
                    ${variablesStr}
                    return ${condition}; 
                `);
                try {
                    var conditionFlag = fnToExecute();
                    Object.keys(conditionFlag).forEach(c => {
                        if (conditionFlag[c]) {
                            elem.setAttribute(c, true);
                        } else {
                            elem.removeAttribute(c);
                        }
                    });
                } catch (e) {
                    //swallow
                }
            });

            this.scanElement(scopeElem, scope);

        }
    };
    S.prototype.executeCode = function (code, scope) {
        let variablesStr = 'var ' + Object.keys(scope).map(k => {
            return k + '=' + JSON.stringify(scope[k]);
        }).join(',') + ';';
        let codeToExecute = code, parsedCode = code;
        try {
            var fnToExecute = new Function(variablesStr + ' return `' + codeToExecute + '`;');
            parsedCode = fnToExecute();
            parsedCode = parsedCode.replace('undefined', '');
        } catch (e) {
            //swallow
        }
        return parsedCode;
    };
    S.prototype.scanElement = function (elem, scope) {
        for (let i = 0; i < elem.attributes.length; i++) {
            let attribute = elem.attributes[i];
            if (attribute.value && attribute.value.indexOf('${') >= 0) {
                attribute.value = this.executeCode(attribute.value, scope).replace('undefined', '');
            }
        }
        if (elem.children.length > 0) {
            for (let j = 0; j < elem.children.length; j++) {
                let item = elem.children[j];
                this.scanElement(item, scope);
            }
        } else {
            elem.innerHTML = this.executeCode(elem.innerHTML, scope).replace('undefined', '');
        }

    }
    S.prototype.applyBind = function () {

    };

    S.prototype.liteTE = function (scopeElem, scope, templateStr) {
        var re = /{{(.+?)}}/g,
            reExp = /(^( )?(var|if|for|else|switch|case|break|do|while|{|}|;))(.*)?/g,
            code = 'var r=[];\n',
            result,
            match,
            htmlArr;

        var isHTML = RegExp.prototype.test.bind(/(<([^>]+)>)/i);
        // split entire template into individual lines
        var htmlArr = templateStr.split(/[\n\r]/g);

        var construct = function (line, js) {
            js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
                (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
            return construct;
        }

        for (var i = 0; i < htmlArr.length; i++) {
            //check if line is html tag or not
            if (isHTML(htmlArr[i])) {
                //if html then check for '{{}}' expression
                if (htmlArr[i].match(re)) {
                    var cursor = 0;
                    while (match = re.exec(htmlArr[i])) {
                        construct(htmlArr[i].slice(cursor, match.index))(match[1].trim(), true);
                        cursor = match.index + match[0].length;
                    }
                    construct(htmlArr[i].substr(cursor, html.length - cursor));
                } else {
                    //if not expression simply concatenate as string
                    code = code + 'r.push("' + htmlArr[i] + '");\n';
                }
            } else {
                // if not html, concatenate as it is
                code = code + htmlArr[i] + '\n';
            }
        }

        code = (code + 'return r.join("");').replace(/[\r\t\n]/g, ' ');

        var bindContext = function (context, appendTo) {
            try {
                result = new Function(code).call(context);
            }
            catch (err) {
                console.error("'" + err.message + "'", " in \n\nCode:\n", code, "\n");
            }
            let node = (new DOMParser()).parseFromString(result, 'application/xml').children[0];
            document.querySelector(appendTo).appendChild(node);
        }

        elem.innerHTML = '';
        bindContext(scope, elem);
    };
    return new S();
})();