using AutoMapper;
using Microsoft.Extensions.Logging.Abstractions;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Mappers
{
    public static class KeyApiMappers
    {
        static KeyApiMappers()
        {
            Mapper = new MapperConfiguration(cfg => cfg.AddProfile<KeyApiMapperProfile>(), NullLoggerFactory.Instance)
                .CreateMapper();
        }

        internal static IMapper Mapper { get; }

        public static T ToKeyApiModel<T>(this object source)
        {
            return Mapper.Map<T>(source);
        }
    }
}