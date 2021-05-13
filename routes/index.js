const router = require("express").Router();
const test = require("express").Router();
var BoxSDK = require("box-node-sdk");

test.get("/", (req, res) => {
  var sdkConfig = require("../box-drive-config.json");
  var sdk = BoxSDK.getPreconfiguredInstance(sdkConfig);
  var serviceAccountClient = sdk.getAppAuthClient("enterprise");
  var client;

  client = BoxSDK.getBasicClient("2ny3zabh9whbu751ytj5r2f4m2zf1e8m");
  client = sdk.getAppAuthClient("user", "15916935092");

  client.users
    .get(client.CURRENT_USER_ID)
    .then((user) => console.log("Hello", user.name, "!"))
    .catch((err) => console.log("Got an error!", err.response.body));

  // client.files
  //   .getDownloadURL("NrwZLhWGdWklSy9VPU0uoJof765hLoEV")
  //   .then((downloadURL) => {
  //     console.log(downloadURL);
  //   })
  //   .catch((err) => {
  //     console.log("Got an error!", err.response.headers);
  //   });
  res.sendStatus(200);
});

const admin = require("./admins");
const users = require("./users");
const links = require("./links");
const drive = require("./drive");
const misc = require("./misc");

router.use("/admin", admin);
router.use("/users", users);
router.use("/links", links);
router.use("/drive", drive);
router.use("", misc);
router.use("/box", test);

router.get("/", (req, res) => {
  res.sendStatus(200);
});

module.exports = router;
