const mysql = require("mysql");

function Database(databaseConfig) {
  const connection = mysql.createConnection(databaseConfig);

  function connect(connectionCallback) {
    connection.connect((err) => {
      if (err) {
        console.log("[ Database connection failed ]");
        connectionCallback(err);
        return;
      }

      console.log("[ Database connected ]");
      if (connectionCallback) {
        connectionCallback();
      }
    });
  }

  async function query(sql, ...params) {
    return new Promise((resolve, reject) => {
      connection.query(sql, ...params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(result);
      });
    });
  }

  return {
    connect,
    query,
  };
}

module.exports = Database;
