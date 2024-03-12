function Router() {
  const express = require("express");
  const router = express.Router();

  router.get("/test", (_, res) => {
    res.send("test");
  })

  return router;
}

module.exports = Router;
