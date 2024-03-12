function randomHash(size, base=16) {
  var hash = "";

  for (let i = 0; i < size; i++) {
    const rand = Math.floor(Math.random() * base);
    const char = rand.toString(base);
    hash += char;
  }

  return hash;
}

module.exports = {
  randomHash
}
