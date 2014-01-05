// ==UserScript==
// @name        tactool_installer
// @namespace   tactool_utils
// @description load scripts
// @include     http://ts8.travian.ru/dorf1.php*
// @author      balmaster
// @version     1.0.0-1
// ==/UserScript==

var SCRIPTS_BASE = "http://localhost:8000/";

var userSettings = {
    DEFLIST_ID: 651373264
};

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
    $('#map_details .movements .cf').append('<button class="green" id="moveAttacksButton" value="Отправить в tactool.net" type="button"><div class="button-container addHoverClick "><div class="button-background"><div class="buttonStart"><div class="buttonEnd"><div class="buttonMiddle"></div></div></div></div><div class="button-content">Отправить в tactool.net</div></div></button>');
    $("#moveAttacksButton").click(function () {
        handleAttacks();
    });
}


var SEND_MIN_INTERVAL = 1000 * 1;
var SEND_INTERVAL = 1000 * 2;
var URL_TACTOOL_ATTACK_INPUT_VIEWER = "http://tactool.net/D/AttackInputViewer.php";

function ajaxRequest(url, options) {
    if (!options.type) {
        options.type = "POST";
    }
    if (!options.cache) {
        options.cache = false;
    }
    if (options.type === "POST" && (!options.data || options.data.length === 0)) {
        options.data = {timestamp: new Date().getTime()};
    }

    return $.ajax(url, options);
}

function htmlRequest(url, requestData, responseHandler) {

    function parseResponse(result, textStatus, jqXHR) {
        responseHandler($.parseHTML(result));
    }

    function transportError(result, textStatus, jqXHR) {
        console.error("ошибка" + textStatus);
    }

    return ajaxRequest(url,
        {
            dataType: 'html',
            data: requestData,
            success: parseResponse,
            error: transportError
        });
}

function gmRequest(url, params, success, error) {
    var options = {
        url: url,
        method: ( !params ? 'GET' : 'POST' ),
        headers:{},
        onload: success,
        onerror: error,
        onabort:function(e) {console.error(e);}
    };
    if (params) {
        var data = '';
        for (n in params) {
            data += '&' + n + '=' + params[n];//+ //encodeURIComponent(params[n]);
        }
        options.headers["Content-type"] = "application/x-www-form-urlencoded";
        options.headers["Content-length"] = data.length;
        options.data = data;
    }

    console.error(data);

    setTimeout(function(){
        GM_xmlhttpRequest(options);
    },0);
}

function gmHtmlRequest(url, params, responseHandler) {
    function parseResponse(response) {
        responseHandler($.parseHTML(response.responseText));
    }

    function transportError(response) {
        console.error("ошибка" + response);
    }

    return gmRequest(url, params, parseResponse, transportError);
}

function requestBuildPage(gid, filter, tt, page, handler) {
    htmlRequest("build.php?gid=" + gid + "&filter=" + filter + "&tt=" + tt + "&page=" + page, undefined, function (resultDom) {
        handler(resultDom);
    });
}

function handleAttacks() {
    var x, y;
    var content = "";
    var attacksCount = 0;

    function sendContent() {
        //alert("Собрана информация о " + attacksCount + " нападениях. Нажмите на ок для загрузки.")
        //console.error(content);

        gmHtmlRequest(URL_TACTOOL_ATTACK_INPUT_VIEWER,
            {
                attacks: content,
                idL: userSettings.DEFLIST_ID,
                x: x,
                y: y
            }, function (responseDom) {
                params = {};
                $(responseDom).find("form textarea").each(function (i, textarea) {
                    var $textarea = $(textarea);
                    params[$textarea.attr("name")] = $textarea.val();
                    //console.error($textarea.attr("name"));
                    //console.error($textarea.val());
                });

                if(params.waves && params.deffer) {
                    gmHtmlRequest(URL_TACTOOL_ATTACK_INPUT_VIEWER, params, function (responseDom) {
                        alert("Информация о " + attacksCount + " нападениях внесена.")
                    });
                }
                else {
                    alert("Ошибка при добавлении нападений.")
                }
            });
    }

    function handleAttacksPage(page) {
        //console.error("handleAttacksPage" + page);
        setTimeout(function () {
            requestBuildPage(16, 1, 1, page, function (responseDom) {
                var currentPage = Number($(responseDom).find("#build .data .paginator .currentPage")[0].textContent);
                if (page <= currentPage) {

                    var troopDetails = $(responseDom)
                        .find("#build .data .troop_details")
                        .filter(function () {
                            var troopClass = $(this).attr("class");
                            return troopClass.indexOf("inAttack") >= 0 || troopClass.indexOf("inRaid") >= 0;
                        });

                    //console.error("page " + page + " details " + troopDetails.length);
                    $(troopDetails).each(function (i, troopDetail) {
                        attacksCount++;

                        $(troopDetail).find("thead td.role a").each(function (j, node) {
                            content += node.textContent + "\t";
                        });

                        content += "Отметить нападение\t";

                        $(troopDetail).find("thead td.troopHeadline a").each(function (j, node) {
                            content += node.textContent + "\t";
                        });

                        content += "\n";

                        $(troopDetail).find("tbody.units th.coords span span").each(function (j, node) {
                            content += node.textContent;
                        });

                        $(troopDetail).find("tbody.units td.uniticon img").each(function (j, node) {
                            content += $(node).attr("alt") + "\t";
                        });

                        content += "\n";
                        content += "Войска 	? 	? 	? 	? 	? 	? 	? 	? 	? 	? 	?" + "\n";

                        $(troopDetail).find("tbody.infos th").each(function (j, node) {
                            content += node.textContent + "\n";
                        });
                        $(troopDetail).find("tbody.infos td div").each(function (j, node) {
                            content += node.textContent + "\n";
                        });
                    });
                    handleAttacksPage(page + 1);
                }
                else {
                    sendContent();
                }
            });
        }, Math.floor(SEND_MIN_INTERVAL + SEND_INTERVAL * Math.random()));
    }

    var coords = $("#sidebarBoxVillagelist li.active span span");

    x = Number(clearCoord(coords[0].textContent));
    y = Number(clearCoord(coords[2].textContent));
    //console.error(x + "|" + y);

    handleAttacksPage(1);
}

function clearCoord(value) {
    return value.replace(/[\(\)\u202d\u202c]/g,"");
}
