var sandbox = (function () {
    var components = [],
        pageUrl = '',
        pageMeta = {};

    var S = function () {
        this.config = {};
    };
    S.prototype.registerComponent = function (component) {
        componentManager.register(component);
    };
    S.prototype.bootstrapComponents = function () {
        components.forEach(c => {
            c.render();
        });
    };
    S.prototype.getAllComponents = function () {
        return componentManager.getAllComponents();
    };
    S.prototype.nextTick = function (cb, timeout) {
        setTimeout(cb, timeout || 0);
    };
    S.prototype.load = function (url) {
        pageUrl = url;
    };
    S.prototype.getPageMeta = function () {
        return pageMeta;
    };
    S.prototype.getPageUrl = function () {
        return pageUrl;
    };
    S.prototype.scope = function (elem, scope) {
        return storeManager.scope(elem, scope)
    };
    S.prototype.applyScope = function (elem, scope) {
        scopeManager.applyScope(elem, scope);
    };
    S.prototype.tryCatch = function (fn) {
        try {
            fn();
        } catch (e) {
            //swallow
        }
    };
    S.prototype.renderPage = function (html) {
        let $pageWrapper = document.querySelector('.page-wrapper');
        pageMeta = html;
        $pageWrapper.innerHTML = domManager.convert(html, 'HTML_STR');

        scopeManager.applyScope($pageWrapper, pageMeta.data);
        sandbox.nextTick(() => {
            let pagecomps = document.querySelectorAll('[ta-component]');
            let uniqueComps = new Set();
            for (let i = 0; i < pagecomps.length; i++) {
                let comp = pagecomps[i];
                uniqueComps.add(comp.getAttribute('ta-component'));
            }
            uniqueComps.forEach(comp => {
                componentManager.load(comp);
            });
        });
    };

    S.prototype.openModal = function (modalHtml) {
        var $body = document.querySelector('body');
        var modalOverlay = document.querySelector('.modal-overlay');
        if (!modalOverlay) {
            modalOverlay = document.createElement('DIV');
            modalOverlay.className = 'modal-overlay';
            modalOverlay.innerHTML = `
                <div class="modal-content">
                    <div class="d-flex flex-end">
                        <button onclick="sandbox.closeModal()"> Close Modal </button>
                    </div>
                    <div class="modal-html">
                `+
                modalHtml
                + `
                    </div>
                </div>
            `;
        }
        $body.className = 'modal-open';
        $body.appendChild(modalOverlay);
        return modalOverlay;
    };
    S.prototype.closeModal = function () {
        var $body = document.querySelector('body');
        var modalOverlay = document.querySelector('.modal-overlay');
        modalOverlay.className = modalOverlay.className + ' hidden ';
        $body.className = $body.className.replace('modal-open', '');
    };

    S.prototype.onPageLoad = function (url) {
        // sandbox.bootstrapComponents();
        pageUrl = url;
        apiManager.get({
            url: '/api/page?pageUrl=' + sandbox.getPageUrl()
        }).then((html) => {
            sandbox.renderPage(html);
        });
    };

    // TODO: move this to seperate file
    var pubSubMap = {};
    S.prototype.subscribe = function (eventName, fn) {
        if (!pubSubMap[eventName]){
            pubSubMap[eventName] = [];
        }
        fn.timeStamp = (Math.random() * 1000) + '' + (new Date).getTime();
        pubSubMap[eventName].push(fn);

        return {
            timeStamp: fn.timeStamp
        };
    };
    S.prototype.publish = function (eventName, data) {
        if (pubSubMap[eventName] && pubSubMap[eventName] instanceof Array) {
            pubSubMap[eventName].forEach(fn => {
                fn(data);
            });
        }
    };
    S.prototype.unSubscribe = function (eventName, subMeta) {
        if (pubSubMap[eventName] && pubSubMap[eventName] instanceof Array) {
            let spliceIndex = null;
            pubSubMap[eventName].forEach((f, index) => {
                if (f.timeStamp == subMeta){
                    spliceIndex = index;
                }
            });
            if (spliceIndex) {
                pubSubMap[eventName].splice(spliceIndex, 1);
            }
        }
    };
    let sandbox = new S();
    return sandbox;
})();
