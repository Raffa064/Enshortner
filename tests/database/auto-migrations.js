// CAUTION: this script can`t recognize uncompleted/unused migrations

const { rootPath } = require("../../src/utils");
const fs = require("fs");

function autoMigrate(db) {
  const migrationsDir = rootPath("app/database/migrations");

  const migrations = fs.readdirSync(migrationsDir);
  const sortedMigrations = [];
  
  migrations.forEach((migration) => {
    const migrationPath = migrationsDir + "/" + migration;
    const configsPath = migrationPath + "/configs.json";
    const configsJson = fs.readFileSync(configsPath);
    const configs = JSON.parse(configsJson);

    sortedMigrations.push({
      patch: migrationPath + "/patch.js",
      ...configs
    });
  });

  sortedMigrations.sort((a, b) => {
    return a.timestamp - b.timestamp;
  });

  for (migration of sortedMigrations) {
    try {
      console.log("-> Migration: " + migration.name);
      const migrate = require(migration.patch);
      migrate(db);
    } catch(err) {
      console.log("Error while appling migration '"+migration.name+"': ", err);
      break;
    }
  }
}

module.exports = autoMigrate;
