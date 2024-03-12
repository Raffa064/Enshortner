function Server(PORT) {
  const express = require("express");
  const app = express();

  function use(middleware) {
    app.use(middleware);
  }

  function start(initializationCallback) {
    app.listen(PORT, () => {
      console.log("[ Server started on port: " + PORT + " ]");

      if (initializationCallback) {
        initializationCallback();
      }
    });
  }

  return {
    use,
    start
  }
}

module.exports = Server;
