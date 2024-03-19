const { describe, it } = require("node:test");
const assert = require("assert");
const TestDatabase = require("./database/test-db");
const Server = require("../src/app/server");
const Router = require("../src/app/routes/router");
const { setTimeout } = require("timers/promises");
const db = TestDatabase();

db.connect((err) => {
  if (err) {
    console.log(err);
    return;
  }

  // It`ll be addeed to database
  const registeredURL = "https://example.com/";
  const registeredHash = "00000000000000000000000000000000";

  // It will not be added to database
  const unregisteredURL = "https://unregistereed.url.com/";

  const wrongFormatURLs = [
    "sitetedotcom/routes/subroute",
    "http://unsecureurl",
    "https://anything",
    "https://anything/route/subroute"
  ]; 

  describe("Database test", () => {
    it("Adding first", () => {
      return db.addURLShortener(registeredURL, registeredHash);
    });

    it("Adding twice", () => {
      return db.addURLShortener(registeredURL, registeredHash)
        .then(() => {
          assert.fail("Added duplicated entries");
        }).catch(nothing)
    });

    it("Get by URL", () => {
      return db.getHashByURL(registeredURL)
        .then(row => {
          if (row.hash !== registeredHash) {
            asset.fail("Row hash doesn't matches the expected value: " + row.hash);
          }
        });
    });

    it("Get by hash", () => {
      return db.getURLByHash(registeredHash)
        .then(row => {
          if (row.url !== registeredURL) {
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

        describe("Route /hash/:hash", () => {
          it("Valid hash", () => {
            return fetch(serverUrl + "/hash/" + registeredHash)
              .then((res) => {
                assert.strictEqual(res.status, 200, "Invalid status code");

                if (!res.redirected) {
                  assert.fail("Not redirected as expected.");
                }
              }).catch((err) => {
                if (err.hostname === registeredURL) {
                  console.log(err);
                  assert.fail("Not redirecteed as expected (+ error).");
                }
              });
          });

          it("Valid hash (noredirect)", () => {
            return fetch(serverUrl + "/hash/" + registeredHash + "?noredirect=true")
              .then((res) => {
                assert.strictEqual(res.status, 200, "Invalid status code");
                return res.json()
              })
              .then((json) => {
                assert.deepStrictEqual(json, {
                  redirectURL: registeredURL
                }, "Invalid response");
              });
          });

          it("Invalid hash", () => {
            return fetch(serverUrl + "/hash/64646464646464646464646464646464")
              .then((res) => {
                assert.strictEqual(res.status, 404, "Invalid status code");
              });
          });

          it("Invalid hash (noredirect)", () => {
            return fetch(serverUrl + "/hash/64646464646464646464646464646464?noredirect=true")
              .then((res) => {
                assert.strictEqual(res.status, 404, "Invalid status code");
              })
          });
        });

        describe("Route /url?u=", () => {
          it("Valid url", () => {
            return fetch(serverUrl+"/url?u="+encodeURI(registeredURL))
              .then((res) => {
                assert.strictEqual(res.status, 200, "Invalid status code.");
                return res.json();
              })
              .then((json) => {
                assert.deepStrictEqual(json, {
                  hash: registeredHash,
                  hashURL: serverUrl+"/hash/"+registeredHash
                }, "Invalid response");
              });
          });
          
          it("Invalid url (automatic add to database)", () => {
            return fetch(serverUrl+"/url?u="+encodeURI(unregisteredURL))
              .then((res) => {
                assert.strictEqual(res.status, 200, "Invalid status code");
                return res.json();
              })
              .then(async (json) => {
                const hash = json.hash;
                const { url } = await db.getURLByHash(hash);
                assert.equal(url, unregisteredURL, "Invalid database insertion");
              });
          });

          it("URL format", async () => {
            for (const url of wrongFormatURLs) {
              await fetch(serverUrl+"/url?u="+url)
                .then(() => assert.fail("Wrong formated url passed by filter: "+url))
                .catch(nothing);
            }
          });
        });
      });
    }).finally(() => {
      db.destroy();
    });
  });
});

function nothing() { }
