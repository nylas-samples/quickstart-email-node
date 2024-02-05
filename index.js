import "dotenv/config";
import express from "express";
import Nylas from "nylas";

const config = {
  clientId: process.env.NYLAS_CLIENT_ID,
  clientSecret: process.env.NYLAS_CLIENT_SECRET,
  callbackUri: "http://localhost:3000/login/nylas/authorized",
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: process.env.NYLAS_API_URI,
};

const nylas = new Nylas({
  apiKey: config.apiKey,
  apiUri: config.apiUri, // "https://api.us.nylas.com" or "https://api.eu.nylas.com"
});

const app = express();
const port = 3000;

// route to initialize authentication
app.get("/nylas/auth", (req, res) => {
  const authUrl = nylas.auth.urlForOAuth2({
    clientId: config.clientId,
    redirectUri: config.callbackUri,
  });

  console.log("authUrl", authUrl);

  res.redirect(authUrl);
});

// start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// callback route Nylas redirects to
app.get("/login/nylas/authorized", async (req, res) => {
  console.log("Received callback from Nylas");
  const code = req.query.code;

  if (!code) {
    res.status(400).send("No authorization code returned from Nylas");
    return;
  }

  const codeExchangePayload = {
    clientSecret: config.apiKey,
    clientId: config.clientId,
    redirectUri: config.callbackUri,
    code,
  };

  console.log("codeExchangePayload", codeExchangePayload);

  try {
    const response = await nylas.auth.exchangeCodeForToken(codeExchangePayload);

    const { grantId } = response;

    console.log("grantId", grantId);

    res.sendStatus(200);
  } catch (error) {
    console.error("Failed to exchange authorization code for token", error);
    res.status(500).send("Failed to exchange authorization code for token");
  }
});
