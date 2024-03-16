*GET /test*
- Returns an literal string "test"

*GET /hash/:hash*
- **200** Redirects user to another url
- **404** Returns a error response json (Not found in database)
```json
{
    "errCode": 404,
    "errMessage": "Hash not found",
    "data": "&lt;Queried hash&gt;"
}
```

*GET /hash/:hash?noredirect=true*
- **200** Returns a json content with redirect url as a field 
```json
{
    "redirectURL": "&lt;Shortened url&gt;"
}
```
- **404** Error response json (Not found in database)
```json
{
    "errCode": 404,
    "errMessage": "Hash not found",
    "data": "&lt;Shortened url&gt;"
}
```

*GET /url?u=&lt;URL&gt;*
- **200** Returns url hash and it's shortened url (It will add url to databse if necessary).
```json
{
    "hash": "&lt;URL hash&gt;",
    "hashURL": "http://localhost:PORT:/hash/&lt;Hash&gt;"
}
```
- **404** Returns a error response json (Invalid url format).
```json
{
    "errCode": "400",
    "errMessage": "Invalid url format",
    "data": "&lt;Given url&gt;"
}
```
