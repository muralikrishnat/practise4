(function (sandbox) {
    let componentName = 'pagination';
    var render = function () {
        var elems = document.querySelectorAll('[ta-component="' + componentName + '"]');
        if (elems && elems.length > 0) {
            elems.forEach((elem) => {
                elem.innerHTML = '';
                let pageCount = elem.getAttribute('page-count') - 0;
                var fragment = document.createDocumentFragment();
                for (let i = 0; i < pageCount; i++) {
                    var pageNo = document.createElement('DIV');
                    pageNo.textContent = (i + 1) + '';
                    fragment.appendChild(pageNo);
                }
                elem.appendChild(fragment);
            });
        }
    };
    var component = {
        name: componentName,
        render: render
    };
    sandbox.registerComponent(component);
})(sandbox);