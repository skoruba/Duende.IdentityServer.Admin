export type JwkAlgorithm = "RS256" | "ES256" | "ES384" | "ES512";

export type JwkModulusLength = 2048 | 3072 | 4096;

/**
 * Note that ES512 uses P-521, not P-512.
 */
const ecCurves: Partial<Record<JwkAlgorithm, string>> = {
  ES256: "P-256",
  ES384: "P-384",
  ES512: "P-521",
};

export const isEcAlgorithm = (algorithm: JwkAlgorithm): boolean =>
  algorithm in ecCurves;

export type GeneratedJwkKeyPair = {
  algorithm: JwkAlgorithm;
  /** RFC 7638 thumbprint of the public key, used as the "kid" of both keys. */
  kid: string;
  /** Public JWK, pretty printed for display. */
  publicJwk: string;
  /** Public JWK on a single line - the value stored as the secret. */
  publicJwkCompact: string;
  /** Private JWK, pretty printed. Never leaves the browser. */
  privateJwk: string;
  publicPem: string;
  privatePem: string;
};

/**
 * The Web Crypto API is only available in secure contexts (HTTPS or localhost).
 */
export const isJwkGenerationSupported = (): boolean =>
  typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined";

const toBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const toBase64Url = (buffer: ArrayBuffer): string =>
  toBase64(buffer).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const toPem = (buffer: ArrayBuffer, label: string): string => {
  const body = toBase64(buffer).replace(/(.{64})/g, "$1\n").trimEnd();
  return `-----BEGIN ${label}-----\n${body}\n-----END ${label}-----`;
};

/**
 * Computes the JWK thumbprint (RFC 7638): SHA-256 over the canonical JSON of the
 * required members, in lexicographic order, encoded as base64url.
 */
const computeThumbprint = async (jwk: JsonWebKey): Promise<string> => {
  const requiredMembers =
    jwk.kty === "RSA"
      ? { e: jwk.e, kty: jwk.kty, n: jwk.n }
      : { crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y };

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(requiredMembers)),
  );

  return toBase64Url(digest);
};

const getKeyGenParams = (
  algorithm: JwkAlgorithm,
  modulusLength: JwkModulusLength,
): RsaHashedKeyGenParams | EcKeyGenParams => {
  const namedCurve = ecCurves[algorithm];

  return namedCurve
    ? { name: "ECDSA", namedCurve }
    : {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-256",
      };
};

/**
 * Drops the Web Crypto specific members and adds the members IdentityServer expects.
 */
const normalizeJwk = (
  jwk: JsonWebKey,
  algorithm: JwkAlgorithm,
  kid: string,
): JsonWebKey & { kid: string } => {
  const normalized: JsonWebKey = { ...jwk };
  delete normalized.key_ops;
  delete normalized.ext;
  return { ...normalized, alg: algorithm, use: "sig", kid };
};

/**
 * Generates a signing key pair in the browser and exports it in both JWK and PEM form.
 * The private key is never sent anywhere - it only exists in the returned value.
 */
export const generateJwkKeyPair = async (
  algorithm: JwkAlgorithm,
  modulusLength: JwkModulusLength = 2048,
): Promise<GeneratedJwkKeyPair> => {
  const keyPair = (await crypto.subtle.generateKey(
    getKeyGenParams(algorithm, modulusLength),
    true,
    ["sign", "verify"],
  )) as CryptoKeyPair;

  const [rawPublicJwk, rawPrivateJwk, spki, pkcs8] = await Promise.all([
    crypto.subtle.exportKey("jwk", keyPair.publicKey),
    crypto.subtle.exportKey("jwk", keyPair.privateKey),
    crypto.subtle.exportKey("spki", keyPair.publicKey),
    crypto.subtle.exportKey("pkcs8", keyPair.privateKey),
  ]);

  const kid = await computeThumbprint(rawPublicJwk);
  const publicJwk = normalizeJwk(rawPublicJwk, algorithm, kid);
  const privateJwk = normalizeJwk(rawPrivateJwk, algorithm, kid);

  return {
    algorithm,
    kid,
    publicJwk: JSON.stringify(publicJwk, null, 2),
    publicJwkCompact: JSON.stringify(publicJwk),
    privateJwk: JSON.stringify(privateJwk, null, 2),
    publicPem: toPem(spki, "PUBLIC KEY"),
    privatePem: toPem(pkcs8, "PRIVATE KEY"),
  };
};

export default {
  isJwkGenerationSupported,
  isEcAlgorithm,
  generateJwkKeyPair,
};
