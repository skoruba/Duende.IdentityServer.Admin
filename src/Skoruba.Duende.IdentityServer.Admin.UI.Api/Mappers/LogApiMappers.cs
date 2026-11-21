// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Riok.Mapperly.Abstractions;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Log;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.Logs;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Mappers
{
    [Mapper(RequiredMappingStrategy = RequiredMappingStrategy.Target)]
    internal static partial class LogApiMapper
    {
        public static partial ErrorLogApiDto ToErrorLogApiDto(LogDto source);

        public static partial ErrorLogsApiDto ToErrorLogsApiDto(LogsDto source);
    }

    public static class LogApiMappers
    {
        public static ErrorLogsApiDto ToErrorLogsApiDto(this LogsDto source) => LogApiMapper.ToErrorLogsApiDto(source);
    }
}
