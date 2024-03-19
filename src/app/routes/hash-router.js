const { ErrorResponse, URLResponse } = require("./response-types")

function HashRouter(db) {
  const express = require("express");
  const router = express.Router();

  router.get("/:hash", (req, res) => {
    const { hash } = req.params;
    const { noredirect } = req.query;

    db.getURLByHash(hash)
      .then((row) => {
        const { url } = row;

        if (noredirect) {
          const urlResponse = URLResponse(url); 
          res.status(200).send(urlResponse);
          return;
        }

        res.status(200).redirect(url);
      })
      .catch((_) => {
        const errResponse = ErrorResponse(404, "Hash not found", hash);
        res.status(404).send(errResponse);
      });
  });

  return router;
}

module.exports = HashRouter;
