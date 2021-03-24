// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Helpers.TagHelpers
{
    [HtmlTargetElement("toggle-button")]
    public class SwitchTagHelper : TagHelper
    {
        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            var childContent = await output.GetChildContentAsync();

            var divSlider = new TagBuilder("div");
            divSlider.AddCssClass("slider round bg-primary");

            output.TagName = "label";
            output.Attributes.Add("class", "switch");
            output.Content.AppendHtml(childContent);
            output.Content.AppendHtml(divSlider);
            output.TagMode = TagMode.StartTagAndEndTag;
        }
    }
}
