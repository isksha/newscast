/**
 * Express webserver / controller
 */

const express = require("express");
const cors = require("cors");

require("dotenv").config();

const webapp = express();
webapp.use(cors());

webapp.use(express.urlencoded({ extended: true }));
const dbLib = require("./dbOperations");

// root endpoint route
webapp.get("/", (req, resp) => {
  dbLib.connect();
  resp.json({ message: "What's up" });
});

// export the webapp
module.exports = webapp;