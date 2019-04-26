(function (sandbox) {
    var componentName = 'header';
    var render = function (data) {
        var elems = document.querySelectorAll('[ta-component="' + componentName + '"]');
        if (elems && elems.length > 0) {
            elems.forEach((elem) => {
                let scopeData = sandbox.scope(elem.getAttribute('data-scope-id'));
                elem.querySelector('.js-val').innerHTML = "Value from Script " + scopeData.logo;
                sandbox.applyScope(elem, scopeData);
            });
        }
    };
    var component = {
        name: componentName,
        render: render
    };
    sandbox.registerComponent(component);

    
})(sandbox);