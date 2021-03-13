require("dotenv").config();
require("./mongodb");

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");

const app = express();
app.use(cors({ origin: "*" }));
app.use(morgan("tiny"));
app.use(bodyParser.json());

let routes = require("./routes");
app.use("/api/v1", routes);

let PORT = process.env.PORT || 4545;
app.listen(PORT, () =>
  console.log(`⚡⚡ Server listening to port ${PORT} ⚡⚡`)
);
