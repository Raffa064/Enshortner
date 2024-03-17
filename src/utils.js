function randomHash(size, base=16) {
  var hash = "";

  for (let i = 0; i < size; i++) {
    const rand = Math.floor(Math.random() * base);
    const char = rand.toString(base);
    hash += char;
  }

  return hash;
}

function format_YYYYMMDD_HHMMSS(time) {
  const formattedTimestamp = `${time.getFullYear()}-${padZero(time.getMonth() + 1)}-${padZero(time.getDate())} ${padZero(time.getHours())}:${padZero(time.getMinutes())}:${padZero(time.getSeconds())}`;

  function padZero(num) {
    return (num < 10 ? '0' : '') + num;
  }

  return formattedTimestamp;
}

function rootPath(path) {
  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  return __dirname + path;
}

module.exports = {
  randomHash,
  format_YYYYMMDD_HHMMSS,
  rootPath
}
