const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const expressSanitizer = require('express-sanitizer')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const session = require('express-session')
const passport = require('passport')
const mongoose = require('mongoose')
const KEYS = require("./config/keys");


app.use(express.static(__dirname + '/public'))
app.use(expressSanitizer());
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(methodOverride('_method'))
app.use(session({
  secret: 'hold the door',
  resave: false,
  saveUninitialized: true,
}))

// Passport Middleware
require("./config/passport")(passport)
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(KEYS.MongoURI || process.env.MongoURI , { useUnifiedTopology: true , useNewUrlParser: true })
.then(()=> {console.log("MongoDB Connected")})
.catch(err=>{
  console.log(err)
})

// CORS enabled
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:4200"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.use("/auth", require("./routes/auth"))

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
