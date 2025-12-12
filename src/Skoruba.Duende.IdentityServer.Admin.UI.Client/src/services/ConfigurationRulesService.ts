import ApiHelper from "@/helpers/ApiHelper";
import { client } from "@skoruba/duende.identityserver.admin.api.client";

const apiClient = new client.ConfigurationRulesClient(
  ApiHelper.getApiBaseUrl()
);

export const getConfigurationRules =
  async (): Promise<client.ConfigurationRulesDto> => {
    return await apiClient.get();
  };

export const getConfigurationRule = async (
  id: number
): Promise<client.ConfigurationRuleDto> => {
  return await apiClient.get2(id);
};

export const createConfigurationRule = async (
  rule: client.ConfigurationRuleDto
): Promise<void> => {
  await apiClient.post(rule);
};

export const updateConfigurationRule = async (
  id: number,
  rule: client.ConfigurationRuleDto
): Promise<void> => {
  await apiClient.put(id, rule);
};

export const deleteConfigurationRule = async (id: number): Promise<void> => {
  await apiClient.delete(id);
};

export const toggleConfigurationRule = async (id: number): Promise<void> => {
  await apiClient.toggleRule(id);
};

export const getConfigurationRulesMetadata = async (): Promise<
  client.ConfigurationRuleMetadataDto[]
> => {
  return await apiClient.getAllMetadata();
};

export const getConfigurationRuleMetadata = async (
  ruleType: string
): Promise<client.ConfigurationRuleMetadataDto> => {
  return await apiClient.getMetadata(ruleType as any);
};
