const jwt = require("jsonwebtoken");

exports.admin = (req, res, next) => {
  const accessToken = req.headers.authorization;

  if (!accessToken) {
    res.json({ error: "No access token sent to the server" });
  } else {
    jwt.verify(accessToken, process.env.ADMIN_TOKEN_SECRET, (err, user) => {
      if (err) {
        console.log("Access token could not be verified");
        res.json({
          error: "Unauthorized Access",
        });
      } else {
        console.log("Access token verified");
        next();
      }
    });
  }
};

exports.user = (req, res, next) => {
  const accessToken = req.headers.authorization;

  if (!accessToken) {
    res.json({ error: "No access token sent to the server" });
  } else {
    jwt.verify(accessToken, process.env.USER_TOKEN_SECRET, (err, user) => {
      if (err) {
        console.log("Access token is invalid or expired");
        res.json({
          error: "Unauthorized Access",
        });
      } else {
        console.log("Access token verified");
        next();
      }
    });
  }
};
