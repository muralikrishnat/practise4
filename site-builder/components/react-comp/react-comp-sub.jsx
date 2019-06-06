
export default class ReactCompSub extends React.Component {
    
    render() {
        return (<h2 > React Sub Component</h2>);
    }
}

// DON'T CHANGE BELOW CODE
// (function (sandbox) {
//     var componentName = 'react-comp-sub';
//     var render = function (data) {
//         var elems = document.querySelectorAll('[ta-component="' + componentName + '"]');
//         if (elems && elems.length > 0) {
//             elems.forEach((elem) => {
//                 ReactDOM.render(<ReactComp />, elem);
//             });
//         }
//     };
//     var component = {
//         name: componentName,
//         render: render
//     };
//     sandbox.registerComponent(component);
// })(sandbox);
// DON'T CHANGE ABOVE CODE
