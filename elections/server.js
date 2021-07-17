const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const expressSanitizer = require('express-sanitizer')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const session = require('express-session')
const passport = require('passport')
const mongoose = require('mongoose')
const KEYS = require("./config/KEYS");
const path = require("path");
const cors = require("cors");


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
  saveUninitialized: false,
  cookie:{
    maxAge:600000,
    httpOnly:false,
    secure:false,
    SameSite:"None"
  }
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
  res.header("Access-Control-Allow-Origin", "http://localhost:4200, http://127.0.0.1:4200"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
app.use(cors({
  origin:['http://localhost:4200','http://127.0.0.1:4200'],
  credentials:true
}))

app.use("/auth", require("./routes/auth"))

// app.get('/hello', function(req, res) {
//   res.send('hello');
// });

app.get('/*', function(req, res) {
  try{
    res.sendFile(path.join(__dirname + '/public/index.html'), null, err=>{
         if(err){
           res.send("Static Angular File Not Found")
         }
       });
  }catch{
    res.send("Static Angular File Not Found")
  }
});







app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
