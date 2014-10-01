//
//   MODULE: PSDBClient
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: psdbClient.ts
//   DESCRIPTION: This file is the entry point of the client side code, initializes the shell module
//
//   HISTORY:
//     Date            By  Comment
//     2014 July 01    NSA  Created
// 
// Base class for PSDB client

/// <reference path="inc/jquery.d.ts"/>

module psdbClient {
    // Defines a format for error to be represented
    export interface IPSDBClientError {
        details?: string;
        title: string;
        code?: number;
    }

    // Iniatize the shell module
    export function initModule($container: JQuery) {
        shell.initModule($container);
    }
}