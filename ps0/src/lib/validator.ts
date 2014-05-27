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

var validator = {
    // Checks if the value contains only character type
    // Regex matches only characters, returns false for symbols and special character
    isCharactersOnly: function(value):boolean {
        var regPattern = new RegExp('^[a-zA-Z]+$');
        return (value && value.match(regPattern));
    },

    // Checks for valid mongodbid
    isValidId: function (value): boolean {
        var regPattern = new RegExp('^[0-9a-fA-F]{24}$');
        return (value && value.match(regPattern));
    },

    // Checks if the value is a string type and if its null or empty
    isValidString: function (value): boolean {
        return (typeof (value) === 'string' && value && !(/^\s*$/.test(value)));
    }

};

export = validator;