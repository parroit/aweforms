'use strict';

var aweformsModule = require('../lib/aweforms.js');
var cheerio = require('cheerio');
var expect = require('chai').expect;

var hogan = require("hogan.js");
var _ = require('lodash');
require('chai').should();


describe('aweforms', function () {
    describe("module", function () {
        it("should load", function () {
            expect(aweformsModule).not.to.be.equal(null);
            expect(aweformsModule).to.be.a('object');

        });
    });

    //var Aweforms = aweformsModule.Aweforms;
    var testModel = {

        user: {
            test: "ciao",

            errors: {

                test: {
                    type: "test-error"
                }

            }
        },

        af: aweformsModule.newInstance({
            __ : function(key){
                switch(key){
                    case "user.test":
                        return "aLabel";
                    case "test-error":
                        return "a test error";
                    case "simple-error":
                        return "a simple error";
                    case "max %s val":
                        return "max 10 val";

                    default:
                        throw new Error("not defined:" +key);
                }

            }
        })
    };

    var expected = '<div class="field text-error">' +
        '<label for="user.test">' +
        'aLabel' +
        '</label>' +
        '<div>' +
        '<input type="text" id="user.test" name="test" value="ciao">' +
        '<span class="error">a test error</span>' +
        '</div>' +
        '</div>';

    function cloneTestModel() {
        var testModelErrors = _.cloneDeep(testModel);
        testModelErrors.af = testModel.af;
        testModelErrors.t = testModel.t;
        return testModelErrors;
    }

    describe("field", function () {
        it("wrap input in bt horizontal form", function () {
            var template = hogan.compile('{{#af.field}}<input type="text" id="user.test">{{/af.field}}');
            var result = template.render(testModel);
            expect(result).to.be.equal(expected);
        });

        function itShouldRenderError(error, expectedError) {
            var testModelErrors = cloneTestModel();
            testModelErrors.user.errors.test.type = error;

            var template = hogan.compile('{{#af.field}}<input type="text" id="user.test">{{/af.field}}');
            var result = template.render(testModelErrors);

            var $ = cheerio.load(result);
            var actualError = $("span.error").html();

            expect(actualError).to.be.equal(expectedError);
        }

        it("render simple errors", function () {
            itShouldRenderError("simple-error", "a simple error");
        });

        it("render errors with parameters", function () {
            itShouldRenderError("!'max %s val',10", "max 10 val");
        });

        it("should throws when id not defined", function () {
            expect(function(){

                hogan.compile('{{#af.field}}<input type="text">{{/af.field}}')
                    .render(testModel);

            }).to.throw('id not defined in field <input type="text">');
        });



        it("should throws when id doesn't contains all parts of qualified name", function () {
            function itShouldThrowFor(id){
                expect(function(){

                    hogan.compile('{{#af.field}}<input type="text" id="'+id+'">{{/af.field}}')
                        .render(testModel);

                }).to.throw('id should be fully qualified in field <input type="text" id="'+id+'">');

            }

            itShouldThrowFor("name");
            itShouldThrowFor("name.");
            itShouldThrowFor(".name");

        });
        it("set selected option when input type is select and value is in list", function () {

            var template = hogan.compile(
                '{{#af.field}}' +
                    '<select id="user.test">' +
                    '<option value="A">AA</option>' +
                    '<option value="B">BB</option>' +
                    '</select>' +

                    '{{/af.field}}'
            );

            var testModelSelect = _.cloneDeep(testModel);
            testModelSelect.user.test = "B";
            var result = template.render(testModelSelect);
            var $ = cheerio.load(expected);
            $("input").parent("div").html(
                '<select id="user.test" name="test">' +
                    '<option value="A">AA</option>' +
                    '<option value="B" selected="selected">BB</option>' +
                    '</select>' +
                    '<span class="error">a test error</span>'

            );
            //console.log($.html());
            expect(result).to.be.equal($.html());
        });

        it("set rendered selected option when input type is select and value is in list", function () {

            var template = hogan.compile(
                '{{#af.field}}' +
                    '<select id="user.test">' +
                        '{{#options}}<option value="{{v}}">{{t}}</option>{{/options}}' +
                    '</select>' +

                    '{{/af.field}}'
            );

            var testModelSelect = _.cloneDeep(testModel);
            testModelSelect.user.test = "B";
            testModelSelect.options = [

                {v:"A",t:"AA"},
                {v:"B",t:"BB"}
            ];
            var result = template.render(testModelSelect);
            var $ = cheerio.load(expected);
            $("input").parent("div").html(
                '<select id="user.test" name="test">' +
                    '<option value="A">AA</option>' +
                    '<option value="B" selected="selected">BB</option>' +
                    '</select>' +
                    '<span class="error">a test error</span>'

            );
            //console.log($.html());
            expect(result).to.be.equal($.html());
        });

        it("doesn't set errors if model is correct", function () {



            var testModelCorrect = _.cloneDeep(testModel);
            delete testModelCorrect.user.errors;
            var template = hogan.compile('{{#af.field}}<input type="text" id="user.test">{{/af.field}}');
            var result = template.render(testModelCorrect);
            var $ = cheerio.load(expected);
            $("div.field").removeClass("text-error");
            $("span.error").html("");

            expect(result).to.be.equal($.html());
        });

        it("set checked attr when input type is checkbox and value is true", function () {

            var template = hogan.compile('{{#af.field}}<input type="checkbox" id="user.test">{{/af.field}}');

            var testModelCheckBox = _.extend({}, testModel);
            testModelCheckBox.user.test = true;
            var result = template.render(testModelCheckBox);
            var $ = cheerio.load(expected);
            $("input")
                .attr("type", "checkbox")
                .attr("checked", "checked")
                .removeAttr("value");

            expect(result).to.be.equal($.html());
        });

        it("doesn't set checked attr when input type is checkbox and value is false", function () {

            var template = hogan.compile('{{#af.field}}<input type="checkbox" id="user.test">{{/af.field}}');

            var testModelCheckBox = _.extend({}, testModel);
            testModelCheckBox.user.test = false;
            var result = template.render(testModelCheckBox);
            var $ = cheerio.load(expected);
            $("input")
                .attr("type", "checkbox")
                .removeAttr("value");

            expect(result).to.be.equal($.html());
        });
    });
});
