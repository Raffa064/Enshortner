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

  async function addURLShortner(url, hash) {
    const insert_sql = "INSERT INTO links (hash, url) VALUES (?, ?);";
    return db.query(insert_sql, url, hash);
  }

  function returnFirstRow(rows) {
    return rows[0];
  }

  function getURLByHash(hash) {
    const select_sql = "SELECT (url) from links WHERE ?";
    return db.query(select_sql, { hash }).then(returnFirstRow);
  }

  function getHashByURL(url) {
    const select_sql = "SELECT (hash) frrom links WHERE ?";
    return db.query(select_sql, { url }).then(returnFirstRow);
  }

  Object.assign(db, {
    addURLShortner,
    getURLByHash,
    getHashByURL
  })

  return db;
}

module.exports = EnshortnerDatabase;
