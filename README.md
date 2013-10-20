# aweforms [![Build Status](https://secure.travis-ci.org/parroit/aweforms.png?branch=master)](http://travis-ci.org/parroit/aweforms) [![Npm module](https://badge.fury.io/js/aweforms.png)](https://npmjs.org/package/aweforms)

__mustache lambdas to create bootstrap forms.__

It provides helper lambdas that encapsulates your input fields in useful ways,
removing boilerplate HTML code and speeding up development.

Could be used as [express](https://github.com/visionmedia/express) middleware or standalone.

## Features:

* render fields as bootstrap horizontal forms fields
    **Actually bootstrap is render via non provided less extensions.**
    See [an example of less code](https://github.com/parroit/ecm-revoluted/blob/master/public/stylesheets/account.less)
    to render fields as bootstrap horizontal forms, and [a template using it on ecm-revoluted](https://github.com/parroit/ecm-revoluted/blob/master/views/account.html)

* automatically compile value and name attribute
* support select and input fields of all types
* support textarea **TBD**
* render static forms
* render angular.js forms **TBD**





## Getting Started
Install the module with: `npm install aweforms --save`


## Documentation

Aweforms could be used as [express](https://github.com/visionmedia/express) middleware or standalone.


### Standalone usage:

```javascript
var aweforms = require('aweforms');
var hogan = require("hogan.js");

var testModel = {

    user: {
        test: "ciao",

        errors: {

            test: {
                type: "test-error"
            }

        }
    },
    af: aweforms.newInstance()
};

var template = hogan.compile('{{#af.field}}<input type="text" id="user.test">{{/af.field}}');
var result = template.render(testModel);
```

*result is:*

```html
    <div class="field text-error">
        <label for="user.test">user.test</label>
        <div>
            <input type="text" id="user.test" name="test" value="ciao">
            <span class="error">test-error</span>
        </div>
    </div>
```

### Express usage:

```javascript

...
//initialize the module
var aweforms = require("aweforms");
app.use(aweforms.init(i18n));

...

var testModel = {

    user: {
        test: "ciao",

        errors: {

            test: {
                type: "test-error"
            }

        }
    }
};

app.get('/user',function(res,req){
   res.render('user',testModel);
});

```
*assuming that user.html template is:*

```html
{{#af.field}}<input type="text" id="user.test">{{/af.field}}
```

*results will be:*

```html
    <div class="field text-error">
        <label for="user.test">user.test</label>
        <div>
            <input type="text" id="user.test" name="test" value="ciao">
            <span class="error">test-error</span>
        </div>
    </div>
```

### Translation of labels and errors

aweforms uses [i18n](http://github.com/mashpie/i18n-node) to render labels and
error text. If you provide a locales with compatible translation, they appear
translated accordingly.
For example, with this json to translate words:

```json
{
	"user.test": "Salutation",
	"test-error": "Invalid value",
}
```

Results of previous example should become:

```html
    <div class="field text-error">
        <label for="user.test">Salutation</label>
        <div>
            <input type="text" id="user.test" name="test" value="ciao">
            <span class="error">Invalid value</span>
        </div>
    </div>
```


You could customize translation by giving a i18n instance as first parameter of
`newInstance`. Otherwise a default instance is set up with this configuration:

```json
{
    directory: __dirname + '/locales'
}
```


## Examples
For an example of usage with Express js, see [ecm-revoluted](https://github.com/parroit/ecm-revoluted).
For an example of standalone usage, see [test file](https://github.com/parroit/aweforms/blob/master/test/aweforms_test.js)

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Please use mocha and grunt to test your code.
Existing test could be found on *test* folder.

## Release History

Please see (History.md)[History.md]

## License
Copyright (c) 2013 Andrea Parodi
Licensed under the MIT license.
See [license file](LICENSE-MIT) for details
