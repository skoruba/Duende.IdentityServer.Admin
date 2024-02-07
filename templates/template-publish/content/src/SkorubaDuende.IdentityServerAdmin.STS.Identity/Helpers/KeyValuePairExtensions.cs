namespace SkorubaDuende.IdentityServerAdmin.STS.Identity.Helpers
{
    public static class KeyValuePairExtensions
    {
        public static bool IsDefault<T>(this T value) where T : struct
        {
            var isDefault = value.Equals(default(T));

            return isDefault;
        }
    }
}








