require("dotenv").config("../");

console.log("db: "+process.env.ENSHORTNER_DATABASE_NAME);

const EnshortnerDatabase = require("./app/database/enshortner-db");
const Server = require("./app/server");
const Router = require("./app/routes/router");


const db = EnshortnerDatabase();
db.connect((err) => {
  if (err) {
    return;
  }

  switch (process.argv[2]) {
    case "migrations":
      runMigrationsCLI();
      break;
    default:
      startServer();
      break;
  }
});

function runMigrationsCLI() {
  const MigrationsCLI = require("./app/database/migrations-cli");
  
  MigrationsCLI(db);
}

function startServer() {
  const PORT = process.env.ENSHORTNER_PORT || 8080;
  const server = Server(PORT);

  const router = Router(db);
  server.use(router);

  server.start();

}
