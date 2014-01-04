/**
 * Created with IntelliJ IDEA.
 * User: balmaster
 * Date: 04.01.14
 * Time: 15:19
 * To change this template use File | Settings | File Templates.
 */

(function (moveAttacks) {
    moveAttacks.init = init;

    function init($) {
        $('#map_details .movements .cf').append('<button class="green" id="moveAttacksButton" value="Отправить в tac_tool" type="button"><div class="button-container addHoverClick "><div class="button-background"><div class="buttonStart"><div class="buttonEnd"><div class="buttonMiddle"></div></div></div></div><div class="button-content">Отправить в tac_tool</div></div></button>');


    }


}(window.moveAttacks = window.moveAttacks || {}));
