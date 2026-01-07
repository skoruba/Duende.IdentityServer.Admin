// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Linq;
using System.Linq.Expressions;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions.Extensions
{
    public static class QueryableExtensions
    {
        private const int DefaultPageSize = 10;
        private const int MaxPageSize = 100;
        private const int MaxTakeLimit = 1000;

        public static int NormalizePageSize(int pageSize)
        {
            if (pageSize <= 0) return DefaultPageSize;
            return pageSize > MaxPageSize ? MaxPageSize : pageSize;
        }

        public static int NormalizeTakeLimit(int limit)
        {
            if (limit <= 0) return 0;
            return limit > MaxTakeLimit ? MaxTakeLimit : limit;
        }

        public static IQueryable<T> WhereIf<T>(this IQueryable<T> query, bool condition, Expression<Func<T, bool>> predicate)
        {
            return condition
                ? query.Where(predicate)
                : query;
        }

        public static IQueryable<T> TakeIf<T, TKey>(this IQueryable<T> query, Expression<Func<T, TKey>> orderBy, bool condition, int limit, bool orderByDescending = true)
        {
            // It is necessary sort items before it
            query = orderByDescending ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);

            if (condition)
            {
                limit = NormalizeTakeLimit(limit);
                if (limit <= 0) return query.Take(0);
            }

            return condition
                ? query.Take(limit)
                : query;
        }

        public static IQueryable<T> PageBy<T, TKey>(this IQueryable<T> query, Expression<Func<T, TKey>> orderBy, int page, int pageSize, bool orderByDescending = true)
        {
            const int defaultPageNumber = 1;

            if (query == null)
            {
                throw new ArgumentNullException(nameof(query));
            }

            // Check if the page number is greater then zero - otherwise use default page number
            if (page <= 0)
            {
                page = defaultPageNumber;
            }

            pageSize = NormalizePageSize(pageSize);

            // It is necessary sort items before it
            query = orderByDescending ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);

            var skip = (page - 1L) * pageSize;
            if (skip > int.MaxValue)
            {
                return query.Take(0);
            }

            return query.Skip((int)skip).Take(pageSize);
        }
    }
}
