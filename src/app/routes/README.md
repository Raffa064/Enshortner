*GET /test*
- Returns an literal string "test"

*GET /hash/:hash*
- **200** Redirects user to another url
- **404** Returns a error response json (Not found in database)
```json
{
    "errCode": 404,
    "errMessage": "Hash not found",
    "data": "<Queried hash>"
}
```

*GET /hash/:hash?noredirect=true*
- **200** Returns a json content with redirect url as a field 
```json
{
    "redirectURL": "<Shortened url>"
}
```
- **404** Error response json (Not found in database)
```json
{
    "errCode": 404,
    "errMessage": "Hash not found",
    "data": "<Shortened url>"
}
```

*GET /url?u=&lt;URL&gt;*
- **200** Returns url hash and it's shortened url (It will add url to databse if necessary)
```json
{
    "hash": "<URL hash>",
    "hashURL": "http://localhost:PORT:/hash/<Hash>"
}
```
- **400** Returns a error response json (Invalid url format)
```json
{
    "errCode": "400",
    "errMessage": "Invalid url format",
    "data": "<Given url>"
}
```
- **500** Internal problem while creating a new url register (probably a hash collision)
```json
{
    "errCode": 500,
    "errMessage": "Internal server error: can't create url shortener",
    "data": "<Given url>"
}
```
