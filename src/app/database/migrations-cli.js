const fs = require("fs");
const readline = require("readline");
const { randomHash, format_YYYYMMDD_HHMMSS } = require("../../utils");

function MigrationsCLI(db) {
  const create_migrations_table_sql =
    "CREATE TABLE IF NOT EXISTS _migrations(\
      hash VARCHAR(32) PRIMARY KEY,\
      timestamp TIMESTAMP NOT NULL\
    );";

  db.query(create_migrations_table_sql).then(() => {
    listMigrations();
  });

  const interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const migrationsDir = __dirname + "/migrations";
  const templatePatch = fs.readFileSync(__dirname + "/patch.template.js");

  function pressAnyKey(label, callback) {
    if (typeof label === "string") {
      console.log(label);
    } else {
      callback = label;
    }
    
    interface.once("line", callback);
  }

  function listMigrations() {
    console.clear();

    const migrationHashs = fs.readdirSync(migrationsDir);

    for (const hash of migrationHashs) {
      const dir = migrationsDir + "/" + hash
      const configsJson = fs.readFileSync(dir + "/configs.json").toString();
      const configs = JSON.parse(configsJson);

      console.log("Name: " + configs.name);
      console.log("Description: " + configs.description);
      console.log("Creation time: " + new Date(configs.timestamp));
      console.log("Hash: " + hash)
      console.log("---------------------------------------------------------------")
    }

    interface.question("Enter migration hash to apply (or help): ", (answer) => {
      switch (answer) {
        case "exit": /* Nothing */ break;
        case "new":
          createNewMigration();
          break;
        case "help":
          help();
          break;
        default:
          applyMigration(answer);
          break;
      }
    })
  }

  function createNewMigration() {
    console.clear();

    const hash = randomHash(32);
    const dirPath = migrationsDir + "/" + hash
    const configsPath = dirPath + "/configs.json";
    const patchPath = dirPath + "/patch.js"

    if (fs.existsSync(dirPath)) {
      createNewMigration(); // Repeat until find an uniquw hash
      return;
    }

    interface.question("Enter migration name: ", (name) => {
      interface.question("Enter migration description: ", (description) => {
        const configs = {
          name,
          description,
          timestamp: Date.now()
        }

        fs.mkdirSync(dirPath);
        fs.writeFileSync(configsPath, JSON.stringify(configs));
        fs.writeFileSync(patchPath, templatePatch);

        console.log("Migration created at: " + patchPath);
        pressAnyKey("Press any key to continue.", listMigrations);
      })
    })
  }

  function help() {
    console.clear();
    [
      "[ Migration-CLI 2024 by Raffa064         ]",
      "|----------------------------------------|",
      "| help      Show this help               |",
      "| new       Create a new migration patch |",
      "[ exit      Exit from cli                ]",
      ""
    ].forEach(line => console.log(line));

    pressAnyKey("Press any key to continue.", listMigrations);
  }

  function applyMigration(hash) {
    console.clear();

    const get_applied_migrations_sql = "SELECT * FROM _migrations;";
    db.query(get_applied_migrations_sql).then((results) => {
      const alreadyApplied = results.find(row => {
        return row.hash === hash;
      })

      if (alreadyApplied) {
        console.log("This patch is already applied.");
        return;
      }

      const dir = migrationsDir + "/" + hash;

      if (fs.existsSync(dir)) {
        const configsJson = fs.readFileSync(dir + "/configs.json").toString();
        const configs = JSON.parse(configsJson);

        console.log(">>> Patch: " + configs.name)
        interface.question("Do you really want to apply? (YeS/any) ", (answer) => {
          if (answer === "YeS") {
            console.log("Applying...");
            const migrate = require("./migrations/" + hash + "/patch");
            migrate(db);

            const store_migration_sql = "INSERT INTO _migrations (hash, timestamp) VALUES (?, ?);"
            const timestamp = format_YYYYMMDD_HHMMSS(new Date());
            
            db.query(store_migration_sql, hash, timestamp)
              .then((_) => {
                pressAnyKey("Press any key to continue.", listMigrations);
              })
              .catch((err) => {
                console.log("Error while writing to database: ", err);
                pressAnyKey("Press any key to continue.", listMigrations);
              });

            return;
          }

          console.log("Operation aborted");
          setTimeout(listMigrations, 1000);
        })
      } else {
        console.log("Invalid hash");
        setTimeout(listMigrations, 1000);
      }
    }).catch((err) => {
        console.log("Can't apply migration patch: ", err);
      });
  }
}

module.exports = MigrationsCLI
