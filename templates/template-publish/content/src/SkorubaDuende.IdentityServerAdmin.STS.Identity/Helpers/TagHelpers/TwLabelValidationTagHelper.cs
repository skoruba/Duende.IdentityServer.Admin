using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace SkorubaDuende.IdentityServerAdmin.STS.Identity.Helpers.TagHelpers;

[HtmlTargetElement("label", Attributes = "asp-for,tw-validation", TagStructure = TagStructure.NormalOrSelfClosing)]
public class TwValidationLabelTagHelper : TagHelper
{
    [HtmlAttributeName("asp-for")]
    public ModelExpression For { get; set; } = default!;

    [HtmlAttributeName("tw-validation")]
    public bool TwValidation { get; set; } = true;

    [ViewContext]
    public ViewContext ViewContext { get; set; } = default!;

    public override int Order => 1000;

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        if (!TwValidation || ViewContext == null || For == null) return;

        var key = For.Name;
        var modelState = ViewContext.ViewData.ModelState;

        if (modelState.TryGetValue(key, out var entry) && entry.Errors.Count > 0)
        {
            var existingClass = output.Attributes["class"]?.Value?.ToString() ?? string.Empty;
            var mergedClass = string.IsNullOrWhiteSpace(existingClass)
                ? "form-label form-label-invalid"
                : $"{existingClass} form-label-invalid";
            output.Attributes.SetAttribute("class", mergedClass);
        }

        // odstraníme vlastní atribut, aby nešel do HTML
        output.Attributes.RemoveAll("tw-validation");
    }
}