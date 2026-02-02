// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

export const ConfigurationIssuesFilterValues = {
  ALL_RESOURCE_TYPES: "all",
  ALL_ISSUE_TYPES: "all",
} as const;

export const ResourceTypeFilterOptions = {
  ALL: ConfigurationIssuesFilterValues.ALL_RESOURCE_TYPES,
  CLIENT: "Client",
  API_SCOPE: "ApiScope",
  API_RESOURCE: "ApiResource",
  IDENTITY_RESOURCE: "IdentityResource",
} as const;

export const IssueTypeFilterOptions = {
  ALL: ConfigurationIssuesFilterValues.ALL_ISSUE_TYPES,
  ERROR: "Error",
  WARNING: "Warning",
  RECOMMENDATION: "Recommendation",
} as const;

export type ResourceTypeFilter =
  (typeof ResourceTypeFilterOptions)[keyof typeof ResourceTypeFilterOptions];
export type IssueTypeFilter =
  (typeof IssueTypeFilterOptions)[keyof typeof IssueTypeFilterOptions];
