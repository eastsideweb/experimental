//
//   MODULE: PSDB
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: validator.ts
//   DESCRIPTION: This file contains the necessary functions for all validations
//
//   HISTORY:
//     Date            By  Comment
//     2014 May 25th    NSA  Created
// 
// Provides validations for strings, characters and JSON objects
import path = require('path');

class Validator {
    private fsHandle = null;
    private jsonValidator = null;
    private schemaUri = 'http://eastsideweb.github.io/schema/';
    private schemaPath = '';

    constructor(value: Array<string>) {
        this.fsHandle = require('fs');
        // JSV supports only upto JSON schema draft-03
        this.jsonValidator = require('JSV').JSV.createEnvironment('json-schema-draft-03');

        this.loadSchema(value);
    }

    // Validates if input contains only characters, special characters and numbers are not allowed
    public static isCharactersOnly(value: string): boolean {
        var regPattern = new RegExp('^[a-zA-Z]+$');
        if (value) {
            var arrayMatch = value.match(regPattern);
            return (arrayMatch && arrayMatch.length !== 0);
        }
        return false;
    }

    // Validates if input is a valid mongo db id
    public static isValidId(value: string): boolean {
        var regPattern = new RegExp('^[0-9a-fA-F]{24}$');
        if (value) {
            var arrayMatch = value.match(regPattern);
            return (arrayMatch && arrayMatch.length !== 0);
        }
        return false;       
    }

    // Validates if its a string, invalid for null and empty strings.
    public static isValidString(value: string): boolean {
        return (typeof (value) === 'string' && value && !(/^\s*$/.test(value)));
    }

    // Validates if it is an empty json object
    public static isEmptyJson(value: Object): boolean {
        return (value === null || Object.keys(value).length === 0);                   
    }

    // Loads the JSON schema for validation and registers it with a predefined URI schema
    private loadSchema(value: Array<string>): void {
        var schemaPath: string;
        for (var i = 0; i < value.length; i++) {
            schemaPath = path.join(__dirname, "..", "public", "schema", value[i] + '.json');

            this.loadSchemaFromPath(value[i], schemaPath, this.getSchemaRefUri(value[i]));
        }
    }

    // Validates the json object against the registered schema. Returns a error array if found invalid.
    public checkSchema(type: string, jsonBody: JSON, callback: (err: any) => void): void {
        var schemaRefUri = this.getSchemaRefUri(type);
        // Find the JSON schema by serarching it using the registered schema uri
        var schemaJson = this.jsonValidator.findSchema(schemaRefUri);

        // Check if a JSON schema exists
        // If present, then validate the input JSON according to the defined schema
        // Return the error object. If the input JSON is invalid, the error object will contain an array with details of the error
        if (schemaJson) {
            var result = this.jsonValidator.validate(jsonBody, schemaJson);
            callback(result.errors);
        }
        else {
            callback([new Error("No valid schema found against which to validate")]);
        }
    }

    // Reads the schema file from the given path
    // Associates it with a schema URI
    // jsv.CreateSchema, reads and validates the schema and registers it against the given URI
    // The registration of JSON schema against a schema URI helps it validate schemas referencing other schemas in their JSON
    // Ex: series.json schema file is parsed and registered under "http://eastsideweb.github.io/schema/series.json" schema uri
    private loadSchemaFromPath(schemaName: string, schemaPath: string, schemaRefUri: string) {
        if (this.fsHandle.existsSync(schemaPath)) {
            this.jsonValidator.createSchema(JSON.parse(this.fsHandle.readFileSync(schemaPath, 'utf8')), undefined, schemaRefUri);
        }
        else {
            console.log("schemaPath not found: " + schemaPath);
        }
    }

    private getSchemaRefUri(schemaName: string): string {
        return this.schemaUri + schemaName + '.json';
    }
}

export = Validator;

//Usage
//import validator = require('../lib/validator');
//var jsonValidator = new validator(["annotations", "events", "instructors", "players", "puzzlestates", "series"]);

//jsonValidator.checkSchema(request.params.type, request.body, function (err) {
//    console.log('error is' + err);
//    if (err && err.length !== 0) {
//        console.log(err);
//        next(err);
//    }
//    else {
//        response.json({});
//    }
//});