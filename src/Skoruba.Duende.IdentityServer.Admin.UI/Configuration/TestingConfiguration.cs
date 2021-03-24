// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace Skoruba.Duende.IdentityServer.Admin.UI.Configuration
{
	public class TestingConfiguration
	{
		/// <summary>
		/// Use test instead of production services and pipelines.
		/// </summary>
		public bool IsStaging { get; set; }
	}
}
