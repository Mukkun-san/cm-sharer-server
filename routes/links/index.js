const router = require("express").Router();
const Link = require("../../mongodb/modals/links");
const Download = require("../../mongodb/modals/downloads");
const auth = require("../../auth");
const request = require("request");
const escapeStringRegexp = require("escape-string-regexp");

//---------BEGIN-ADMINISTRATOR-----------
//generate drive link
router.post("/add/drive", auth.admin, async (req, res) => {
  const fileId = req.body.id;
  const fileName = req.body.name;
  const slug = encodeURI(fileName.replace(/[ \.\{\[\}\]]/g, "-")).toLowerCase();
  const size = req.body.size;
  const videoMediaMetadata = req.body.videoMediaMetadata;
  let link = await Link.findOne({ fileId });
  if (!link) {
    let createdOn = new Date();
    link = new Link({
      fileId,
      fileName,
      slug,
      size,
      videoMediaMetadata,
      createdOn,
      type: "gdrive",
      downloads: 0,
    });
    console.log(link);
    link
      .save()
      .then(() => {
        res.json({ slug, msg: "Link was just added" });
      })
      .catch((err) => {
        res.json({
          msg: "Internal Server Error",
        });
      });
  } else {
    res.json({ slug: link.slug, msg: "Link already generated" });
  }
});

//generate yandex link
router.post("/add/yandex", auth.admin, async (req, res) => {
  const public_key = req.body.public_key;
  try {
    let link = await Link.findOne({ type: "yandex", public_key });
    if (link) {
      res.json({
        slug: link.slug,
        msg: "Link Already Generated",
      });
    } else {
      request(
        "https://cloud-api.yandex.net/v1/disk/public/resources?public_key=" +
          public_key,
        function (error, response, body) {
          body = JSON.parse(body);
          if (error) {
            res.send({ msg: "Could not generate Link", error });
          } else if (body.error) {
            res.send({ msg: "File not found" });
          } else {
            const slug = encodeURI(
              body.name.replace(/[ \.\{\[\}\]]/g, "-")
            ).toLowerCase();
            link = new Link({
              public_key,
              slug,
              fileName: body.name,
              createdOn: new Date(),
              fileType: body.mime_type,
              size: body.size,
              type: "yandex",
              downloads: 0,
              DDL: body.file,
            });
            link
              .save()
              .then((result) => {
                res.json({
                  msg: "Link was just Added",
                  slug,
                });
              })
              .catch((error) => {
                res.json({ msg: "Error adding link" });
                console.log(error);
              });
          }
        }
      );
    }
  } catch (error) {
    res.json({ msg: "Internal Server Error" });
  }
});

// delete link by id param
router.delete("/:id", auth.admin, (req, res) => {
  Link.deleteOne({ _id: req.params.id })
    .then(() => {
      res.sendStatus(204); //no content status code
    })
    .catch((err) => {
      res.sendStatus(500);
    });
});

// search for link by name
router.post("/search", auth.admin, (req, res) => {
  Link.find({
    fileName: { $regex: escapeStringRegexp(req.body.q), $options: "i" },
    type: req.body.type,
  })
    .sort({ createdOn: -1 })
    .exec()
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

//---------END-ADMINISTRATOR-----------

//---------BEGIN-PUBLIC-----------

//get a link by type & slug params
router.get("/:type/:slug", (req, res) => {
  const slug = req.params.slug;
  const type = req.params.type;
  console.log(req.params);
  Link.findOne({ type, slug })
    .then((link) => {
      res.json({ linkExists: true, ...link._doc });
    })
    .catch((err) => {
      res.json({ linkExists: false });
    });
});

// save download info to db
router.post("/download", async (req, res) => {
  console.log(req.body);
  const linkId = req.body._id;
  const userId = req.body.userId;
  try {
    let link = await Link.findOne({ _id: linkId });
    link.downloads++;
    const fileName = link.fileName;
    const date = new Date();
    let download = new Download({
      linkId,
      fileName,
      userId,
      date,
    });
    await download.save();
    await link.save();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

//---------END-PUBLIC-----------

module.exports = router;
