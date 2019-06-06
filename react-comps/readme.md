# Re-usable React component skeleton

This repo will be initial process/stucture of the Re-Usable components project.


## How to Run

Make sure you have installed the nodejs (>=10.15.3) in your machine.


1. Download the folder and unzip the folder into any folder.
2. open the terminal/command prompt and execute below commands.

Install the required npm packages with following command
```bash
npm install
```

Run the application using below command.
```bash
node index.js
```

3. Application will start running on port *3436*



## How to Add new Component

1. Add new folder under the **comps** with the required name most likely component name for e.g., `pagination` or `header` or `footer`...etc.,

2. Add **`JSX`** file with more meaning full name for the copmonent e.g:- `header.jsx` or `footer.jsx` or `pagination.jsx` ...etc., basic skeleton for the component will be as examples inside this project.


3. Add **`SCSS`** file with more meaning full name for the component e.g:- `header.scss` or `footer.scss`

4. Update the `meta.json` under the `comps` folder file with component details like conponent name, files using for this component for e.g:-

```json
{
    "components": [
        ...
        {
            "name": "header",
            "files": [
                {
                    "fileName": "header.jsx",
                    "fileType": "JSX",
                    "tag": "SCRIPT"
                },
                {
                    "fileName": "header.scss",
                    "fileType": "SCSS",
                    "tag": "STYLE"
                }
            ],
            "config": {},
            "data": {}
        },
        ...
    ]
}
```
5. Add component to `index.html` for testing purpose as below code,

```html
<div class="page-wrapper">
    <!-- START: Add your component here -->
    <!-- ... -->
    <div ta-component="header" class="header"></div>
    <!-- END: Add your component here -->
</div>
```

