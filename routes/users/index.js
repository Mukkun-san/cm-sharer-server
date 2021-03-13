const router = require("express").Router();
const User = require("../../mongodb/modals/users");
const auth = require("../../auth");
("");

router.post("/addOne", auth.admin, async (req, res) => {
  console.log("------------", req.body);
  let guid = req.body.uid;
  let user = await User.findOne({ guid });
  if (!user) {
    let email = req.body.email;
    let username = req.body.username;
    let picture = req.body.picture;
    let joinedOn = new Date();
    user = new User({
      guid,
      username,
      email,
      picture,
      joinedOn,
    });
    user
      .save()
      .then((result) => {
        console.log(result);
        res.sendStatus(200);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
  } else {
    console.log("user exists");
    res.sendStatus(200);
  }
});

router.get("/all", auth.admin, async (req, res) => {
  User.find({})
    .sort("joinedOn")
    .exec(function (err, users) {
      if (err) {
        res.send({ err });
      }
      res.send({ users });
    });
});

router.delete("/:_id", auth.admin, (req, res) => {
  User.deleteOne({ _id: req.params._id })
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      res.sendStatus(500);
    });
});

module.exports = router;
