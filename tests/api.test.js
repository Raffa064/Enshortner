const { describe, it, expect } = require("node:test");
const assert = require("assert");
const TestDatabase = require("./database/test-db");
const Server = require("../src/app/server");
const Router = require("../src/app/routes/router");
const db = TestDatabase();

db.connect((err) => {
  if (err) {
    console.log(err);
    return;
  }

  // It`ll be addeed to database
  const exmapleURL = "https://exmaple.com/";
  const exampleHash = "00000000000000000000000000000000";

  // It will not be added to database
  const invalidURL = "https://invalid.host.com/";
  const invalidHash = "11111111111111111111111111111111";

  const wrongURLs = [
    "sitetedotcom/routes/subroute",
    "http://unsecureurl",
    "https://anything",
    "https://anything/route/subroute"
  ]; 

  describe("Database test", () => {
    it("Adding first", () => {
      return db.addURLShortener(exmapleURL, exampleHash);
    });

    it("Adding twice", () => {
      return db.addURLShortener(exmapleURL, exampleHash)
        .then(() => {
          assert.fail("Added duplicated entries");
        }).catch(nothing)
    });

    it("Get by URL", () => {
      return db.getHashByURL(exmapleURL)
        .then(row => {
          if (row.hash !== exampleHash) {
            asset.fail("Row hash doesn't matches the expected value: " + row.hash);
          }
        });
    });

    it("Get by hash", () => {
      return db.getURLByHash(exampleHash)
        .then(row => {
          if (row.url !== exmapleURL) {
            assert.fail("Row url doesn't matches the expected value: " + row.url);
          }
        });
    });
  });

  const PORT = process.env.ENSHORTNER_TEST_PORT || 8888;
  const serverUrl = "http://localhost:" + PORT;
  const server = Server(PORT);
  const router = Router(db);

  server.use(router);
  server.start((err) => {
    describe("API Test", () => {
      it("Server started at port " + PORT, () => {
        if (err) {
          console.log(err);
          assert.fail("Error at server initialization");
        }
      });

      describe("Testing routes", () => {
        it("/test", () => {
          return fetch(serverUrl + "/test")
            .then((res) => res.text())
            .then((text) => {
              if (text !== "test") {
                assert.fail("Invalid test");
              }
            });
        });

        describe("/hash/:hash", () => {
          it("Valid hash", () => {
            return fetch(serverUrl + "/hash/" + exampleHash)
              .then((res) => {
                assert.strictEqual(res.status, 200, "Invalid status code");

                if (!res.redirected) {
                  assert.fail("Not redirected as expected.");
                }
              }).catch((err) => {
                if (err.hostname === exmapleURL) {
                  console.log(err);
                  assert.fail("Not redirecteed as expected (+ error).");
                }
              });
          });

          it("Valid hash (noredirect)", () => {
            return fetch(serverUrl + "/hash/" + exampleHash + "?noredirect=true")
              .then((res) => {
                assert.strictEqual(res.status, 200, "Invalid status code");
                return res.json()
              })
              .then((json) => {
                assert.deepStrictEqual(json, {
                  redirectURL: exmapleURL
                });
              });
          });

          it("Invalid hash", () => {
            return fetch(serverUrl + "/hash/" + invalidHash)
              .then((res) => {
                assert.strictEqual(res.status, 404, "Invalid status code");
              });
          });

          it("Invalid hash (noredirect)", () => {
            return fetch(serverUrl + "/hash/" + invalidHash + "?noredirect=true")
              .then((res) => {
                assert.strictEqual(res.status, 404, "Invalid status code");
              });
          });
        });

        describe("/url?u=", () => {
        });
      });
    });
  });
})

function nothing() { }
