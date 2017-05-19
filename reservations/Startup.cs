// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// --------------------------------------------------------------------------------------------

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Collections.Generic;
using System;

namespace reservations
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
        }

        private string reserveBike(HttpResponseMessage response) {
            return "Reservation confirmed";
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.Run(async (context) =>
            {

                using (var client = new HttpClient())
                {
                    try
                    {
                        // get bike info
                        client.BaseAddress = new Uri("http://bikes");
                        var response = await client.GetAsync("/");

                        // reserve bike
                        var confirmation = reserveBike(response);

                        // send reservation confirmation
                        await context.Response.WriteAsync(confirmation);
                    }
                    catch (HttpRequestException e)
                    {
                        Console.WriteLine($"Request exception: {e.Message}");
                    }
                }
            });
        }
    }
}