// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.Configuration
{
	public class ConnectionStringsConfiguration
	{
		public string ConfigurationDbConnection { get; set; }

		public string PersistedGrantDbConnection { get; set; }

		public string AdminLogDbConnection { get; set; }

		public string IdentityDbConnection { get; set; }

		public string AdminAuditLogDbConnection { get; set; }

		public string DataProtectionDbConnection { get; set; }

		public void SetConnections(string commonConnectionString)
		{
			AdminAuditLogDbConnection = commonConnectionString;
			AdminLogDbConnection = commonConnectionString;
			ConfigurationDbConnection = commonConnectionString;
			DataProtectionDbConnection = commonConnectionString;
			IdentityDbConnection = commonConnectionString;
			PersistedGrantDbConnection = commonConnectionString;
		}
	}
}
