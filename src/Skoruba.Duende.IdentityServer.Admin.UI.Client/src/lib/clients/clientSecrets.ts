import { ClientSecretData, SecretTypes } from "@/models/Clients/ClientModels";

/**
 * True when the client can still authenticate with a JWK secret. An expired key
 * is as good as none - IdentityServer rejects it, so a client that also has a
 * valid shared secret must not be steered towards private_key_jwt.
 */
export const hasUsableJwkSecret = (
  secrets: Pick<ClientSecretData, "type" | "expiration">[],
  now: Date = new Date(),
): boolean =>
  secrets.some(
    (secret) =>
      secret.type === SecretTypes.Jwk &&
      (!secret.expiration || new Date(secret.expiration) > now),
  );
