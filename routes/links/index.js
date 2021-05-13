const router = require("express").Router();
const Link = require("../../mongodb/modals/links");
const StreamTapeLink = require("../../mongodb/modals/streamTapeLink");
const Download = require("../../mongodb/modals/downloads");
const auth = require("../../auth");
const request = require("request");
const fetch = require("node-fetch");
const escapeStringRegexp = require("escape-string-regexp");
const { YandexAPI, StreamTapeAPI, OpenDriveAPI } = require("../../consts.js");

//---------BEGIN-ADMINISTRATOR-----------
//generate google drive link
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
        YandexAPI.getFileResource(public_key),
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

//generate opendrive link
router.post("/add/opendrive", auth.admin, async (req, res) => {
  const fileId = req.body.fileId;
  try {
    let link = await Link.findOne({ type: "opendrive", fileId });
    if (link) {
      res.json({
        slug: link.slug,
        msg: "Link Already Generated",
      });
    } else {
      request(OpenDriveAPI(fileId), function (error, response, body) {
        body = JSON.parse(body);
        if (error) {
          res.send({ msg: "Could not generate Link", error });
        } else if (body.error) {
          res.send({ msg: "File not found" });
        } else {
          const slug = encodeURI(
            body.Name.replace(/[ \.\{\[\}\]]/g, "-")
          ).toLowerCase();
          link = new Link({
            fileId,
            slug,
            fileName: body.Name,
            createdOn: new Date(),
            fileType: body.Extension,
            size: body.Size,
            type: "opendrive",
            downloads: 0,
            DDL: body.DownloadLink,
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
      });
    }
  } catch (error) {
    res.json({ msg: "Internal Server Error" });
  }
});

//generate streamtape link
router.post("/generate/streamtape", auth.admin, async (req, res) => {
  if (!Object.keys(req.body).length) {
    res.json({
      status: 400,
      msg: "Bad Request",
      error: "Message body is absent",
    });
    return;
  }
  const fileId = req.body.fileId;
  try {
    let link = await StreamTapeLink.findOne({ id: fileId });
    if (link) {
      res.json({
        slug: link.slug,
        msg: "Link Already Generated",
      });
    } else {
      request(
        StreamTapeAPI.getFileInfo(fileId),
        async function (error, response, body) {
          body = JSON.parse(body);
          if (error) {
            res.send({ msg: "Could not generate Link", error });
          } else if (body.error) {
            res.send({ msg: "File not found" });
          } else {
            let slug = encodeURI(
              body.result[fileId].name.replace(/[ \.\{\[\}\]]/g, "-")
            ).toLowerCase();
            let sameSlugExits = (await StreamTapeLink.find({ slug })).length;
            solveSlugCollision = async (count) => {
              sameSlugExits = (
                await StreamTapeLink.find({
                  slug: slug + (count == 1 ? "" : "-" + count),
                })
              ).length;
              if (sameSlugExits) {
                count++;
                return solveSlugCollision(count);
              }
              slug += "-" + count;
              return;
            };
            if (sameSlugExits) await solveSlugCollision(1);
            link = new StreamTapeLink({
              ...body.result[fileId],
              slug,
              downloads: 0,
              createdOn: new Date(),
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

//get a streamtape download link
router.get("/streamtape/:slug", async (REQ, RES) => {
  const slug = REQ.params.slug;
  const link = await StreamTapeLink.findOne({ slug });
  if (link) {
    fileId = link.id;
    let response;
    response = await (
      await fetch(StreamTapeAPI.getDownloadTicket(fileId))
    ).json();
    if (response.status == 200) {
      await new Promise((r) =>
        setTimeout(r, (response.result.wait_time * 10 + 5) * 100)
      ); // Waiting time required to use the generated download ticket
      response = await (
        await fetch(
          StreamTapeAPI.getDownloadLink(fileId, response.result.ticket)
        )
      ).json();
      console.log(response);
      response.status == 200
        ? RES.json({ status: 200, ddl: response.result.url })
        : RES.json({
            status: response.status,
            msg: "Internal Server Error",
            streamTapeMsg: response.msg,
          });
    } else {
      RES.json({
        status: response.status,
        msg: "Internal Server Error",
        streamTapeMsg: response.msg,
      });
    }
  } else {
    RES.json({ status: 200, linkExists: false });
  }
  /* .then((link) => {
      request(StreamTapeAPI.,function (error, response, body) {
              res.json({ linkExists: true, ...link.toObject() });

      });
    })
    .catch((err) => {
      res.json({ linkExists: false });
    });
    */
});

//get a link by type & slug params
router.get("/:type/:slug", (req, res) => {
  const slug = req.params.slug;
  const type = req.params.type;
  Link.findOne({ type, slug })
    .then((link) => {
      res.json({ linkExists: true, ...link.toObject() });
    })
    .catch((err) => {
      res.json({ linkExists: false });
    });
});

// save download info to db
router.post("/download", async (req, res) => {
  console.log(req.body);
  const linkId = req.body._id;
  const userId = req.body.userId || null;
  try {
    let link = await Link.findOne({ _id: linkId });
    console.log(link);
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
