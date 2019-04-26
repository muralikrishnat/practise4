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
                        if (conditionFlag[c]){
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
    return new S();
})();