const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const path = require("path");

const SCOPES = ["https://www.googleapis.com/auth/drive"];
const TOKEN_PATH = path.join(__dirname, "token.json");

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function drivelinkExists(fileId) {
  console.log(fileId);
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, "credentials.json"), (err, content) => {
      if (err) return console.log("Error loading client secret file:", err);
      // Authorize a client with credentials, then call the Google Drive API.
      authorize(JSON.parse(content), (auth) => {
        const drive = google.drive({ version: "v3", auth });
        drive.files
          .get({
            fileId,
            supportsAllDrives: true,
            fields: "*",
          })
          .then((result) => {
            resolve({ result: result.data });
          })
          .catch((err) => {
            console.log(err);
            reject({ err });
          });
      });
    });
  });
}

module.exports = { drivelinkExists };
