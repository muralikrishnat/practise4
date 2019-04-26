(function (sandbox) {
    var componentName = 'footer';
    var render = function () {
        // sandbox.subscribe('modal/open', function(){

        // });

        // sandbox.publish('modal/open');

        // sandbox.scope(elem, {
        //     "name": "murali"
        // });


        // sandbox.scope(elem);
    };
    var component = {
        name: componentName,
        render: render
    };
    sandbox.registerComponent(component);
})(sandbox);