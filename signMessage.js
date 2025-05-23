import crypto from "crypto";
import fs from "fs";
import { encryptWithPrivateKey } from "./encrypt.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const hash = crypto.createHash("sha256");

const myData = {
  firstName: "Maickel",
  secondName: "Cardoso",
};

const myDataString = JSON.stringify(myData);

hash.update(myDataString);

const hashedData = hash.digest("hex");

const senderPrivateKey = fs.readFileSync(
  __dirname + "/id_rsa_priv.pem",
  "utf8"
);

const signedMessage = encryptWithPrivateKey(senderPrivateKey, hashedData);

export const packageOfDataToSend = {
  algorithm: "sha256",
  originalData: myData,
  signedAndEncryptedData: signedMessage,
};
