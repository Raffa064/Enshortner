const Database = require("../../database");

function EnshortnerDatabase() {
  require("dotenv").config();

  const db = Database({
    host: process.env.ENSHORTNER_DATABASE_HOST,
    port: process.env.ENSHORTNER_DATABASE_PORT,
    user: process.env.ENSHORTNER_DATABASE_USER,
    password: process.env.ENSHORTNER_DATABASE_PASSWORD,
    database: process.env.ENSHORTNER_DATABASE_NAME,
 });

  return {
    connect: db.connect
  }
}

module.exports = EnshortnerDatabase;
