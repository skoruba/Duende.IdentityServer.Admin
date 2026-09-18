import { describe, expect, it } from "vitest";
import {
  JwkAlgorithm,
  fapiSigningAlgorithms,
  generateJwkKeyPair,
  isEcAlgorithm,
  isFapiSigningAlgorithm,
} from "./JwkHelper";

/**
 * The FAPI 2.0 Security Profile (section 5.4) permits PS256, ES256 and
 * EdDSA only. PS256 and RS256 both produce an RSA key, so the distinguishing
 * property is the padding scheme - which is only observable by actually signing.
 */
const signAndVerify = async (
  privateJwk: string,
  publicJwk: string,
  importParams: RsaHashedImportParams | EcKeyImportParams,
  signParams: AlgorithmIdentifier | RsaPssParams | EcdsaParams,
) => {
  const data = new TextEncoder().encode("client assertion");

  const privateKey = await crypto.subtle.importKey(
    "jwk",
    JSON.parse(privateJwk),
    importParams,
    false,
    ["sign"],
  );

  const publicKey = await crypto.subtle.importKey(
    "jwk",
    JSON.parse(publicJwk),
    importParams,
    false,
    ["verify"],
  );

  const signature = await crypto.subtle.sign(signParams, privateKey, data);

  return crypto.subtle.verify(signParams, publicKey, signature, data);
};

describe("JWK generation", () => {
  it("marks only the FAPI 2.0 permitted algorithms as compliant", () => {
    expect(fapiSigningAlgorithms).toEqual(["PS256", "ES256"]);

    expect(isFapiSigningAlgorithm("PS256")).toBe(true);
    expect(isFapiSigningAlgorithm("ES256")).toBe(true);

    expect(isFapiSigningAlgorithm("RS256")).toBe(false);
    expect(isFapiSigningAlgorithm("ES384")).toBe(false);
    expect(isFapiSigningAlgorithm("ES512")).toBe(false);
  });

  it("knows which algorithms are elliptic curve based", () => {
    expect(isEcAlgorithm("ES256")).toBe(true);
    expect(isEcAlgorithm("PS256")).toBe(false);
    expect(isEcAlgorithm("RS256")).toBe(false);
  });

  it("generates a PS256 key that signs with RSA-PSS padding", async () => {
    const keyPair = await generateJwkKeyPair("PS256");
    const publicJwk = JSON.parse(keyPair.publicJwk);

    expect(publicJwk.kty).toBe("RSA");
    expect(publicJwk.alg).toBe("PS256");
    expect(publicJwk.use).toBe("sig");

    const isValid = await signAndVerify(
      keyPair.privateJwk,
      keyPair.publicJwk,
      { name: "RSA-PSS", hash: "SHA-256" },
      { name: "RSA-PSS", saltLength: 32 },
    );

    expect(isValid).toBe(true);
  });

  it("still generates RS256 with PKCS#1 v1.5 padding for non-FAPI deployments", async () => {
    const keyPair = await generateJwkKeyPair("RS256");
    const publicJwk = JSON.parse(keyPair.publicJwk);

    expect(publicJwk.kty).toBe("RSA");
    expect(publicJwk.alg).toBe("RS256");

    const isValid = await signAndVerify(
      keyPair.privateJwk,
      keyPair.publicJwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      "RSASSA-PKCS1-v1_5",
    );

    expect(isValid).toBe(true);
  });

  it("generates ES256 on the P-256 curve", async () => {
    const keyPair = await generateJwkKeyPair("ES256");
    const publicJwk = JSON.parse(keyPair.publicJwk);

    expect(publicJwk.kty).toBe("EC");
    expect(publicJwk.crv).toBe("P-256");
    expect(publicJwk.alg).toBe("ES256");
  });

  it("honours the requested RSA modulus length", async () => {
    const keyPair = await generateJwkKeyPair("PS256", 3072);
    const publicJwk = JSON.parse(keyPair.publicJwk);

    // The base64url modulus carries one byte per 8 bits of key length.
    const modulusBytes = Buffer.from(publicJwk.n, "base64url").length;

    expect(modulusBytes).toBe(3072 / 8);
  });

  it("uses the RFC 7638 thumbprint as the kid of both keys", async () => {
    const keyPair = await generateJwkKeyPair("ES256");

    const publicJwk = JSON.parse(keyPair.publicJwk);
    const privateJwk = JSON.parse(keyPair.privateJwk);

    expect(publicJwk.kid).toBe(keyPair.kid);
    expect(privateJwk.kid).toBe(keyPair.kid);

    // base64url encoded SHA-256, so 32 bytes without padding.
    expect(keyPair.kid).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("keeps the private key material out of the public JWK", async () => {
    const keyPair = await generateJwkKeyPair("PS256");

    expect(JSON.parse(keyPair.publicJwk).d).toBeUndefined();
    expect(JSON.parse(keyPair.privateJwk).d).toBeDefined();

    expect(keyPair.publicPem).toMatch(/^-----BEGIN PUBLIC KEY-----/);
    expect(keyPair.privatePem).toMatch(/^-----BEGIN PRIVATE KEY-----/);
  });

  it("drops the Web Crypto specific members", async () => {
    const keyPair = await generateJwkKeyPair("ES256");
    const publicJwk = JSON.parse(keyPair.publicJwk);

    expect(publicJwk.key_ops).toBeUndefined();
    expect(publicJwk.ext).toBeUndefined();
  });
});

describe("algorithm coverage", () => {
  const allAlgorithms: JwkAlgorithm[] = [
    "PS256",
    "RS256",
    "ES256",
    "ES384",
    "ES512",
  ];

  it.each(allAlgorithms)("generates a usable key pair for %s", async (algorithm) => {
    const keyPair = await generateJwkKeyPair(algorithm);

    expect(keyPair.algorithm).toBe(algorithm);
    expect(JSON.parse(keyPair.publicJwk).alg).toBe(algorithm);
    expect(keyPair.kid).toBeTruthy();
  });
});
