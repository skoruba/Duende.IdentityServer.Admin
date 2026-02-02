export enum RandomValues {
  None,
  ClientId,
  SharedSecret,
}

/**
 * Generates a random hexadecimal string of the specified byte length.
 * @param byteLength - The number of random bytes to generate.
 * @returns A hexadecimal string representation of the random bytes.
 */
export const generateHexString = (byteLength: number): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(byteLength)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

/**
 * Generates a random client ID with a fixed prefix.
 * @returns A 16-byte random client ID prefixed with "client_".
 */
export const generateRandomClientId = (): string => {
  return `client_${generateHexString(16)}`;
};

/**
 * Generates a random shared secret with a fixed prefix.
 * @returns A 32-byte random shared secret prefixed with "secret_".
 */
export const generateRandomSharedSecret = (): string => {
  return `secret_${generateHexString(32)}`;
};

export default {
  generateHexString,
  generateRandomClientId,
  generateRandomSharedSecret,
};
