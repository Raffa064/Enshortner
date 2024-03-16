function Router(db) {
  const express = require("express");
  const router = express.Router();

  router.get("/test", (_, res) => {
    res.send("test");
  });

  const HashRouter = require("./hashRouter");
  router.use("/hash", HashRouter(db));

  const URLRouter = require("./urlRouter");
  router.use("/url", URLRouter(db));

  return router;
}

module.exports = Router;
