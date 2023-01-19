var IdentityProviders = {

    propertyCount: 0,
    properties: null,

    init: function (propertyCount, properties) {

        IdentityProviders.propertyCount = propertyCount;
        IdentityProviders.properties = properties;

        IdentityProviders.loadProperties();
        IdentityProviders.eventHandlers();
    },

    loadProperties: function () {
        Object.keys(IdentityProviders.properties).forEach(function (key) {
            $("#property-list").append(IdentityProviders.propertyTemplate(key, IdentityProviders.properties[key].name, IdentityProviders.properties[key].value));
        });
    },

    eventHandlers: function () {

        FormMvc.disableEnter($('#identity-provider-form'));

        $("body").on("click", ".add-property", function (e) {
            e.preventDefault();
            var currentPropertyCount = IdentityProviders.propertyCount;

            $("#property-list").append(IdentityProviders.propertyTemplate(currentPropertyCount, "", ""));
            IdentityProviders.propertyCount++;
        });

        $("body").on("click", ".remove-property", function (e) {
            e.preventDefault();
            $(e.target).closest(".property").remove();
        });
    },

    propertyTemplate: function (propertyIndex, key, value) {
        return '<div class="property row mt-1 mb-1">' +
            '    <div class="col-sm">' +
            '        <input type="text" required value="' + key + '" class="form-control" id="Properties_' + propertyIndex + '__Name" name="Properties[' + propertyIndex + '].Name" />' +
            '        <span class="text-danger field-validation-error" data-valmsg-for="Properties[' + propertyIndex + '].Name" data-valmsg-replace="true"></span>' +
            '    </div>' +
            '    <div class="col-sm">' +
            '        <input type="text" required  value="' + value + '" class="form-control" id="Properties_' + propertyIndex + '__Value" name="Properties[' + propertyIndex + '].Value" />' +
            '        <span class="text-danger field-validation-error" data-valmsg-for="Properties[' + propertyIndex + '].Value" data-valmsg-replace="true"></span>' +
            '    </div>' +
            '    <div class="col-sm-1 col-xs-1"><span class="remove-property oi oi-trash btn btn-danger"></span></div>' +
            '</div>';
    }

};