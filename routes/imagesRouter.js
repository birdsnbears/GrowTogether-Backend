var express = require("express");
var fs = require("fs");
var path = require("path");
var router = express.Router();
const Image = require("../models/image");

/* GET ALL Images (FOR DEBUG ONLY) */
router.get("/", async function (req, res) {
  await createDefaultIfEmpty();
  const result = await Image.find();
  res.json(result);
});

var multer = require("multer");

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    cb(null, "temp.png");
  },
});

var upload = multer({ storage: storage });

/* POST new Image */
router.post("/", upload.single("image"), (req, res) => {
  const obj = {
    content: {
      data: fs.readFileSync(
        path.join(__dirname + "/../public/images/" + req.file.filename)
      ),
      contentType: "image/png",
    },
  };
  Image.create(obj, (err, item) => {
    if (err) {
      console.log(err);
      return res.status(500).send();
    } else {
      // item.save();
      // res.redirect("/");
      // res.status(201);
      return res.status(201).send(item._id);
    }
  });
});

/* GET Image */
router.get("/:imageID", async function (req, res) {
  try {
    const image = await Image.findById(req.params.imageID);
    if (image == null) {
      return res.status(404).json({ message: "Cannot find image" }); // Not Found
    } else {
      res.contentType("json");
      res.send(image.content);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

async function createDefaultIfEmpty() {
  const dbContents = await Image.find();
  if (dbContents.length == 0) {
    var a = new Image();
    a.content.data = fs.readFileSync(
      __dirname + "/../public/images/DefaultCampaign.png"
    );
    a.content.contentType = "image/png";
    await a.save();
  }
}

module.exports = router;
