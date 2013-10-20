'use strict';

var cheerio = require('cheerio');
var _ = require('lodash');
var hogan = require("hogan.js");

exports.newInstance = function (i18n) {
    var aweforms = new Aweforms(i18n);
    aweforms.field = _.bind(aweforms.field, aweforms);
    return  aweforms;
};

var Aweforms = function (i18n) {

    if (i18n) {
        //console.dir("custom i18n");
        this.i18n = i18n;

    } else {
        //console.dir("require i18n");
        this.i18n = require("i18n");
        this.i18n.configure({
            directory: __dirname + '/locales'
        });

    }
};


exports.init = function (i18n) {
    return function (req, res, next) {
        // mustache helper
        res.locals.af = exports.newInstance(i18n);

        next();
    };
};


function getField(context, $input, text) {
    var qualifiedId = $input.attr("id");

    if (!qualifiedId) {
        throw new Error("id not defined in field " + text);
    }

    var idParts = qualifiedId.split(".");

    var fieldName = idParts[1];
    if (!fieldName) {
        throw new Error("id should be fully qualified in field " + text);
    }

    var modelName = idParts[0];
    if (!modelName) {
        throw new Error("id should be fully qualified in field " + text);
    }

    var modelValue = context[modelName];
    var errors = modelValue.errors;
    var fieldError = errors && errors[fieldName] && errors[fieldName].type;

    var error = getError(fieldError);


    return {
        modelName: modelName,
        name: fieldName,
        qualifiedId: qualifiedId,
        modelValue: modelValue,
        fieldValue: modelValue[fieldName],
        error: error
    };
}

function getError(fieldError) {
    var error;
    if (fieldError) {
        if (fieldError.indexOf("!") == 0) {
            error = eval('[' + fieldError.substring(1) + ']');

        } else {
            error = [fieldError];
        }
    } else {
        error = [""];
    }
    return error;
}
function alterInput(field, $input) {
    var modelValue = field.modelValue;
    var fieldValue = field.fieldValue;

    $input.attr("name", field.name);

    if ($input.is("select")) {
        if (fieldValue) {
            $input.find("option").each(function () {
                if (this.attr("value") == fieldValue)
                    this.attr("selected", "selected");
            });
        }
    } else if ($input.attr("type").toLowerCase() == "checkbox") {

        if (fieldValue) {
            $input.attr("checked", "checked")
        }
    } else {
        $input.attr("value", fieldValue);
    }
    return modelValue;
}


function renderTemplate(context,modelField, self, templateText) {
    var error,errorClass;

    if (modelField.error && modelField.error.length && modelField.error[0]) {
        error = self.i18n.__.apply(context, modelField.error);
        errorClass = " text-error";
    }
    else {
        error = "";
        errorClass = "";
    }

    var label = self.i18n.__.call(context, modelField.qualifiedId);

    return [
        '<div class="field', errorClass, '">',
        '<label for="', modelField.qualifiedId, '">', label, '</label>',
        '<div>',
        templateText.html(),
        '<span class="error">', error, '</span>',
        '</div>',
        '</div>'
    ].join("");
}

Aweforms.prototype.field = function () {
    var self = this;

    //noinspection JSUnusedLocalSymbols
    return function (text, render) {
        var template = hogan.compile(text);
        var innerResult = template.render(this);

        var $ = cheerio.load(innerResult);
        var $input = $("input");

        if (!$input.length)
            $input = $("select");

        var field = getField(this, $input, text);

        alterInput(field, $input);


        return renderTemplate(this,field, self, $);
    }
};

