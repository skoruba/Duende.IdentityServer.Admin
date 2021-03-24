// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Shared.Configuration.Helpers
{
    public static class ThemeHelpers
    {
        public const string CookieThemeKey = "Application.Theme";

        public const string DefaultTheme = "default";

        public static ICollection<string> GetThemes()
        {
            var themes = new List<string> { DefaultTheme, "darkly", "cosmo", "cerulean", "cyborg", "flatly", "journal", "litera", "lumen", "lux", "materia", "minty", "pulse", "sandstone", "simplex", "sketchy", "slate", "solar", "spacelab", "superhero", "united", "yeti" };

            return themes;
        }
    }
}
