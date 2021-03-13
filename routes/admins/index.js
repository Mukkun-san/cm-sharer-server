const router = require("express").Router();
const bcrypt = require("bcrypt");
const Admin = require("../../mongodb/modals/admins");
const jwt = require("jsonwebtoken");
const auth = require("../../auth");

router.get("/all", auth.admin, (req, res) => {
  Admin.find({})
    .sort("addedOn")
    .exec(function (err, admins) {
      if (err) {
        res.send({ err });
      }
      res.send({ admins });
    });
});

router.post("/authorize", auth.admin, async (req, res) => {
  res.json({ authorized: true });
});

router.post("/login", async (req, res) => {
  const email = req.body.email,
    password = req.body.password;
  if (!email) {
    res.json({ authorized: false, message: "Please enter Email." });
  } else if (!password) {
    res.json({ authorized: false, message: "Please enter a password." });
  } else {
    try {
      let admin = await Admin.findOne({ email: email });
      if (!admin) {
        res.json({
          authorized: false,
          message: "This is not an admin email.",
        });
      } else {
        if (await bcrypt.compare(password, admin.password)) {
          const accessToken = jwt.sign(
            admin.email,
            process.env.ACCESS_TOKEN_SECRET
          );
          res.json({ authorized: true, accessToken });
        } else {
          res.json({
            authorized: false,
            message: "Password is incorrect.",
          });
        }
      }
    } catch (error) {
      res.json({
        authorized: false,
        message: "Internal Server Error.",
      });
      console.log(error);
    }
  }
});

router.post("/addaccount", auth.admin, async (req, res) => {
  const email = req.body.email,
    password = req.body.password;
  if (!email) {
    res.json({ result: false, message: "Please provide an Email." });
  } else if (!password) {
    res.json({ result: false, message: "Please enter a password." });
  } else if (
    !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
      email
    )
  ) {
    res.json({ result: false, message: "Email is invalid" });
  } else if (password.length < 5) {
    res.json({ result: false, message: "Password have at least 5 chars." });
  } else {
    try {
      let admin = await Admin.findOne({ email: email });
      if (admin) {
        res.json({
          result: false,
          message: "This admin already exists.",
        });
      } else {
        const salt = await bcrypt.genSalt();
        const hashedPass = await bcrypt.hash(password, salt);
        admin = new Admin({
          email,
          password: hashedPass,
          addedOn: new Date(),
        });
        let newAdmin = await admin.save();
        res.json({
          result: true,
          message: "Admin '" + newAdmin.email + "' was just added.",
        });
      }
    } catch (error) {
      res.sendStatus(500);
      console.log(error);
    }
  }
});

router.post("/getProfile", auth.admin, (req, res) => {
  const email = req.body.email;
  Admin.findOne({ email })
    .then((admin) => {
      console.log(admin);
      res.json(admin);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

router.post("/update/username", auth.admin, async (req, res) => {
  const email = req.body.email;
  const username = req.body.username;

  if (!username) {
    res.send({
      error: "Username Not Provided",
    });
  } else if (!email) {
    res.send({
      error: "Email Missing",
    });
  } else {
    Admin.updateOne({ email }, { username })
      .then((admin) => {
        res.sendStatus(200);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
  }
});

router.post("/update/password", auth.admin, async (req, res) => {
  const email = req.body.email;
  const oldPassw = req.body.oldPassw;
  const newPassw = req.body.newPassw;
  if (!oldPassw) {
    res.json({
      error: "Please enter old password",
    });
  } else if (!newPassw) {
    res.json({
      error: "Please enter new password",
    });
  } else {
    try {
      let admin = await Admin.findOne({ email: email });
      if (!admin) {
        res.json({
          error: "This is not an admin email.",
        });
      } else {
        if (await bcrypt.compare(oldPassw, admin.password)) {
          const salt = await bcrypt.genSalt();
          const hashedPass = await bcrypt.hash(newPassw, salt);
          Admin.updateOne({ email }, { password: hashedPass })
            .then((result) => {
              res.sendStatus("OK");
            })
            .catch((err) => {
              res.json({
                error: "Password could not be updated. Please Try again later.",
              });
            });
        } else {
          res.json({
            error: "Password is incorrect.",
          });
        }
      }
    } catch (error) {
      res.sendStatus(500);
      console.log(error);
    }
  }
});

router.delete("/:_id", auth.admin, (req, res) => {
  Admin.deleteOne({ _id: req.params._id })
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      res.sendStatus(500);
    });
});

module.exports = router;
