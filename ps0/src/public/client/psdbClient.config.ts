//
//   MODULE: PSDBClient
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: psdbClient.config.ts
//   DESCRIPTION: This file is the entry point of the client side code, initializes the shell module
//
//   HISTORY:
//     Date            By  Comment
//     2014 July 01    NSA  Created
// 
// Configuration for PSDB client

module psdbClient {
    export var config = {
        listTemplate: 'public/client/templates/listTemplate',
        objlistTemplate: 'public/client/templates/objlistTemplate',
        objtypeTemplate: 'public/client/templates/objtypeTemplate',
        objectTemplate: 'public/client/templates/objectTemplate',
        modalTemplate: 'public/client/templates/modalTemplate',
        loginTemplate: 'public/client/templates/loginTemplate',
        addobjTemplate: 'public/client/templates/addobjTemplate',
        seriesUrl: '/series',
        sessionUrl: '/series/{id}/session',
        eventsUrl: '/events',
        releaseTokenUrl: '/series/{id}/session/{token}',
        deleteObjUrl: '/{type}/{id}',
        timeout:8000
    };
}