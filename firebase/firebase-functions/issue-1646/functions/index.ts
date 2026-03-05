import express from "express";
const basicAuth = require("basic-auth-connect");
import cookieParser from "cookie-parser";
import * as functions from "firebase-functions";
import path from "path";

const server = express();
server.use(cookieParser(process.env.COOKIE_SECRET));
server.disable("x-powered-by");
server.all(
  "/*",
  basicAuth((user: string, passwd: string) => user === "username" && passwd === "passwd ")
);

// Middleware to catch and validate URL encoding
server.use((req, res, next) => {
  try {
    decodeURIComponent(req.url);
    next();
  } catch {
    res.status(400).send({ error: "Invalid URL encoding" });
  }
});

server.use("*", express.static(path.join(__dirname, "..", "static")));

export const newapp = functions.https.onRequest(server);
