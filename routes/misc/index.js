const router = require("express").Router();
const User = require("../../mongodb/modals/users");
const Link = require("../../mongodb/modals/links");
const Download = require("../../mongodb/modals/downloads");
const auth = require("../../auth");

router.get("/stats/getall", auth.admin, async (req, res) => {
  try {
    let users = (await User.find({})).length;
    let links = (await Link.find({})).length;
    let downloads = (await Download.find({})).length;
    res.json({ users, links, downloads });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

module.exports = router;
