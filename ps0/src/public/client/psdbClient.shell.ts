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
/// <reference path="inc/jqueryuriAnchor.d.ts"/>
module psdbClient {
    declare var dust;

    export module shell {

        //------------------- BEGIN PUBLIC METHODS -------------------
        export function initModule($container: JQuery) {
            // Map jQuery collections
            setJqueryMap($container);

            // configure uriAnchor to use our schema
            $.uriAnchor.configModule({
                schema_map: configMap.anchor_schema_map
            });

            // Initialize dependant modules
            login.initModule(jqueryMap.$modal);
            series.initModule(jqueryMap.$content, jqueryMap.$modal, jqueryMap.$signoutButton);

            // Subscribe for login events
            $.gevent.subscribe(jqueryMap.$acct, 'psdbClient-login', onSeriesLogin);
            $.gevent.subscribe(jqueryMap.$acct, 'psdbClient-logout', onSeriesLogout);

            $(window).bind('hashchange', onHashChange)
                .trigger('hashchange'); // This will make sure the appropriate state is loaded based on current anchor

        }
        // Begin DOM method /changeAnchorPart/
        // Purpose    : Changes part of the URI anchor component
        // Arguments  :
        //   * arg_map - The map describing what part of the URI anchor
        //     we want changed.
        // Returns    :
        //   * true  - the Anchor portion of the URI was updated
        //   * false - the Anchor portion of the URI could not be updated
        // Actions    :
        //   The current anchor rep stored in stateMap.anchor_map.
        //   See uriAnchor for a discussion of encoding.
        //   This method
        //     * Creates a copy of this map using copyAnchorMap().
        //     * Modifies the key-values using arg_map.
        //     * Manages the distinction between independent
        //       and dependent values in the encoding.
        //     * Attempts to change the URI using uriAnchor.
        //     * Returns true on success, and false on failure.
        //
        export function changeAnchorPart(arg_map) {

            var
                anchor_map_revise = copyAnchorMap(),
                bool_return = true,
                key_name, key_dep, key_name_dep, arg_map_dep_obj, anchor_revise_dep_obj:any = {};

            // Begin merge changes into anchor map
            KEYVAL:
            for (key_name in arg_map) {
                if (arg_map.hasOwnProperty(key_name) && arg_map[key_name] !== null) {

                    // skip dependent keys during iteration
                    if (key_name.indexOf('_') === 0) { continue KEYVAL; }

                    // update independent key value
                    anchor_map_revise[key_name] = arg_map[key_name];

                    // update matching dependent key
                    key_name_dep = '_' + key_name;
                    if ((arg_map[key_name_dep]) && (arg_map[key_name_dep] !== null)) {
                        arg_map_dep_obj = arg_map[key_name_dep];
                        for (key_dep in arg_map_dep_obj) {
                            if (arg_map_dep_obj.hasOwnProperty(key_dep) && arg_map_dep_obj[key_dep] !== null) {
                                anchor_revise_dep_obj[key_dep] = arg_map_dep_obj[key_dep];
                            }
                        }
                     anchor_map_revise[key_name_dep] = anchor_revise_dep_obj;
                    }
                    else {
                        delete anchor_map_revise[key_name_dep];
                        delete anchor_map_revise['_s' + key_name_dep];
                    }
                }
            }
            // End merge changes into anchor map

            // Begin attempt to update URI; revert if not successful
            try {
                $.uriAnchor.setAnchor(anchor_map_revise, null, true);
            }
            catch (error) {
                // replace URI with existing state
                $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
                bool_return = false;
            }
            // End attempt to update URI...

            return bool_return;
        }
      // End DOM method /changeAnchorPart/
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
        },
        stateMap = {
            anchor_map: null
        },
        configMap = {
            /* A possible valid anchor map:
            #series=1234:type,events|id,eventId1|subtype,players|roleType:player
            */
            anchor_schema_map: {
                series: true,
                _series: {
                    type: { 'instructors': true, 'events': true, 'players': true, 'teams': true, 'puzzles': true },
                    id: true,
                    subtype: true,
                    roletype: { 'administrator': true, 'instructor': true, 'player': true }
                },
            }
        };

        //----------------- END MODULE SCOPE VARIABLES ---------------


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
        }
        // End DOM method /setJqueryMap/

        function onTapSeries(event) {
            //call login in for session
            var seriesId = $(this).attr('id');
            //login.initializeSession(seriesId);
            // We should just set the anchor part correctly and then let the onHashChange do the right thing
 //           changeAnchorPart({ series: seriesId });
            return false;
        }

        function onSeriesLogin(event, data) {
            //jqueryMap.$acct.text(data);
            if (data) {
                // Remove attached events
                //jqueryMap.$content.find('a').off('utap.utap', onTapSeries);
                // Initalize the series
                series.loadSeries(data);
            }
            else {
                var error: IPSDBClientError = { "title": "Unable to retrieve session id"};
                util.handleError(error, jqueryMap.$modal);
            }
        }
        function onSeriesLogout(event, logout_user) {
            jqueryMap.$acct.text('');
            // Call series
            psdbClient.util.getRequest(config.seriesUrl, renderSeriesTemplate); //TODO: should this be Async or sync?
        }



    //--------------------- END DOM METHODS ----------------------

    //------------------- BEGIN EVENT HANDLERS -------------------
    // Begin Event handler /onResize/
    // End Event handler /onResize/


    // Begin Event handler /onHashChange/
    function onHashChange(event: any) {
        var s_anchorMap: string;
        var
            _s_series_previous, _s_series_proposed, seriesId_proposed,seriesId_previous,
            anchor_map_proposed,
            is_ok = true,
            anchor_map_previous = copyAnchorMap();

        // attempt to parse anchor
        try {
            anchor_map_proposed = $.uriAnchor.makeAnchorMap();
            //alert('onHashChange called with ' + JSON.stringify(anchor_map_proposed));
            // Knowing that makeAnchorMap doesnt really do any validation, calling makeAnchorString which does the validation  :(
            s_anchorMap = $.uriAnchor.makeAnchorString(anchor_map_proposed);
        }
        catch (error) {
            alert('makeAnchorString returned err: ' + error);
            $.uriAnchor.setAnchor(anchor_map_previous, null, true);
            return false;
        }

        //TODO: clean up this logic that takes care of the first time loading
        if (stateMap.anchor_map === null) {
            // First load
            // Check if proposed map has any series information
            if (anchor_map_proposed.series === null || anchor_map_proposed.series === undefined || anchor_map_proposed.series === {}) {
                // Call series
                stateMap.anchor_map = anchor_map_proposed;
                psdbClient.util.getRequestAsync(config.seriesUrl, renderSeriesTemplate);
                return false;
            }
        }

        stateMap.anchor_map = anchor_map_proposed;

        // convenience vars
        seriesId_previous = anchor_map_previous.series; // the previous seriesId could be null
        seriesId_proposed = anchor_map_proposed.series; // the proposed seriesId could be null
        _s_series_previous = anchor_map_previous._s_series; //could be null
        _s_series_proposed = anchor_map_proposed._s_series; //could be null

        // Begin adjust series component if changed
        if (!anchor_map_previous
            || _s_series_previous !== _s_series_proposed
            ) {
            // something has changed
            // notify the series component 
            // Possible state changes:
            if (seriesId_previous !== seriesId_proposed
                || series.getCurrentSeriesId() !== seriesId_proposed /* For some reason, the state of the series obj is not in sync with the anchor, correct it*/
                ) {
                series.unloadSeries(); // This is a synchronous operation
                if (seriesId_proposed !== null && seriesId_proposed !== undefined) {
                    //We have a proposed seriesId, initialize the session with this id
                    login.initializeSession(seriesId_proposed, anchor_map_proposed._series);
                }
                else {
                    // No proposed seriesId, load the series list
                    psdbClient.util.getRequestAsync(config.seriesUrl, renderSeriesTemplate);
                }
            }
            else {
                // SeriesId has not changed, the subpart has changed. Update the series component
                is_ok = series.updateSeries(anchor_map_proposed._series /* could be null */);
            }
            //***********************************
                //default:
                //    spa.series.setSliderPosition('closed');
                //    delete anchor_map_proposed.series;
                //    $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
        }
        // End adjust series component if changed

        // Begin revert anchor if slider change denied
        if (!is_ok) {
            if (anchor_map_previous) {
                $.uriAnchor.setAnchor(anchor_map_previous, null, true);
                stateMap.anchor_map = anchor_map_previous;
            }
            else {
                delete anchor_map_proposed.series;
                delete anchor_map_proposed._series;
                delete anchor_map_proposed._s_series;
                $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
            }
        }
        // End revert anchor if slider change denied

        return false;
    }
        //-------------------- END EVENT HANDLERS --------------------
        
        //---------------------- BEGIN CALLBACKS ---------------------
    function renderSeriesTemplate(err: any, data: JSON) {

            if (err !== null) {
                var error: IPSDBClientError = { 'title': err.title, 'details': err.details, 'code': null };
                util.handleError(error, jqueryMap.$modal);
            }
            else {
                util.renderTemplate(config.listTemplate, { items: data }, jqueryMap.$content);
                //jqueryMap.$content.find('a').on('utap.utap', onTapSeries);
                jqueryMap.$signoutButton.hide();
            }
        }
    //----------------------- END CALLBACKS ----------------------

    //------------------- BEGIN UTILITY METHODS ------------------
    // Returns copy of stored anchor map; minimizes overhead
    function copyAnchorMap() {
        return $.extend(true, {}, stateMap.anchor_map);
    }
  //-------------------- END UTILITY METHODS -------------------

}
