import { describe, it, expect } from "vitest";
import { encryptScenario, decryptScenario } from "./crypto";
import type { Scenario, EncryptedScenario } from "@/types/scenarioModels";

const mockScenario: Scenario = {
  type: "ORBAT-mapper",
  id: "test-id",
  name: "Test Scenario",
  version: "2.1.0",
  sides: [],
  events: [],
  layers: [],
  mapLayers: [],
};

describe("crypto utils", () => {
  it("encrypts and decrypts a scenario", async () => {
    const password = "my-secret-password";
    const encrypted = await encryptScenario(mockScenario, password);

    expect(encrypted.type).toBe("ORBAT-mapper-encrypted");
    expect(encrypted.ciphertext).toBeDefined();

    const decrypted = await decryptScenario(encrypted, password);
    expect(decrypted).toEqual(mockScenario);
  });

  it("fails to decrypt with wrong password", async () => {
    const password = "correct-password";
    const wrongPassword = "wrong-password";
    const encrypted = await encryptScenario(mockScenario, password);

    await expect(decryptScenario(encrypted, wrongPassword)).rejects.toThrow();
  });

  it("preserves header metadata", async () => {
    const password = "password";
    const header = {
      id: "header-id",
      name: "Header Name",
      description: "Header Description",
    };

    const encrypted = await encryptScenario(mockScenario, password, { header });
    expect(encrypted.header).toEqual(header);
  });

  it("uses different IV and salt for each encryption", async () => {
    const password = "password";
    const encrypted1 = await encryptScenario(mockScenario, password);
    const encrypted2 = await encryptScenario(mockScenario, password);

    expect(encrypted1.crypto.iv).not.toBe(encrypted2.crypto.iv);
    expect(encrypted1.crypto.salt).not.toBe(encrypted2.crypto.salt);
    expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
  });

  it("handles scenarios with special characters", async () => {
    const specialScenario: Scenario = {
      ...mockScenario,
      name: "Scenario with 🚀 and \n newlines and \t tabs and Danish chars æøå",
    };
    const password = "pæsswørd";
    const encrypted = await encryptScenario(specialScenario, password);
    const decrypted = await decryptScenario(encrypted, password);
    expect(decrypted).toEqual(specialScenario);
  });

  it("fails if ciphertext is tampered with", async () => {
    const password = "password";
    const encrypted = await encryptScenario(mockScenario, password);

    // Modify one character in the ciphertext
    const tamperedCiphertext =
      encrypted.ciphertext.substring(0, 10) +
      (encrypted.ciphertext[10] === "A" ? "B" : "A") +
      encrypted.ciphertext.substring(11);

    const tamperedEncrypted = { ...encrypted, ciphertext: tamperedCiphertext };

    await expect(decryptScenario(tamperedEncrypted, password)).rejects.toThrow();
  });

  it("fails if header is tampered with", async () => {
    const password = "password";
    const header = {
      id: "header-id",
      name: "Header Name",
      description: "Header Description",
    };

    const encrypted = await encryptScenario(mockScenario, password, { header });

    // Tamper with the header
    const tamperedHeader = { ...header, name: "Tampered Name" };
    const tamperedEncrypted = { ...encrypted, header: tamperedHeader };

    await expect(decryptScenario(tamperedEncrypted, password)).rejects.toThrow();
  });

  it("fails if version is tampered with", async () => {
    const password = "password";
    const encrypted = await encryptScenario(mockScenario, password);

    // Tamper with the version
    const tamperedEncrypted = { ...encrypted, version: "9.9.9" } as unknown as EncryptedScenario;

    await expect(decryptScenario(tamperedEncrypted, password)).rejects.toThrow();
  });
});
