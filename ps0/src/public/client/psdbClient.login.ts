//   MODULE: PSDBClient
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: psdbClient.login.ts
//   DESCRIPTION: This file contains functions to help retrieve the token
//
//   HISTORY:
//     Date            By  Comment
//     2014 July 01    NSA  Created
// 
// Authorization class for PSDB client

module psdbClient {
    export module login {

        //------------------ PUBLIC METHODS-------------------------------
        export function initializeSession(seriesId) {
            // Render login in template
            util.renderTemplate(config.loginTemplate, null, jqueryMap.$container);

            setModalLocation();
            $('body').append('<div id="mask" class="mask"></div>');

            jqueryMap.$container.find('a.btn_close').one('utap.utap', function () {
                clearModal();
                return false;
            });

            var $submitBtn = jqueryMap.$container.find('button.submit');
            $submitBtn.on('click', function () {
                // Disable the submit button
                $submitBtn.attr("disabled", true);
                jqueryMap.$container.find('#error').html('');
                getSessionToken(seriesId);
                return false;
            });

            jqueryMap.$container.keypress(function (e) {
                // If enter
                if (e.which === 13) {
                    // Disable the submit button
                    $submitBtn.attr("disabled", true);
                    jqueryMap.$container.find('#error').html('');
                    getSessionToken(seriesId);
                    return false;
                }
            });
        }

        export function initModule($container) {
            jqueryMap.$container = $container;

        };

        //---------------------- END PUBLIC METHODS -------------------------------------

        var jqueryMap = { $container: null };

        // ------------------- DOM METHODS---------------------------------------------

        function setModalLocation() {
            var loginModal = $('div.modal');
            var popMargTop = (loginModal.height()) / 2;
            var popMargLeft = (loginModal.width()) / 2;

            loginModal.css({
                'margin-top': -popMargTop,
                'margin-left': -popMargLeft
            });
        }

        function onLogout(err: IPSDBClientError, data) {
            //clearModal();
            publishLogout(data);
        }
        function onLogin(err: IPSDBClientError, data) {
            if (err) {
                jqueryMap.$container.find('#continueButton').removeAttr('disabled');
                jqueryMap.$container.find('#error').html(err.title);  
            }
            else {
                clearModal();
                publishLogin(data);
            }
        }

        
        function cleanUp() {
            jqueryMap.$container.unbind('keypress');
            jqueryMap.$container.find('button.submit').unbind('click');
        }

        function clearModal() {
            cleanUp();
            $('div.modal').remove();
            $('#mask').remove();
        }
        //----------------------END DOM METHODS-------------------------------------------------

        //------------------ UTILITY METHODS------------------------------------
        function getSessionToken(seriesId : string) {
            //var a = $('#loginForm').serialize();
            var input = $('#loginForm :input').serializeArray();
            var inputObject = {};
            $.each(input,
                function (index: any, item:any) {
                    inputObject[item.name] = item.value;
                });
            var requestParams: IRequestParameters = { isAsync:false, loadPreloader:false };
            psdbClient.util.postRequest(config.sessionUrl.replace('{id}', seriesId), inputObject, onLogin);
        }
        //------------------- END UTILITY METHODS--------------------------------------------

        //------------------- EVENTS-------------------------------------------------
        function publishLogin(data) {
            $.gevent.publish('psdbClient-login', data);
        }

        function publishLogout(data) {
            $.gevent.publish('psdbClient-logout', data);
        }

        //----------------------- END EVENTS--------------------------------------------

    }
}