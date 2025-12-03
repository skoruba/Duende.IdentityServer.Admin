#nullable enable
using System.IO;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace Skoruba.Duende.IdentityServer.STS.Identity.Helpers.TagHelpers;

[HtmlTargetElement("input", Attributes = "asp-for,tw-validation")]
public class TwValidationTagHelper : TagHelper
{
    public override int Order => 1000;

    [HtmlAttributeName("asp-for")]
    public ModelExpression AspFor { get; set; } = default!;

    [HtmlAttributeName("tw-validation")]
    public bool TwValidation { get; set; } = true;

    [ViewContext, HtmlAttributeNotBound]
    public ViewContext ViewContext { get; set; } = default!;

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        output.Attributes.RemoveAll("tw-validation");

        if (!TwValidation || AspFor == null || ViewContext == null)
            return;

        var fieldName = AspFor.Name;
        var hasError = ViewContext.ViewData.ModelState.TryGetValue(fieldName, out var entry)
                       && entry is { Errors.Count: > 0 };

        if (!hasError)
            return;

        var existing = output.Attributes.TryGetAttribute("class", out var classAttr)
            ? AsPlainText(classAttr.Value)
            : string.Empty;

        var merged = string.IsNullOrWhiteSpace(existing)
            ? "input-invalid"
            : $"{existing} input-invalid";

        output.Attributes.SetAttribute("class", merged.Trim());
        output.Attributes.SetAttribute("aria-invalid", "true");
    }

    private static string AsPlainText(object? value)
    {
        if (value is null) return string.Empty;
        if (value is string s) return s;

        if (value is IHtmlContent html)
        {
            using var sw = new StringWriter();
            html.WriteTo(sw, HtmlEncoder.Default);
            return sw.ToString();
        }

        return value.ToString() ?? string.Empty;
    }
}
