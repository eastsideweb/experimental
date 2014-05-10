//
//   MODULE: typedefinition 
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: typedefinition.ts
//   DESCRIPTION: File containing the main psdb interface used by the server
//
//   HISTORY:
//     Date            By  Comment
//     2014 May 10th    NSA  Created
//
//
// Helps filter the PSDB types in the rest APIs endpoints

"use strict";

// This is called by the rest api endpoints while validating the types in 
// rest API endpoint
class typedefinition {
    private typeMap: any;

    constructor() {
        this.typeMap = { 'series': 'series', 'events': 'events', 'puzzles': 'puzzles', 'instructors': 'instructors', 'teams': 'teams', 'players': 'players' };
    }

    public checkValidType(type) {
        if (type) {
            return this.typeMap[type];
        }

        return undefined;
    }

    public getTypesAssociatedWithToken() {
        return this.typeMap.series;
    }

    public getTypesAssociatedWithStatus() {
        return this.typeMap.events;
    }

    public getTypesAssociatedWithActiveState() {
        return this.typeMap.series + ',' + this.typeMap.players + ',' + this.typeMap.puzzles + ',' + this.typeMap.instructors + ',' +
            this.typeMap.teams;
    }

    public getTypesWithAssociatedRelations() {
        return this.typeMap.teams;
    }

    public getTypesAssociatedWithTeams() {
        return this.typeMap.puzzles + ',' + this.typeMap.players;
    }
        
};

export = typedefinition