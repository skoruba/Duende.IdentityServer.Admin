$(function () {

    var cryptoUtils = {

        generateHexString: function (byteLength) {
            var randomValues = new Uint8Array(byteLength);
            crypto.getRandomValues(randomValues);
            return Array.prototype.map.call(randomValues, function (b) {
                return ('0' + b.toString(16)).slice(-2);
            }).join('');
        },

        eventHandlers: function () {
            $("#generate-clientid-button").click(function () {
                $("#clientid-input").val(cryptoUtils.generateHexString(16));
            });
            $("#generate-secret-button").click(function () {
                $("#secret-input").val('secret_' + cryptoUtils.generateHexString(32));
            });
        },

        init: function () {

            cryptoUtils.eventHandlers();

        }

    };

    cryptoUtils.init();

});
