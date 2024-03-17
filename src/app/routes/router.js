const { rootPath } = require("../../utils");

function Router(db) {
  const express = require("express");
  const router = express.Router();

  router.use(express.static(rootPath("public")));

  router.get("/test", (_, res) => {
    res.send("test");
  });

  const HashRouter = require("./hash-router");
  router.use("/hash", HashRouter(db));

  const URLRouter = require("./url-router");
  router.use("/url", URLRouter(db));

  return router;
}

module.exports = Router;
