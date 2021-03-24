// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Microsoft.AspNetCore.Mvc.ApplicationModels;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Configuration.ApplicationParts
{
    public class GenericControllerRouteConvention : IControllerModelConvention
    {
        public void Apply(ControllerModel controller)
        {
            if (controller.ControllerType.IsGenericType)
            {
                var genericName = controller.ControllerType.Name;
                var genericNameWithoutArity = genericName.Substring(0, genericName.IndexOf('`'));
                controller.ControllerName = genericNameWithoutArity.Substring(0, genericNameWithoutArity.LastIndexOf("Controller"));
            }
        }
    }
}