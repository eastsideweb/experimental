//   MODULE: PSDBClient
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: psdbClient.util.ts
//   DESCRIPTION: This file contains utility functions used by client side
//
//   HISTORY:
//     Date            By  Comment
//     2014 July 01    NSA  Created
// 
// Utility class for PSDB client

module psdbClient {
    export interface IRequestParameters {
        isAsync?: boolean;
        session?: string;
        loadPreloader?: boolean;
    }
    export module util {
        declare var dust;
        
        // Renders a pre-loaded template into the given container
        // templateName: the template name to be loaded
        // data: JSON data to be populated in the template
        // $container: the Jquery container to append the rendered template output        
        export function renderTemplate(templateName: string, data: any, $container: JQuery) {
            dust.render(templateName, data, function (err, out) {
                $container.html(out);
            });
        }

        // Displays the error message in a popup to the user
        // err: JSON error object
        // $container: the Jquery container to append the rendered template output 
        // ignoreError: a value to ignore error, in case it needs to be handled in a different way
        export function handleError(err: IPSDBClientError, $container:JQuery, ignoreError = false) {
            if (!ignoreError) {
                renderTemplate(config.modalTemplate, err, $container);
                $container.fadeIn(10);
                setModalLocation();

                $('body').append('<div id="mask" class="mask"></div>');

                // find the close button and ensure to remove the modal template once dismissed
                $container.find('a.btn_close').one('click', function () {
                    $('.modal').remove();
                    $('#mask').remove();

                    return false;
                });
            }
        }

        // Synchronous get request
        // Url: get request url
        // loadPreloader: set true or false to launch a preloader
        // call back function to return the result
        // TODO: Add content-type for return
        export function getRequest(url: string, callback: (err: any, result: JSON) => void, requestParams?: IRequestParameters) {
            requestParams = checkRequestParams(requestParams);
            requestParams.isAsync = false;
            makeRequest('get', url, null, callback, requestParams);
        }

        // Synchronous post request
        // Url: get request url
        // data: The serialized data to be sent (TODO: could serialize it here instead so it could be generic)
        // loadPreloader: set true or false to launch a preloader
        // call back function to return the result
        export function postRequest(url: string, data: any, callback: (err: any, result: JSON) => void, requestParams?: IRequestParameters) {
            requestParams = checkRequestParams(requestParams);
            requestParams.isAsync = false;
            makeRequest('post', url, data, callback, requestParams);
        }

        // Asynchronous get request
        // Url: get request url
        // loadPreloader: set true or false to launch a preloader
        // call back function to return the result
        export function getRequestAsync(url: string, callback: (err: any, result: JSON) => void, requestParams?: IRequestParameters) {
            requestParams = checkRequestParams(requestParams);
            requestParams.isAsync = true;
            makeRequest('get', url, null, callback, requestParams);
        }

        // Asynchronous get request
        // Url: get request url
        // Data: The serialized data to be sent (TODO: could serialize it here instead so it could be generic)
        // loadPreloader: set true or false to launch a preloader
        // call back function to return the result
        export function postRequestAsync(url: string, data: any, callback: (err: any, result: JSON) => void, requestParams?: IRequestParameters) {
            requestParams = checkRequestParams(requestParams);
            requestParams.isAsync = true;
            makeRequest('post', url, data, callback, requestParams);
        }

        export function encodeData(data: string): string {            return encodeURIComponent(data).replace(/\-/g, "%2D").replace(/\_/g, "%5F").replace(/\./g, "%2E").replace(/\!/g, "%21").replace(/\~/g, "%7E").replace(/\*/g, "%2A").replace(/\'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29");        }

        export function decodeData(s: string): string {            try {                return decodeURIComponent(s.replace(/\%2D/g, "-").replace(/\%5F/g, "_").replace(/\%2E/g, ".").replace(/\%21/g, "!").replace(/\%7E/g, "~").replace(/\%2A/g, "*").replace(/\%27/g, "'").replace(/\%28/g, "(").replace(/\%29/g, ")"));            } catch (e) {            }            return "";        }

        function makeRequest(type: string, url: string, data: any, callback: (err: any, result?: JSON) => void, requestParams : IRequestParameters) {
            $.ajax({
                type: type,
                url: url,
                data: data === null ? null : JSON.stringify(data),
                dataType: 'json',
                headers: { 'token': requestParams.session },
                contentType: 'application/json',
                async: requestParams.isAsync, 
                timeout: config.timeout,
                beforeSend: function () {
                    if (requestParams.loadPreloader) {
                        launchPreloader();
                    }
                },
                complete: function () {
                    if (requestParams.loadPreloader) {
                        stopPreloader();
                    }
                }
            })
                .done(function (data) {
                    callback(null, data);
                })
                .fail(function (jqXhr, err) {
                    try {
                        var error = JSON.parse(jqXhr.responseText);
                        callback(error);
                    }
                    catch (e) {
                        callback({ title: 'Unknown error' });
                    }
                });
        }

        function setModalLocation() {
            var loginModal = $('div.modal');
            var popMargTop = (loginModal.height()) / 2;
            var popMargLeft = (loginModal.width()) / 2;

            loginModal.css({
                'margin-top': -popMargTop,
                'margin-left': -popMargLeft
            });
        }

        function launchPreloader() {
            $('div.psdbClient-shell-preloader').fadeIn('slow');
            $('body').append('<div id="mask" class="mask"></div>');
        }

        function stopPreloader() {
            $('div.psdbClient-shell-preloader').fadeOut('slow');
            $('#mask').remove();
        }

        function checkRequestParams(requestParams: IRequestParameters) {
            if (requestParams === null || requestParams === undefined) {
                var reqParams: IRequestParameters = { isAsync: false, session: null, loadPreloader: true };
                return reqParams;
            }

            return requestParams;
        }
    }
}