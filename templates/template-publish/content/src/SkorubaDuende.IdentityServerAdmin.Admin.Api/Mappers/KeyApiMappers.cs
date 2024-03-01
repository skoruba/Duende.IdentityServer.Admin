using AutoMapper;

namespace SkorubaDuende.IdentityServerAdmin.Admin.Api.Mappers
{
    public static class KeyApiMappers
    {
        static KeyApiMappers()
        {
            Mapper = new MapperConfiguration(cfg => cfg.AddProfile<KeyApiMapperProfile>())
                .CreateMapper();
        }

        internal static IMapper Mapper { get; }

        public static T ToKeyApiModel<T>(this object source)
        {
            return Mapper.Map<T>(source);
        }
    }
}







