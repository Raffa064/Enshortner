/* Migration patch */

function migrate(db) {
  db.query("CREATE TABLE links(\
    id INTEGER PRIMARY KEY AUTO_INCREMENT,\
    url TEXT UNIQUE NOT NULL,\
    hash TEXT UNIQUE NOT NULL\
  );");
}

module.exports = migrate;
