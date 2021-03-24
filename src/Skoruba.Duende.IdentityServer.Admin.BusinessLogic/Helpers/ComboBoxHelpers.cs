// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using Newtonsoft.Json;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Helpers
{
	public static class ComboBoxHelpers
	{
		public static void PopulateValuesToList(string jsonValues, List<string> list)
		{
			if (string.IsNullOrEmpty(jsonValues)) return;

			var listValues = JsonConvert.DeserializeObject<List<string>>(jsonValues);
			if (listValues == null) return;

			list.AddRange(listValues);
		}

	    public static void PopulateValue(string jsonValue)
	    {
	        if (string.IsNullOrEmpty(jsonValue)) return;

	        var selectedValue = JsonConvert.DeserializeObject<string>(jsonValue);
	        if (selectedValue == null) return;

	        jsonValue = selectedValue;
	    }
    }
}