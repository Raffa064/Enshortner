const EnshortnerDatabase = require("../../src/app/database/enshortner-db");
const { randomHash } = require("../../src/utils");
const autoMigrate = require("./auto-migrations");

function TestDatabase() {
  const db = EnshortnerDatabase();

  const _connect = db.connect;
  function connect(connectionCallback) {
    _connect(() => {
      db.databaseName = "test_"+randomHash(5);

      console.log("Test database -> " + db.databaseName);
      db.query("CREATE DATABASE "+db.databaseName+";").then(() => {
        console.log("[ Created test database ]");
        db.query("use "+db.databaseName+";").then(() => {
          console.log("[ Using test database ]");

          autoMigrate(db);
          connectionCallback();
        }).catch(connectionCallback);
      }).catch(connectionCallback);
    });
  }

  function destroy() {
    db.query("DROP DATABASE "+db.databaseName+";");
  }

  Object.assign(db, {
    destroy,
    connect
  });

  return db;
}

module.exports = TestDatabase;
