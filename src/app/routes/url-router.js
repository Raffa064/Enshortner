const { HashResponse, ErrorResponse } = require("./response-types");
const { randomHash } = require("../../utils");

function URLRouter(db) {
  const express = require("express");
  const router = express.Router();

  function isValidURL(url) {
    if (url) { // Not null
      const commaIndex = Math.max(0, url.indexOf(":"));
      var barIndex = url.indexOf("/", commaIndex + 3);

      if (barIndex < 0) {
        barIndex = url.length;
      }

      const protocol = url.substring(0, commaIndex).trim();
      const host = url.substring(commaIndex + 3, barIndex).trim();

      const nonEmptyProtocol = protocol.length > 0;
      const httpsProtocol = protocol === "https";
      const hostWithoutSpaces = host.split(" ").length == 1;
      const includeSubDomains = host.split(".").length > 1;
     
      return nonEmptyProtocol && 
        httpsProtocol &&
        hostWithoutSpaces &&
        includeSubDomains;
    }

    return false;
  }

  function sanitizedURL(url) {
    console.log(url);
    url = decodeURI(url).trim(); // remove url encoding

    if (url.length == 0) {
      // Empty url
      return null;
    }

    if (!url.startsWith("https://")) {
      // google.com -> https://google.com
      url = "https://" + url;
    }

    return url;
  }

  function getHashURL(req, hash) {
    const protocol = req.protocol;
    const host = req.hostname;
    const port = host === "localhost" ? ":"+req.socket.localPort : "";

    return protocol + "://" + host + port + "/hash/" + hash
  }
  
  router.get("/", (req, res) => {
    const url = sanitizedURL(req.query.u);

    if (!isValidURL(url)) {
      const errResponse = ErrorResponse(400, "Invalid url format", url);
      res.status(400).send(errResponse);
      return;
    }

    console.log("URL -> "+url);

    db.getHashByURL(url)
      .then((row) => {
        // When url exists in database
        const { hash } = row;
        const hashResponse = HashResponse(hash, getHashURL(req, hash));
        res.status(200).send(hashResponse);
      })
      .catch((_) => {
        // When url doesn't exists in database
        const hash = randomHash(32);

        db.addURLShortener(url, hash)
          .then((_) => {
            const hashResponse = HashResponse(hash, getHashURL(req, hash));
            res.send(200).send(hashResponse);
          })
          .catch((err) => {
            // Probably hash collision
            console.log("Unexpect error at /url/u=<URL>", err);
            const errResponse = ErrorResponse(500, "Internal server error: can't create url shortener", url);
            res.status(500).send(errResponse);
          });
      });
  })

  return router;
}

module.exports = URLRouter;
