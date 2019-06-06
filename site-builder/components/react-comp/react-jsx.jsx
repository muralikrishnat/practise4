
class ReactCompSub extends React.Component {
    render() {
        return (<h2 > React Sub Component</h2>);
    }
}

class ReactComp extends React.Component {
    sendData() {
        sandbox.scope(elem, { data: "test" });
    }
    render() {
        return (
            <div>
                <h1> Hello world! from React 2</h1>
                <ReactCompSub/>
            </div>
        );
    }
}

// DON'T CHANGE BELOW CODE
(function (sandbox) {
    var componentName = 'react-comp';
    var render = function (data) {
        var elems = document.querySelectorAll('[ta-component="' + componentName + '"]');
        if (elems && elems.length > 0) {
            elems.forEach((elem) => {
                console.log('scope', sandbox.scope(elem));
                elem.classList.add('component');
                elem.classList.add(componentName);
                ReactDOM.render(<ReactComp />, elem);
            });
        }
    };
    var component = {
        name: componentName,
        render: render
    };
    sandbox.registerComponent(component);
})(sandbox);
// DON'T CHANGE ABOVE CODE
