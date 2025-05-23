import crypto from "crypto";

export function decryptWithPrivateKey(privateKey, encryptedMessage) {
  return crypto.privateDecrypt(privateKey, encryptedMessage);
}

export function decryptWithPublicKey(publicKey, encryptedMessage) {
  return crypto.publicDecrypt(publicKey, encryptedMessage);
}
