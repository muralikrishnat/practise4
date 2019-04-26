(function () {
    var filesToLoad = [
        { src: "/js/global/store-manager.js", loaded: false, required: true },
        { src: "/js/global/scope-manager.js", loaded: false, required: true },
        { src: "/js/global/dom-manager.js", loaded: false, required: true },
        { src: "/js/global/component-manager.js", loaded: false, required: true },
        { src: "/js/global.js", loaded: false, required: true },
        { src: "/js/sandbox.js", loaded: false, required: true }
    ];
    var body = document.querySelector('body');
    var checkAll = function () {
        var loadedFiles = filesToLoad.filter(f => f.loaded);
        if (loadedFiles.length === filesToLoad.length) {
            window.onSandboxLoaded = true;
            if (window.sandboxload) {
                window.sandboxload();
            }
        }
    };
    filesToLoad.forEach(file => {
        let scriptTag = document.createElement('SCRIPT');
        scriptTag.src = file.src;
        scriptTag.onload = function () {
            file.loaded = true;
            checkAll();
        };
        body.appendChild(scriptTag);
    });
})();