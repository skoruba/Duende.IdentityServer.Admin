// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Net.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Skoruba.Duende.IdentityServer.STS.Identity.Configuration.Test;

namespace Skoruba.Duende.IdentityServer.STS.Identity.IntegrationTests.Tests.Base
{
    public class TestFixture : IDisposable
    {
        public IHost Host { get; }
        public TestServer TestServer { get; }
        public HttpClient Client { get; }

        public TestFixture()
        {
            Host = new HostBuilder()
                .ConfigureAppConfiguration((hostContext, configApp) =>
                {
                    configApp.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
                    configApp.AddJsonFile("serilog.json", optional: true, reloadOnChange: true);

                    var env = hostContext.HostingEnvironment;

                    configApp.AddJsonFile($"serilog.{env.EnvironmentName}.json", optional: true, reloadOnChange: true);
                    configApp.AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true, reloadOnChange: true);
                })
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseTestServer();
                    webBuilder.UseStartup<StartupTest>();
                })
                .Start();

            TestServer = Host.GetTestServer();
            Client = Host.GetTestClient();
        }

        public void Dispose()
        {
            Client.Dispose();
            Host.Dispose();
        }
    }
}
