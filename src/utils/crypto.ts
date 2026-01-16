import type {
  EncryptedScenario,
  EncryptedScenarioHeader,
  Scenario,
} from "@/types/scenarioModels";

const ENCRYPTION_VERSION = "1.0.0" as const;
const DEFAULT_ITERATIONS = 600_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

export interface EncryptScenarioOptions {
  header?: EncryptedScenarioHeader;
}

/**
 * Encrypts a Scenario object with a password using AES-GCM.
 *
 * @param scenario - The scenario to encrypt.
 * @param password - The password to use for encryption.
 * @param options - Encryption options.
 * @returns The encrypted scenario object.
 */
export async function encryptScenario(
  scenario: Scenario,
  password: string,
  options: EncryptScenarioOptions = {},
): Promise<EncryptedScenario> {
  const { header } = options;
  const salt = generateRandomBytes(SALT_LENGTH);
  const iv = generateRandomBytes(IV_LENGTH);
  const key = await deriveKey(password, salt, DEFAULT_ITERATIONS);

  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(scenario));

  // 1. Prepare the AAD (Additional Authenticated Data)
  // We bind the version and the header to the encryption. 
  // If these are modified later, decryption will throw an error.
  const aad = encoder.encode(JSON.stringify({ 
    version: ENCRYPTION_VERSION, 
    header: header 
  }));

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: aad },
    key,
    plaintext,
  );

  return {
    type: "ORBAT-mapper-encrypted",
    version: ENCRYPTION_VERSION,
    ciphertext: bufferToBase64(ciphertextBuffer),
    crypto: {
      algorithm: "AES-GCM",
      iv: bufferToBase64(iv),
      salt: bufferToBase64(salt),
      iterations: DEFAULT_ITERATIONS,
      keySize: 256,
    },
    header,
  };
}

/**
 * Decrypts an EncryptedScenario object with a password.
 *
 * @param encrypted - The encrypted scenario object.
 * @param password - The password to use for decryption.
 * @returns The decrypted scenario object.
 * @throws Error if decryption fails (e.g., wrong password).
 */
export async function decryptScenario(
  encrypted: EncryptedScenario,
  password: string,
): Promise<Scenario> {
  const salt = base64ToUint8Array(encrypted.crypto.salt);
  const iv = base64ToUint8Array(encrypted.crypto.iv);
  const ciphertext = base64ToUint8Array(encrypted.ciphertext);

  const key = await deriveKey(password, salt, encrypted.crypto.iterations);
  // 2. Reconstruct the AAD
  // We must recreate the exact same byte sequence used during encryption.
  const encoder = new TextEncoder();
  const aad = encoder.encode(JSON.stringify({ 
    version: encrypted.version, 
    header: encrypted.header 
  }));
  try {
    const plaintextBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, additionalData: aad },
    key,
    ciphertext,
  );

  const decoder = new TextDecoder();
  const json = decoder.decode(plaintextBuffer);
  return JSON.parse(json) as Scenario;
    
  } catch (error) {
    // If this fails, it means either the password is wrong OR the header was tampered with.
    throw new Error("Decryption failed. Invalid password or data integrity check failed.");
  }
}

async function deriveKey(
  password: string,
  salt: BufferSource,
  iterations: number,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function generateRandomBytes(length: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(length)) as Uint8Array<ArrayBuffer>;
}

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  const CHUNK_SIZE = 0x8000; // 32KB chunks

  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    binary += String.fromCharCode.apply(null, chunk as any);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes as Uint8Array<ArrayBuffer>;
}
