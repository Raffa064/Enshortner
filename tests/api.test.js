const { describe, it } = require("node:test");
const TestDatabase = require("./database/test-db");
const assert = require("assert");

const db = TestDatabase();

db.connect((err) => {
  if (err) {
    console.log(err);
    return;
  }

  describe("Database test", () => {
    const googleURL = "https://google.com/";
    const googleHash = "00000000000000000000000000000000";

    it("Adding first", async () => {
      await db.addURLShortener(googleURL, googleHash);
    });
    
    it("Adding twice", async () => {
      await db.addURLShortener(googleURL, googleHash)
        .then(() => {
          assert.fail("Added duplicated entries");
        }).catch(nothing)
    });

    it("Get by URL", async () => {
      await db.getHashByURL(googleURL)
        .then(row => {
          if (row.hash !== googleHash) {
            asset.fail("Row hash doesn't matches the expected value: "+row.hash);
          }
        });
    });
    
    it("Get by hash", async () => {
      await db.getURLByHash(googleHash)
        .then(row => {
          if (row.url !== googleURL) {
            assert.fail("Row url doesn't matches the expected value: "+row.url);
          }
        });
    });

  });
})

function nothing() {}
