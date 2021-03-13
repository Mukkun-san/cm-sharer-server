const router = require("express").Router();

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

router.get("/", (req, res) => {
  res.sendStatus(200);
});

module.exports = router;
