import crypto from "crypto";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { encryptWithPublicKey } from "./encrypt.js";
import { decryptWithPrivateKey } from "./decrypt.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicKey = fs.readFileSync(__dirname + "/id_rsa_pub.pem", "utf8");
const privateKey = fs.readFileSync(__dirname + "/id_rsa_priv.pem", "utf8");

const encryptedMessage = encryptWithPublicKey(
  publicKey,
  "Super secret message"
);

const decryptedMessage = decryptWithPrivateKey(privateKey, encryptedMessage);

console.log(decryptedMessage.toString());
