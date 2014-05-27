//
//   MODULE: connect.d.ts 
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: connect.d.ts
//   DESCRIPTION: File contains the typedefiniton for connect (middleware)
//
//   HISTORY:
//     Date            By  Comment
//     2014 May 19th    NSA  Created
//
//

declare module "connect" {
    export function json(): any;
    export function urlencoded(): any;
}