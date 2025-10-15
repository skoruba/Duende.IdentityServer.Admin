var IdentityProviders = {
    init: function () {
        IdentityProviders.eventHandlers();
    },

    eventHandlers: function () {
        FormMvc.disableEnter($('#identity-provider-form'));

        $("body").on("click", ".add-property", function (e) {
            e.preventDefault();

            // Determine the current property index based on the number of existing properties
            var currentPropertyCount = $("#property-list .property").length;

            // Append new property input fields using the updated count
            var resultingProperty = IdentityProviders.propertyTemplate(currentPropertyCount);

            $("#property-list").append(resultingProperty);

        });

        $("body").on("click", ".remove-property", function (e) {
            e.preventDefault();
            $(e.target).closest(".property").remove();
        });
    },

    propertyTemplate: function (propertyIndex) {
        return '<div class="property row mt-1 mb-1">'+
                '<div class="col-sm">'+
                    '<input type="text" required value="" class="form-control" id="Properties_'+propertyIndex+'__Name" name="Properties['+propertyIndex+'].Name" />'+
                    '<span class="text-danger field-validation-error" data-valmsg-for="Properties['+propertyIndex+'.Name" data-valmsg-replace="true"></span>'+
                '</div>'+
                '<div class="col-sm">'+
                    '<input type="text" required value="" class="form-control" id="Properties_'+propertyIndex+'__Value" name="Properties['+propertyIndex+'].Value" />'+
                    '<span class="text-danger field-validation-error" data-valmsg-for="Properties['+propertyIndex+'.Value" data-valmsg-replace="true"></span>'+
                '</div>'+
                '<div class="col-sm-1 col-xs-1">'+
                    '<span class="remove-property oi oi-trash btn btn-danger"></span>'+
                '</div>'+
            '</div>';
    }
};