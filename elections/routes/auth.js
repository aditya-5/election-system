const express = require('express')
const router = express.Router()
var admin = require("firebase-admin");
var nodemailer = require("nodemailer");
var serviceAccount = require("../config/firebaseKEY.json");
const cookieParser = require("cookie-parser")
const csrf = require("csurf")

router.use(cookieParser())
// router.use(csrf({cookie : true}))
//
// router.all("*", (req, res, next)=>{
//   res.cookie("XSRF-TOKEN", req.csrfToken())
//   next()
// })

// firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://election-system-db247-default-rtdb.europe-west1.firebasedatabase.app"
});

// Initialize Firebase database
var db = admin.database();
// const ref = db.ref("users")


const actionCodeSettings = {
  url: 'http://localhost:4200/signup',
  handleCodeInApp: true,
};


//Nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.porkbun.com",
  port: 587,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: "contact@adityagarwal.co",
    pass: "HELLOaa123,./"
  }
});

function validateEmail(emailVal) {
  emailVal = emailVal.trim()
  emailVal = emailVal.toLowerCase()
  console.log("Email String Validated")
  if (emailVal.endsWith("student.manchester.ac.uk") || emailVal.endsWith("manchester.ac.uk")) {
    return true
  }
  return false
}

function firstLetterCapitalize(string) {
  string = string.trim()
  string = string.toLowerCase().split(' ');
  for (var i = 0; i < string.length; i++) {
      string[i] = string[i].charAt(0).toUpperCase() + string[i].substring(1);
  }
 return string.join(' ');
}

function validateName(nameVal) {
  nameVal = nameVal.trim()
  splitStr = nameVal.toLowerCase().split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
   }
  splitStr = splitStr.join(' ');
   if(splitStr.length>20){
     return false
   }else{
     return splitStr;
   }
}


router.post("/signup/society", (req, res) => {

  const email = req.body.email
  const password = req.body.password
  const confirmpassword = req.body.confirmpassword
  const position = req.body.position
  const positionText = firstLetterCapitalize(req.body.positionText ||  "")
  const societyName = firstLetterCapitalize(req.body.societyName)
  let fullname = req.body.fullname
  console.log(positionText)
  console.log(societyName)
    console.log(position)


  if (!validateEmail(email)) {
    return res.status(401).json({
      message: "Invalid Email. Please use a valid UoM Email."
    });
  }

  fullname = validateName(fullname)

  if(!fullname){
    return res.status(401).json({
      message: "Full name should be of less than 20 characters."
    });
  }

  admin
    .auth()
    .createUser({
      email: email,
      emailVerified: false,
      password: password,
      displayName: fullname,
      disabled: false,
    })
    .then((userRecord) => {
        console.log('Successfully created new society user:', userRecord.uid);
        //
        // ref.push({
        //   'email': email,
        //   'societyName' : societyName,
        //   'position': position,
        //   'positionText' : positionText,
        //   'type': 'society',
        //   'uid': userRecord.uid,
        // });

      admin
        .auth()
        .generateEmailVerificationLink(email, actionCodeSettings)
        .then((link) => {

          const html = `<h1>
                        Electal : Verify Your Account (Society)
                      </h1>
                      Welcome to Electal : A portal that can be used to hold society elections with ease.
                      <p>
                        Please use the following confirmation link to verify your account.
                      </p>
                      <a href='${link}'>Click here to Verify</a>
                      <p>
                        Incase the above hyperlink doesn't work, please manually copy and paste the following URL into your browser
                      </p>
                      <p> ${link}</p>
                      <p>
                        Incase of an expired or an invalid link, please request another confirmation link.
                      </p>
                      Regards,
                      <p>
                        Team Electal
                      </p>`
          var message = {
            from: "contact@adityagarwal.co",
            to: email,
            subject: "Electal : Verify Your Account",
            text: link,
            html: html
          };


          transporter.sendMail(message, (err, info) => {
            if (err) {
              res.status(401).json({
                message: "Account registered, but could not send the verification email."
              })
            } else {
              res.status(200).json({
                success: true
              })
            }
          })

        })

        .catch((error) => {
          res.status(401).json({
            message: error.message
          })
        });

    })
    .catch((error) => {
      res.status(401).json({
        message: error.message
      });
    });

})





router.post("/signup/voter", (req, res) => {

  const email = req.body.email
  const password = req.body.password
  const confirmpassword = req.body.confirmpassword
  let fullname = req.body.fullname

  if (!validateEmail(email)) {
    return res.status(401).json({
      message: "Invalid Email. Please use a valid UoM Email."
    });
  }


  fullname = validateName(fullname)
  if(!fullname){
    return res.status(401).json({
      message: "Full name should be of less than 20 characters."
    });
  }

  admin
    .auth()
    .createUser({
      email: email,
      emailVerified: false,
      password: password,
      displayName: fullname,
      disabled: false,
    })
    .then((userRecord) => {
        console.log('Successfully created new voter user:', userRecord.uid);
        //
        // ref.push({
        //   'email': email,
        //   'type': 'voter',
        //   'uid': userRecord.uid
        // });

      admin
        .auth()
        .generateEmailVerificationLink(email, actionCodeSettings)
        .then((link) => {

          const html = `<h1>
                        Electal : Verify Your Account (Voter)
                      </h1>
                      Welcome to Electal : A portal that can be used to hold society elections with ease.
                      <p>
                        Please use the following confirmation link to verify your account.
                      </p>
                      <a href='${link}'>Click here to Verify</a>
                      <p>
                        Incase the above hyperlink doesn't work, please manually copy and paste the following URL into your browser
                      </p>
                      <p> ${link}</p>
                      <p>
                        Incase of an expired or an invalid link, please request another confirmation link.
                      </p>
                      Regards,
                      <p>
                        Team Electal
                      </p>`
          var message = {
            from: "contact@adityagarwal.co",
            to: email,
            subject: "Electal : Verify Your Account",
            text: link,
            html: html
          };


          transporter.sendMail(message, (err, info) => {
            if (err) {
              res.status(401).json({
                message: "Account registered, but could not send the verification email."
              })
            } else {
              res.status(200).json({
                success: true
              })
            }
          })

        })

        .catch((error) => {
          res.status(401).json({
            message: error.message
          })
        });

    })
    .catch((error) => {
      res.status(401).json({
        message: error.message
      });
    });





})



router.post("/signup/voter/link", (req, res) => {

  const email = req.body.email

  if (!validateEmail(email)) {
    return res.status(401).json({
      message: "Invalid Email. Please use a valid UoM Email."
    });
  }

  admin
    .auth()
    .generateEmailVerificationLink(email, actionCodeSettings)
    .then((link) => {

      const html = `<h1>
                        Electal : Verify Your Account
                      </h1>
                      Welcome to Electal : A portal that can be used to hold society elections with ease.
                      <p>
                        Please use the following confirmation link to verify your account.
                      </p>
                      <a href='${link}'>Click here to Verify</a>
                      <p>
                        Incase the above hyperlink doesn't work, please manually copy and paste the following URL into your browser
                      </p>
                      <p> ${link}</p>
                      <p>
                        Incase of an expired or an invalid link, please request another confirmation link.
                      </p>
                      Regards,
                      <p>
                        Team Electal
                      </p>`
      var message = {
        from: "contact@adityagarwal.co",
        to: email,
        subject: "Electal : Verify Your Account",
        text: link,
        html: html
      };


      transporter.sendMail(message, (err, info) => {
        if (err) {
          res.status(401).json({
            message: "Could not send the verification email."
          })
        } else {
          console.log("New verification email resent.")
          res.status(200).json({
            success: true
          })
        }
      })

    })

    .catch((error) => {
      res.status(401).json({
        message: error.message
      })
    });



})


router.post("/sessionLogin", (req, res) => {
  const idToken = req.body.idToken.toString();
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  admin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true };
        res.cookie("session", sessionCookie, options);
        res.end(JSON.stringify({ status: "success" }));
      },
      (error) => {
        res.status(401).send("UNAUTHORIZED REQUEST!");
      }
    );
});


router.post("/checkLogIn", function (req, res) {
  const  sessionCookie = req.cookies.session || "";
  console.log("cookie: "+sessionCookie)

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {
      res.end(JSON.stringify({ status: "success" }));
    })
    .catch((error) => {
      // res.redirect("/login");
      res.end(JSON.stringify({ status: "not logged in" }));
    });
});



module.exports = router
