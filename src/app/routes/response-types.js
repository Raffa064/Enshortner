function ErrorResponse(errCode, errMessage, data) {
  return {
    errCode, 
    errMessage, 
    data
  }
}

// Reposnse for /url/u?=<url>
function HashResponse(hash, hashURL) {
  return {
    hash,
    hashURL   // http://localhost:PORT/hash/<hash>
  }
}

// Response for /hash/:<hash>?noredirect=true
function URLResponse(redirectURL) {
  return {
    redirectURL // Shortened url
  }
}

module.exports = {
  ErrorResponse,
  HashResponse,
  URLResponse
}
