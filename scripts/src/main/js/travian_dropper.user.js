// ==UserScript==
// @name        travian dropper
// @namespace   tactool_utils
// @description load scripts
// @include     https://ts8.travian.ru/*
// @include     http://ts8.travian.ru/*
// @version     1.0.0-1
// ==/UserScript==

var SCRIPTS_BASE = "http://localhost:8000/";

var $;

// Add jQuery
(function(){
    if (typeof unsafeWindow.jQuery == 'undefined') {
        var GM_Head = document.getElementsByTagName('head')[0] || document.documentElement,
            GM_JQ = document.createElement('script');

        GM_JQ.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js';
        GM_JQ.type = 'text/javascript';
        GM_JQ.async = true;

        GM_Head.insertBefore(GM_JQ, GM_Head.firstChild);
    }
    GM_wait();
})();

// Check if jQuery's loaded
function GM_wait() {
    if (typeof unsafeWindow.jQuery == 'undefined') {
        window.setTimeout(GM_wait, 100);
    } else {
        $ = unsafeWindow.jQuery.noConflict(true);
        letsJQuery();
    }
}

// All your GM code must be inside this function
function letsJQuery() {
    $.when(
            $.getScript(SCRIPTS_BASE + 'move_attacks.js'),
            $.Deferred(function (deferred) {
                $(deferred.resolve);
            })
        ).done(function () {
            alert('scripts loaded');
        });
}

