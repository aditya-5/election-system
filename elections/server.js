const express = require('express')
const app = express()
const port = 3000

var expressSanitizer = require('express-sanitizer')
var bodyParser = require('body-parser')
var methodOverride = require('method-override')


app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use(expressSanitizer());
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(methodOverride('_method'))


// CORS enabled
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:4200"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,CSRF-Token, credentials, useCredentials");
  next();
});


app.use("/auth", require("./routes/auth"))

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
