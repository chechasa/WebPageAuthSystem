import crypto from "crypto";
import fs from "fs";
import { encryptWithPrivateKey } from "./encrypt.js";
import { decryptWithPublicKey } from "./decrypt.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { packageOfDataToSend } from "./signMessage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const receivedData = packageOfDataToSend;

const hash = crypto.createHash(receivedData.algorithm);

hash.update(JSON.stringify(receivedData.originalData));

const hashOfOriginalHex = hash.digest("hex");

const publicKey = fs.readFileSync(__dirname + "/id_rsa_pub.pem", "utf8");

const decryptedMessage = decryptWithPublicKey(
  publicKey,
  receivedData.signedAndEncryptedData
);

const decryptedMessageHex = decryptedMessage.toString();

console.log(decryptedMessageHex);

if (hashOfOriginalHex == decryptedMessageHex) {
  console.log("That's an official signed data");
} else {
  console.log("The data has been tampered");
}
