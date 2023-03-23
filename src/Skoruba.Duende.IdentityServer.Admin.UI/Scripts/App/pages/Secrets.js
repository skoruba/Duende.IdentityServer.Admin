$(function () {

    var adminSecrets = {

        generateSecret: function (byteLength) {
            var randomValues = new Uint8Array(byteLength);
            crypto.getRandomValues(randomValues);
            return Array.prototype.map.call(randomValues, function (b) {
                return ('0' + b.toString(16)).slice(-2);
            }).join('');
        },

        eventHandlers: function () {
            $("#generate-secret-button").click(function () {
                $("#secret-input").val('secret_' + adminSecrets.generateSecret(32));
            });
        },

        init: function () {

            adminSecrets.eventHandlers();

        }

    };

    adminSecrets.init();

});
