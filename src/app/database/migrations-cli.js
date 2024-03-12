const fs = require("fs");
const readline = require("readline");
const { randomHash } = require("../../utils");

function MigrationsCLI(db) {
  const interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const migrationsDir = __dirname + "/migrations";
  const templatePatch = fs.readFileSync(__dirname + "/patch.template.js");

  function pressAnyKey(callback) {
    interface.once("line", callback);
  }

  function listMigrations() {
    console.clear();

    const migrationHashs = fs.readdirSync(migrationsDir);

    for (const hash of migrationHashs) {
      const dir = migrationsDir + "/" + hash
      const configsJson = fs.readFileSync(dir + "/configs.json").toString();
      const configs = JSON.parse(configsJson);

      console.log("name: " + configs.name);
      console.log("description: " + configs.description);
      console.log("hash: " + hash)
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
        console.log("Press any key to continue...");
        pressAnyKey(listMigrations);
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
      "| exit      Exit from cli                |",
      "[-------Press any key to continue--------]"
    ].forEach(line => console.log(line));

    pressAnyKey(listMigrations);
  }

  function applyMigration(hash) {
    console.clear();

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

          pressAnyKey(listMigrations);
          return;
        }

        console.log("Operation aborted");
        setTimeout(listMigrations, 1000);
      })
    } else {
      console.log("Invalid hash");
      setTimeout(listMigrations, 1000);
    }
  }

  listMigrations();
}

module.exports = MigrationsCLI
