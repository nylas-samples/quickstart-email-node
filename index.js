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
});

const app = express();
const port = 3000;

// route to initialize authentication
app.get("/nylas/auth", (req, res) => {
  const authUrl = nylas.auth.urlForOAuth2({
    clientId: config.clientId,
    redirectUri: config.callbackUri,
  });

  //   scope: [
  //     "https://www.googleapis.com/auth/userinfo.email",
  //     "https://www.googleapis.com/auth/openid",
  //     "https://www.googleapis.com/auth/gmail.modify",
  //     "https://www.googleapis.com/auth/calendar",
  //     "https://www.googleapis.com/auth/contacts",
  //     "https://www.googleapis.com/auth/userinfo.profile",
  //   ],

  console.log(authUrl);

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

  try {
    const response = await nylas.auth.exchangeCodeForToken({
      clientSecret: config.clientSecret,
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      code,
    });

    const { grantId } = response;

    res.status(200);
  } catch (error) {
    res.status(500).send("Failed to exchange authorization code for token");
  }
});
