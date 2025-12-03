using System;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.Extensions.FileProviders;

namespace Skoruba.Duende.IdentityServer.STS.Identity.Helpers.TagHelpers
{
    [HtmlTargetElement("lucideicon", TagStructure = TagStructure.WithoutEndTag)]
    public class LucideIconTagHelper : TagHelper
    {
        private readonly IFileProvider _fileProvider;

        public LucideIconTagHelper(IWebHostEnvironment env)
        {
            _fileProvider = env.WebRootFileProvider;
        }

        [HtmlAttributeName("name")]
        public string Name { get; set; } = string.Empty;

        [HtmlAttributeName("class")]
        public string? Class { get; set; }

        [HtmlAttributeName("size")]
        public int? Size { get; set; }

        [HtmlAttributeName("base-path")]
        public string BasePath { get; set; } = "icons/lucide";

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            output.TagName = null;

            if (string.IsNullOrWhiteSpace(Name))
            {
                output.Content.SetHtmlContent("<!-- missing icon name -->");
                return;
            }

            var file = _fileProvider.GetFileInfo($"{BasePath}/{Name}.svg");
            if (!file.Exists)
            {
                output.Content.SetHtmlContent($"<!-- icon not found: {Name} -->");
                return;
            }

            string svg;
            using (var stream = file.CreateReadStream())
            using (var reader = new StreamReader(stream))
                svg = reader.ReadToEnd();

            if (!string.IsNullOrWhiteSpace(Class))
                svg = svg.Replace("<svg", $"<svg class=\"{Class}\"", StringComparison.OrdinalIgnoreCase);

            if (Size.HasValue)
                svg = svg.Replace("<svg", $"<svg width=\"{Size}\" height=\"{Size}\"", StringComparison.OrdinalIgnoreCase);

            output.Content.SetHtmlContent(svg);
        }
    }
}
