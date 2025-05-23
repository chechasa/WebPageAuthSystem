import base64url from "base64url";
import crypto from "crypto";
import { decryptWithPublicKey } from "../decrypt.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import { createSign, createVerify } from "crypto";

const verifyFunction = createVerify("RSA-SHA256");
const signatureFunction = createSign("RSA-SHA256");
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const privateKey = fs.readFileSync(__dirname + "/priv_key.pem", "utf-8");
const publicKey = fs.readFileSync(__dirname + "/pub_key.pem", "utf-8");

const headerObj = {
  alg: "RS256",
  typ: "JWT",
};

const payloadObj = {
  sub: "1234567890",
  name: "John Doe",
  admin: true,
  iat: 1516239022,
};

const headerObjString = JSON.stringify(headerObj);
const payloadObjString = JSON.stringify(payloadObj);

const base64UrlHeader = base64url(headerObjString);
const base64UrlPayload = base64url(payloadObjString);

signatureFunction.write(base64UrlHeader + "." + base64UrlPayload);
signatureFunction.end();

const signatureBase64Url = signatureFunction.sign(privateKey, "base64url");

/* 
Verification 
*/

const jwt =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.NHVaYe26MbtOYhSKkoKYdFVomg4i8ZJd8_-RU8VNbftc4TSMb4bXP3l3YlNWACwyXPGffz5aXHc6lty1Y2t4SWRqGteragsVdZufDn5BlnJl9pdR_kdVFUsra2rWKEofkZeIC4yWytE58sMIihvo9H1ScmmVwBcQP6XETqYd0aSHp1gOa9RdUPDvoXQ5oqygTqVtxaDr6wUFKrKItgBMzWIdNZ6y7O9E0DhEPTbE9rfBo6KTFsHAZnMg4k68CDp2woYIaXbmYTWcvbzIuHO7_37GT79XdIwkm95QJ7hYC9RiwrV7mesbY4PAahERJawntho0my942XheVLmGwLMBkQ";

const jwtParts = jwt.split(".");

const headerOfJwt = jwtParts[0];
const dataOfJwt = jwtParts[1];
const signatureOfJwt = jwtParts[2];

verifyFunction.write(headerOfJwt + "." + dataOfJwt);
verifyFunction.end();

const signatureIsValid = verifyFunction.verify(
  publicKey,
  signatureOfJwt,
  "base64url"
);

console.log(signatureIsValid);
