//
//   MODULE: PSDBClient
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: psdbClient.shell.ts
//   DESCRIPTION: This file is the base layout of the client side code, the shell module
//
//   HISTORY:
//     Date            By  Comment
//     2014 July 01    NSA  Created
// 
// Shell for PSDB client

/// <reference path="inc/jquery.d.ts"/>
module psdbClient {
    declare var dust;

    export module shell {

        //------------------- BEGIN PUBLIC METHODS -------------------
        export function initModule($container: JQuery) {
            // Map jQuery collections
            setJqueryMap($container);

            // Initialize dependant modules
            login.initModule(jqueryMap.$modal);
            series.initModule(jqueryMap.$content, jqueryMap.$modal, jqueryMap.$signoutButton);

            // Subscribe for login events
            $.gevent.subscribe(jqueryMap.$acct, 'psdbClient-login', onSeriesLogin);
            $.gevent.subscribe(jqueryMap.$acct, 'psdbClient-logout', onSeriesLogout);

            // Call series
            psdbClient.util.getRequestAsync(config.seriesUrl, renderSeriesTemplate);
        };
        // End PUBLIC method /initModule/
    }

        // ------------------- END PUBLIC METHODS ------------------------


        //----------------- START MODULE SCOPE VARIABLES ---------------
        var jqueryMap = {
                $container: null,
                $acct: null,
                $header: null,
                $modal: null,
                $content: null,
                $signoutButton: null
            };
        //----------------- END MODULE SCOPE VARIABLES ---------------


        //------------------- BEGIN UTILITY METHODS ------------------

        //-------------------- END UTILITY METHODS -------------------


        //--------------------- BEGIN DOM METHODS --------------------
        // Begin DOM method /setJqueryMap/
        function setJqueryMap($container: JQuery) {
            jqueryMap = {
                $container: $container,
                $acct: $container.find('.psdbClient-shell-head-acct'),
                $header: $container.find('.psdbClient-shell-head'),
                $modal: $container.find('.psdbClient-shell-modal'),
                $content: $container.find('.psdbClient-shell-main-content'),
                $signoutButton: $container.find('#signoutButton')
            };
        };
        // End DOM method /setJqueryMap/

        function onTapSeries(event) {
            //call login in for session
            var seriesId = $(this).attr('id');
            login.initializeSession(seriesId);
            return false;
        };

        function onSeriesLogin(event, data) {
            //jqueryMap.$acct.text(data);
            if (data) {
                // Remove attached events
                jqueryMap.$content.find('a').off('utap.utap', onTapSeries);
                // Initalize the series
                series.loadSeries(data);
            }
            else {
                var error: IPSDBClientError = { "title": "Unable to retrieve session id"};
                util.handleError(error, jqueryMap.$modal);
            }
        };
        function onSeriesLogout(event, logout_user) {
            jqueryMap.$acct.text('');
            // Call series
            psdbClient.util.getRequest(config.seriesUrl, renderSeriesTemplate);
        };

        //--------------------- END DOM METHODS ----------------------

        //------------------- BEGIN EVENT HANDLERS -------------------
        // Begin Event handler /onResize/
        // End Event handler /onResize/

        //-------------------- END EVENT HANDLERS --------------------
        
        //---------------------- BEGIN CALLBACKS ---------------------
    function renderSeriesTemplate(err: any, data: JSON) {

            if (err !== null) {
                var error: IPSDBClientError = { 'title': err.title, 'details': err.details, 'code': null };
                util.handleError(error, jqueryMap.$modal);
            }
            else {
                util.renderTemplate(config.listTemplate, { items: data }, jqueryMap.$content);
                jqueryMap.$content.find('a').on('utap.utap', onTapSeries);
                jqueryMap.$signoutButton.hide();
            }
        }
    //----------------------- END CALLBACKS ----------------------
}