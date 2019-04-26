# practise4
Practise4


## How to add component
1.Add component under the component folder (html.html,scripts.js, style.less).

html.html

``` html
<div> Component code </div>
```

scripts.js

``` javascript
(function (sandbox) {
    var componentName = 'header';
    var render = function () {
        var elems = document.querySelectorAll('[ta-component="' + componentName + '"]');
        if (elems && elems.length > 0) {
            elems.forEach((elem) => {

            });
        }
    };
    var component = {
        name: componentName,
        render: render
    };
    sandbox.registerComponent(component);
})(sandbox);
```

style.less
``` css
.component-name {
    font-size: 12px;
}
```


2.Update the meta.json file under the components folder witl following details.

/components/meta.json

``` json
// file types: HTML, LESS/CESS , JS
// tag: HTML, STYLE, SCRIPT
{
    "name": "header", //component name
    "files": [ //files used for component
        {
            "fileName": "html.html", // file used for html
            "fileType": "HTML", // file type
            "tag": "HTML"
        },
        {
            "fileName": "style.less",
            "fileType": "LESS",
            "tag": "STYLE"
        },
        {
            "fileName": "scripts.js",
            "fileType":"JS",
            "tag":"SCRIPT"
        }
    ]
}
```

