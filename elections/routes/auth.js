const express = require('express')
const router = express.Router()
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs")
const passport = require('passport')
const request = require('request');
const bodyParser = require('body-parser')
const crypto = require('crypto')
const KEYS = require("../config/KEYS");
const SocietyUser = require("../models/SocietyUser")
const VoterUser = require("../models/VoterUser")
const Election = require("../models/Election")
const NODE_ENV = process.env.NODE_ENV || "dev"
const {ensureAuthenticated}= require('../config/auth')




// ******************************
// Middleware
// ******************************
router.use(bodyParser.urlencoded({
  extended: false
}))
router.use(bodyParser.json())

// ******************************
//Nodemailer
// ******************************
const transporter = nodemailer.createTransport({
  host: "smtp.porkbun.com",
  port: 587,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: KEYS.email || process.env.email,
    pass: KEYS.emailPASS || process.env.emailPASS
  }
});


// ******************************
// Get difference in dates
// ******************************
function date_diff_indays(date1, date2) {
dt1 = new Date(date1);
dt2 = new Date(date2);
return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
}


// ******************************
// Email and Name Validations
// ******************************
function validateEmail(emailVal) {
  emailVal = emailVal.trim().toLowerCase()
  console.log("Email String Validated")
  if (emailVal.endsWith("@student.manchester.ac.uk") || emailVal.endsWith("@manchester.ac.uk")) {
    return true
  }
  return false
}

function validatePosition(position, positionText) {
  const positionArray = ['General Secretary',"President", "Other"]
  if(!positionArray.includes(position)) return false
  if(position == "Other"){
    if(positionText){
      if(positionText.length <1) return false
    }else return false
  }
  return true
}

function firstLetterCapitalize(string) {
  string = string.trim().toLowerCase().split(' ');
  for (var i = 0; i < string.length; i++) {
    string[i] = string[i].charAt(0).toUpperCase() + string[i].substring(1);
  }
  return string.join(' ');
}

function validateName(nameVal) {
  nameVal = nameVal.trim()
  if (nameVal.length > 20 || nameVal.length < 1) {
    return false
  } else {
    return true;
  }
}


// ******************************
// Login
// ******************************

router.post("/login/:type", (req, res, next) => {
const email = req.body.email
const password = req.body.password

if (!email || !password) {
  return res.status(401).json({
    message: "Please fill in all the fields."
  });
}

if (password.length < 6) {
  return res.status(401).json({
    message: "Please enter a valid password."
  });
}

if (!validateEmail(email)) {
  return res.status(401).json({
    message: "Invalid Email. Please use a valid UoM Email."
  });
}
// Without captcha Login
if(req.params.type=="voter"){
  passport.authenticate('voter-local', function(err, user, info) {
    if (err) {
      return res.status(501).json(err);}
    if (!user) {return res.status(501).json(info);}
    req.logIn(user, function(err) {
      if (err) {return res.status(501).json(err);}
      return res.status(200).json({message: 'Login Success'});
    });
  })(req, res, next);
}else if(req.params.type=="society"){
  passport.authenticate('society-local', function(err, user, info) {
    if (err) {
      return res.status(501).json(err);}
    if (!user) {return res.status(501).json(info);}
    req.logIn(user, function(err) {
      if (err) {return res.status(501).json(err);}
      return res.status(200).json({message: 'Login Success'});
    });
  })(req, res, next);
}else{
  return res.status(401).json({
    message: "Invalid Login API. Please try again."
  });
}






//
//
// if(
//   req.body.captcha === undefined ||
//   req.body.captcha === '' ||
//   req.body.captcha === null
// ){
//   return res.json({"success": false, "msg":"wrong captcha"})
// }
//
// const secretKey = process.env.captchaSECRET || require("../config/keys").captchaSECRET;
// const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=
// ${secretKey}&response=${req.body.captcha}
//   &remoteip=${req.connection.remoteAddress}`
//
// request(verifyUrl, (err, response, body)=>{
//   body = JSON.parse(body);
//
//   if(body.success !== undefined && !body.success){
//     return res.json({"success": false, "msg":"Failed captcha"})
//   }
//
//   passport.authenticate('local', {
//     successRedirect : '/dashboard',
//     failureRedirect : '/users/login',
//     failureFlash : true
//   })(req, res, next)
//
//
// })



})



// ******************************
// Get currently logged in user
// ******************************
router.get("/user",ensureAuthenticated, (req, res) => {
  if(req.user.type=="voter"){
    return res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      type: req.user.type,
      isVerified: req.user.isVerified,
    })
  }else if(req.user.type=="society"){
    const untilNextSet = date_diff_indays(req.user.society[0].lastSet, new Date())
    const canChange = untilNextSet > 90 ? true : false
    return res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      type: req.user.type,
      isVerified: req.user.isVerified,
      societyName: req.user.society[0].societyName,
      canChange: canChange,
      position: req.user.position,
      positionText: req.user.positionText,
      untilNextSet: untilNextSet

    })
  }

})



// ******************************
// Update settings for users
// ******************************
router.post("/update", ensureAuthenticated, (req, res) => {
  const type = req.body.type

  if(type == "society"){

    let name = req.body.name
    let societyName = req.body.societyName
    let positionText = req.body.positionText
    let position = req.body.position
    const id = req.user._id


    if ( !name || !societyName || !position ) {
      return res.status(401).json({
        message: "Please fill in all the fields."
      });
    }

     societyName = firstLetterCapitalize(societyName)
     name = firstLetterCapitalize(name)
     positionText = firstLetterCapitalize(positionText  || "")

     if(position != "Other"){
       positionText = ""
     }

     if(societyName == req.user.society[0].societyName &&
       name == req.user.name &&
       position == req.user.position ){
         if(position == "Other"){
           if(positionText == req.user.positionText){
             return res.status(401).json({
               message: "Please update atleast one column."
             });
           }
         }else{
           return res.status(401).json({
             message: "Please update atleast one column."
           });
         }
       }


    if (!validateName(name)) {
      return res.status(401).json({
        message: "Full name should be between 1 and 20 characters."
      });
    }

    if(!validatePosition(position, positionText)){
      return res.status(401).json({
        message: "Invalid role chosen."
      });
    }

    if(societyName != req.user.society[0].societyName){
      if(date_diff_indays(req.user.society[0].lastSet, new Date()) <=90){
        return res.status(424).json({
          message: "Cannot update society name before 90 days since the last update."
        });
      }
    }

    if (societyName.length <1 || societyName.length>30) {
      return res.status(401).json({
        message: "Society name should be between 1 and 30 characters."
      });
    }


    SocietyUser.findOne({_id: id}).then(user=>{
      if(!user) {
        return res.status(424).json({
          message: "Unable to verify user identity."
        });
      }

      const untilNextSet = date_diff_indays(new Date(),req.user.society[0].lastSet)
      const canChange = untilNextSet > 90 ? true : false

      if(date_diff_indays(user.society[0].lastSet, new Date())> 90){
        SocietyUser.updateOne({_id:id}, {$set: {
          position,
          positionText,
          name,
          societyName
        }}).then(user=>{
          console.log("Updated society user details :" + req.user.email)
          return res.status(200).json({
            message: "Details updated successfully. Society Name couldn't be updated"
          });
        }).catch(err=>{
          console.log("Couldn't execute updateOne1 query for updatinng society")
          return res.status(424).json({
            message: "An error occured at the backend. Please try again later."
          });
        })

      }else{
        SocietyUser.updateOne({_id:id}, {$set: {
          position,
          positionText,
          name
        }}).then(user=>{
          console.log("Updated society user details :" + req.user.email)
          return res.status(200).json({
            message: "Details updated successfully."
          });
        }).catch(err=>{
          console.log("Couldn't execute updateOne2 query for updatinng society")
          return res.status(424).json({
            message: "An error occured at the backend. Please try again later."
          });
        })
      }

    }).catch(err=>{
      console.log("Couldn't execute the findOne query for updating society user.")
      return res.status(424).json({
        message: "An error occured at the backend. Please try again later."
      });
    })


  }else if(type == "voter"){

  }else{
    return res.status(401).json({
      message: "Invalid user type. Please try again."
    });
  }



})

// ******************************
// Resend confirmation email
// ******************************
router.post("/resend", (req, res) => {

  const email = req.body.email
  const type = req.body.type


  if (!email) {
    return res.status(401).json({
      message: "Email cannot be empty"
    });
  }

  email = email.trim().toLowerCase()

  if (!validateEmail(email)) {
    return res.status(401).json({
      message: "Invalid Email. Please use a valid UoM Email."
    });
  }

  if(type == "voter"){
                  VoterUser.findOne({email:email})
                  .then(user=>{
                    if(!user){
                      return res.status(401).json({
                        message: "No account found with that email address."
                      });
                    }else{
                      if(user.isVerified){
                        return res.status(401).json({
                          message: "The account has already been verified. Please login to continue."
                        });
                      }else{
                        const verifyToken = crypto.randomBytes(64).toString("hex")
                        VoterUser.updateOne({email:email}, { $set : { verifyToken: verifyToken}})
                        .then(user=>{
                          if(!user){
                            console.log("Voter user found with the email address but couldn't save the new token.")
                            return res.status(401).json({
                              message: "An error occured at the backend. Please try again later."
                            });
                          }else{




                            const html = `<h1>
                                      Electal : Verify Your Account (Voter)
                                    </h1>
                                    Welcome to Electal : A portal that can be used to hold society elections with ease.
                                    <p>
                                      Please use the following confirmation link to verify your account.
                                    </p>
                                    <a href='${KEYS[NODE_ENV].host}?token=${verifyToken}&type=voter'>Click here to Verify</a>
                                    <p>
                                      Incase the above hyperlink doesn't work, please manually copy and paste the following URL into your browser
                                    </p>
                                    <p> ${KEYS[NODE_ENV].host}?token=${verifyToken}&type=voter</p>
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
                              text: "Your verification token is : " + verifyToken,
                              html: html
                            };


                            transporter.sendMail(message, (err, info) => {
                              if (err) {
                                console.log("Token updated but failed to send new verification email for the user :" + email)
                                res.status(401).json({
                                  message: "New link generated, but could not send the verification email. Please contact us for assitance."
                                })
                              } else {
                                console.log("Updated the token for the user :" + email)
                                return res.status(200).json({
                                  message: "New verification email sent. Please confirm your email and login to continue."
                                });
                              }
                            })


                          }
                        })
                        .catch(err=>{
                          console.log("Couldn't execute the Update query for new verification link for the user : "+ email)
                          return res.status(401).json({
                            message: "An error occured at the backend. Please try again later."
                          });
                        })
                      }
                    }
                  }).catch(err=>{
                    console.log("Couldn't execute the findOne query for new verification link for the user : "+ email)
                    return res.status(401).json({
                      message: "An error occured at the backend. Please try again later."
                    });
                  })



  }else if(type == "society"){


                    SocietyUser.findOne({email:email})
                    .then(user=>{
                      if(!user){
                        return res.status(401).json({
                          message: "No account found with that email address."
                        });
                      }else{
                        if(user.isVerified){
                          return res.status(401).json({
                            message: "The account has already been verified. Please login to continue."
                          });
                        }else{
                          const verifyToken = crypto.randomBytes(64).toString("hex")
                          SocietyUser.updateOne({email:email}, { $set : { verifyToken: verifyToken}})
                          .then(user=>{
                            if(!user){
                              console.log("Voter user found with the email address but couldn't save the new token.")
                              return res.status(401).json({
                                message: "An error occured at the backend. Please try again later."
                              });
                            }else{


                              const html = `<h1>
                                        Electal : Verify Your Account (Society)
                                      </h1>
                                      Welcome to Electal : A portal that can be used to hold society elections with ease.
                                      <p>
                                        Please use the following confirmation link to verify your account.
                                      </p>
                                      <a href='${KEYS[NODE_ENV].host}?token=${verifyToken}&type=voter'>Click here to Verify</a>
                                      <p>
                                        Incase the above hyperlink doesn't work, please manually copy and paste the following URL into your browser
                                      </p>
                                      <p> ${KEYS[NODE_ENV].host}?token=${verifyToken}&type=voter</p>
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
                                text: "Your verification token is : " + verifyToken,
                                html: html
                              };


                              transporter.sendMail(message, (err, info) => {
                                if (err) {
                                  console.log("Token updated but failed to send new verification email for the user :" + email)
                                  res.status(401).json({
                                    message: "New link generated, but could not send the verification email. Please contact us for assitance."
                                  })
                                } else {
                                  console.log("Updated the token for the user :" + email)
                                  return res.status(200).json({
                                    message: "New verification email sent. Please confirm your email and login to continue."
                                  });
                                }
                              })


                            }
                          })
                          .catch(err=>{
                            console.log("Couldn't execute the Update query for new verification link for the user : "+ email)
                            return res.status(401).json({
                              message: "An error occured at the backend. Please try again later."
                            });
                          })
                        }
                      }
                    }).catch(err=>{
                      console.log("Couldn't execute the findOne query for new verification link for the user : "+ email)
                      return res.status(401).json({
                        message: "An error occured at the backend. Please try again later."
                      });
                    })



  }else{
    return res.status(401).json({
      message: "Illegal resend verification email API endpoint."
    });
  }





})


// ******************************
// Logout
// ******************************
router.get("/logout",ensureAuthenticated, (req, res) => {
  req.logout();
  return res.status(200).json({
    message:"Successfully logged out."
  })
})

// ******************************
// Verify the account
// ******************************
router.post("/verify", (req, res) => {
  const verifyToken = req.body.token
  const type = req.body.type

  if (type == 'voter') {
    VoterUser.findOne({
        verifyToken: verifyToken
      })
      .then(user => {
        if (user) {
          user.verifyToken = null
          user.isVerified = true
          user.save().then(user => {
            return res.status(200).json({
              verified: true,
              message: "Your account has now been verified. Please login to continue."
            })
          })
        } else {
          return res.status(424).json({
            verified: false,
            message: "Invalid or Expired token. Please request a new verification email."
          })
        }
      })
      .catch(err => {
        return res.status(424).json({
          verified: false,
          message: "An error occurred at the backend. Please try again later."
        })
      })
  } else if (type == 'society') {
    SocietyUser.findOne({
        verifyToken: verifyToken
      })
      .then(user => {
        if (user) {
          user.verifyToken = null
          user.isVerified = true
          user.save().then(user => {
            return res.status(200).json({
              verified: true,
              message: "Your account has now been verified. Please login to continue."
            })
          })
        } else {
          return res.status(424).json({
            verified: "failed",
            message: "Invalid or Expired token. Please request a new verification email."
          })
        }
      })
      .catch(err => {
        return res.status(424).json({
          verified: "failed",
          message: "An error occurred at the backend. Please try again later."
        })
      })
  }else{
    return res.status(424).json({
      verified: "failed",
      message: "Invalid token"
    })
  }



})

// ******************************
// Sign up for a society account
// ******************************
router.post("/signup/society", (req, res) => {
  let email = req.body.email
  let password = req.body.password
  let confirmpassword = req.body.confirmPassword
  let position = req.body.position
  let positionText = req.body.positionText
  let societyName = req.body.societyName
  let fullname = req.body.fullname

  if (!email || !fullname || !password || !confirmpassword || !position || !societyName) {
    return res.status(401).json({
      message: "Please fill in all the fields."
    });
  }

   societyName = firstLetterCapitalize(societyName)
   fullname = firstLetterCapitalize(fullname)
   email = email.trim().toLowerCase()
   positionText = firstLetterCapitalize(fullname  || "")

  if (password != confirmpassword) {
    return res.status(401).json({
      message: "Password and Confirm Password need to match with each other."
    });
  }

  if (societyName.length <1 || societyName.length>30) {
    return res.status(401).json({
      message: "Society name should be between 1 and 30 characters."
    });
  }

  if (password.length < 6) {
    return res.status(401).json({
      message: "Password should be of atleast 6 characters."
    });
  }

  if (!validateEmail(email)) {
    return res.status(401).json({
      message: "Invalid Email. Please use a valid UoM Email."
    });
  }

  if (!validateName(fullname)) {
    return res.status(401).json({
      message: "Full name should be between 1 and 30 characters."
    });
  }

  if(!validatePosition(position, positionText)){
    return res.status(401).json({
      message: "Invalid role chosen."
    });
  }


  SocietyUser.findOne({
      email: email
    })
    .then(user => {
      if (user) {
        return res.status(401).json({
          message: "Another account exists with the same email address."
        });
      } else {
        const newSocietyUser = new SocietyUser({
          name: fullname,
          email,
          password,
          position,
          positionText,
          society: {
            societyName,
            lastSet: new Date()
          }
        })

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newSocietyUser.password, salt, (err, hash) => {
            if (err) {
              console.log("Hashing of Password Failed.")
              return res.status(401).json({
                message: "An error occurred at the backend. Please try again later."
              })
            }

            // Set the new password to the hashed password
            newSocietyUser.password = hash
            newSocietyUser.verifyToken = crypto.randomBytes(64).toString("hex")
            newSocietyUser.save().then(
                user => {


                  const html = `<h1>
                          Electal : Verify Your Account (Society)
                        </h1>
                        Welcome to Electal : A portal that can be used to hold society elections with ease.
                        <p>
                          Please use the following confirmation link to verify your account.
                        </p>
                        <a href='${KEYS[NODE_ENV].host}?token=${newSocietyUser.verifyToken}&type=society'>Click here to Verify</a>
                        <p>
                          Incase the above hyperlink doesn't work, please manually copy and paste the following URL into your browser
                        </p>
                        <p> ${KEYS[NODE_ENV].host}?token=${newSocietyUser.verifyToken}&type=society</p>
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
                    text: "Your verification token is : " + newSocietyUser.verifyToken,
                    html: html
                  };


                  transporter.sendMail(message, (err, info) => {
                    if (err) {
                      console.log("Failed to send verification email. Saved new voter user with the email :" + newSocietyUser.email)
                      res.status(401).json({
                        message: "Account registered, but could not send the verification email. Please contact us for assitance."
                      })
                    } else {
                      console.log("Saved new voter user with the email :" + newSocietyUser.email)
                      return res.status(200).json({
                        message: "Account registered successfully. Please confirm email and login to continue."
                      });
                    }
                  })

                })
              .catch(err => {
                console.log("Couldn't save the new society user to the database.")
                return res.status(401).json({
                  message: "Some error occurred at the backend. Please try again later."
                });
              })
          })
        })
      }
    })
})



// ******************************
// Sign up for a voter account
// ******************************
router.post("/signup/voter", (req, res) => {

  let email = req.body.email
  let password = req.body.password
  let confirmpassword = req.body.confirmpassword
  let fullname = req.body.fullname

  if (!email || !fullname || !password || !confirmpassword) {
    return res.status(401).json({
      message: "Please fill in all the fields."
    });
  }

  email = email.trim().toLowerCase()
  fullname = firstLetterCapitalize(fullname)

  if (password != confirmpassword) {
    return res.status(401).json({
      message: "Password and Confirm Password need to match with each other."
    });
  }

  if (password.length < 6) {
    return res.status(401).json({
      message: "Password should be of atleast 6 characters."
    });
  }


  if (!validateEmail(email)) {
    return res.status(401).json({
      message: "Invalid Email. Please use a valid UoM Email."
    });
  }

  if (validateName(fullname)) {
    return res.status(401).json({
      message: "Full name should be between 1 and 20 characters."
    });
  }

  VoterUser.findOne({
      email: email
    })
    .then(user => {
      if (user) {
        return res.status(401).json({
          message: "Another account exists with the same email address."
        })
      } else {
        const newVoterUser = new VoterUser({
          name: fullname,
          email,
          password,
          verifyToken: ""
        })


        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newVoterUser.password, salt, (err, hash) => {

            if (err) {
              console.log("Hashing of Password Failed.")
              return res.status(401).json({
                message: "An error occurred at the backend. Please try again later."
              })
            }

            newVoterUser.password = hash
            newVoterUser.verifyToken = crypto.randomBytes(64).toString("hex")
            newVoterUser.save().then(user => {


              const html = `<h1>
                        Electal : Verify Your Account (Voter)
                      </h1>
                      Welcome to Electal : A portal that can be used to hold society elections with ease.
                      <p>
                        Please use the following confirmation link to verify your account.
                      </p>
                      <a href='${KEYS[NODE_ENV].host}?token=${newVoterUser.verifyToken}&type=voter'>Click here to Verify</a>
                      <p>
                        Incase the above hyperlink doesn't work, please manually copy and paste the following URL into your browser
                      </p>
                      <p> ${KEYS[NODE_ENV].host}?token=${newVoterUser.verifyToken}&type=voter</p>
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
                text: "Your verification token is : " + newVoterUser.verifyToken,
                html: html
              };


              transporter.sendMail(message, (err, info) => {
                if (err) {
                  console.log("Failed to send verification email. Saved new voter user with the email :" + newVoterUser.email)
                  res.status(401).json({
                    message: "Account registered, but could not send the verification email. Please contact us for assitance."
                  })
                } else {
                  console.log("Saved new voter user with the email :" + newVoterUser.email)
                  return res.status(200).json({
                    message: "Account registered successfully. Please confirm email and login to continue."
                  });
                }
              })


            }).catch(err => {
              console.log("Couldn't save the new user to the database.")
              return res.status(401).json({
                message: "Some error occurred at the backend. Please try again later."
              });
            })
          })
        })
      }
    })
})

router.post("/addElection",ensureAuthenticated, (req, res) => {
  let categories = req.body.categories
  let candidates = req.body.candidates
  let start = req.body.start
  let end = req.body.end

  if(!start || !end){
    return res.status(424).json({
          message: "Polling period cannot be null. Please try again."
    });
  }

  if(new Date(start).getDate()< new Date().getDate() || new Date(end).getDate()< new Date().getDate()){
    return res.status(424).json({
          message: "Polling date cannot be in the past. Please try again."
    });
  }


  for(let i=0;i<categories.length;i++){
    categories[i] = firstLetterCapitalize(categories[i])
  }


  for(let i=0;i<candidates.length;i++){
    candidates[i].name = firstLetterCapitalize(candidates[i].name)
    candidates[i].course = firstLetterCapitalize(candidates[i].course)
    candidates[i].category = firstLetterCapitalize(candidates[i].category)
  }

  // Removing the null entries
  categories = categories.filter(item => item);
  candidates = candidates.filter(item => item.name && item.category);

  // Checking if candidates have registered for one of the entered categories only
  for(let i=0;i<candidates.length;i++){
    if(categories.includes(candidates[i].category)){
      continue;
    }else{
      return res.status(424).json({
            message: "Category mismatch between the candidates and categories. Please check your inputs."
      });
    }
  }

  const newElection = new Election({hostId: req.user._id,
                      term:"2021-22",
                      society: req.user.societyName,
                      categories:categories,
                      candidates:candidates,
                      tag : crypto.randomBytes(12).toString("hex"),
                      start: start,
                      end: end})

  newElection.save().then(user=>{
    if(user){
      console.log(user)
      return res.status(200).json({
            message: "Election has been created."
          });
    }else{
      return res.status(424).json({
            message: "Failed to create a new Election. Please try again later."
          });
    }
  }).catch(err=>{
    console.log(err)
    return res.status(424).json({
          message: "Failed to create a new Election. Please try again later."
        });
  })

})
module.exports = router


//
// admin
//   .auth()
//   .createUser({
//     email: email,
//     emailVerified: false,
//     password: password,
//     displayName: fullname,
//     disabled: false,
//   })
//   .then((userRecord) => {
//       console.log('Successfully created new voter user:', userRecord.uid);
//
// ref.push({
//   'email': email,
//   'type': 'voter',
//   'uid': userRecord.uid
// });

// admin
//   .auth()
//   .generateEmailVerificationLink(email, actionCodeSettings)
//   .then((link) => {



//     })
//
//     .catch((error) => {
//       res.status(401).json({
//         message: error.message
//       })
//     });
//
// })
// .catch((error) => {
//   res.status(401).json({
//     message: error.message
//   });
// });







//
// router.post("/signup/voter/link", (req, res) => {
//
//   const email = req.body.email
//
//   if (!validateEmail(email)) {
//     return res.status(401).json({
//       message: "Invalid Email. Please use a valid UoM Email."
//     });
//   }
//
//   admin
//     .auth()
//     .generateEmailVerificationLink(email, actionCodeSettings)
//     .then((link) => {
//
//       const html = `<h1>
//                         Electal : Verify Your Account
//                       </h1>
//                       Welcome to Electal : A portal that can be used to hold society elections with ease.
//                       <p>
//                         Please use the following confirmation link to verify your account.
//                       </p>
//                       <a href='${link}'>Click here to Verify</a>
//                       <p>
//                         Incase the above hyperlink doesn't work, please manually copy and paste the following URL into your browser
//                       </p>
//                       <p> ${link}</p>
//                       <p>
//                         Incase of an expired or an invalid link, please request another confirmation link.
//                       </p>
//                       Regards,
//                       <p>
//                         Team Electal
//                       </p>`
//       var message = {
//         from: "contact@adityagarwal.co",
//         to: email,
//         subject: "Electal : Verify Your Account",
//         text: link,
//         html: html
//       };
//
//
//       transporter.sendMail(message, (err, info) => {
//         if (err) {
//           res.status(401).json({
//             message: "Could not send the verification email."
//           })
//         } else {
//           console.log("New verification email resent.")
//           res.status(200).json({
//             success: true
//           })
//         }
//       })
//
//     })
//
//     .catch((error) => {
//       res.status(401).json({
//         message: error.message
//       })
//     });
//
//
//
// })


// router.post("/sessionLogin", (req, res) => {
//   const idToken = req.body.idToken.toString();
//   const expiresIn = 60 * 60 * 24 * 5 * 1000;
//
//   admin
//     .auth()
//     .createSessionCookie(idToken, { expiresIn })
//     .then(
//       (sessionCookie) => {
//         const options = { maxAge: expiresIn, httpOnly: true };
//         res.cookie("session", sessionCookie, options);
//         res.end(JSON.stringify({ status: "success" }));
//       },
//       (error) => {
//         res.status(401).send("UNAUTHORIZED REQUEST!");
//       }
//     );
// });


// router.post("/checkLogIn", function (req, res) {
//   const  sessionCookie = req.cookies.session || "";
//   console.log("cookie: "+sessionCookie)
//
//   admin
//     .auth()
//     .verifySessionCookie(sessionCookie, true /** checkRevoked */)
//     .then(() => {
//       res.end(JSON.stringify({ status: "success" }));
//     })
//     .catch((error) => {
//       // res.redirect("/login");
//       res.end(JSON.stringify({ status: "not logged in" }));
//     });
// });
//


// var admin = require("firebase-admin");
// var serviceAccount = require("../config/firebaseKEY.json");
// const cookieParser = require("cookie-parser")
// const csrf = require("csurf")

// router.use(cookieParser())
// router.use(csrf({cookie : true}))
//
// router.all("*", (req, res, next)=>{
//   res.cookie("XSRF-TOKEN", req.csrfToken())
//   next()
// })
//
//  // firebase

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://election-system-db247-default-rtdb.europe-west1.firebasedatabase.app"
// });

// Initialize Firebase database
// var db = admin.database();
// const ref = db.ref("users")


// const actionCodeSettings = {
//   url: 'http://localhost:4200/signup',
//   handleCodeInApp: true,
// };



//
//
// admin
//   .auth()
//   .createUser({
//     email: email,
//     emailVerified: false,
//     password: password,
//     displayName: fullname,
//     disabled: false,
//   })
//   .then((userRecord) => {
//       console.log('Successfully created new society user:', userRecord.uid);
//
//     admin
//       .auth()
//       .generateEmailVerificationLink(email, actionCodeSettings)
//       .then((link) => {



//     })
//
//     .catch((error) => {
//       res.status(401).json({
//         message: error.message
//       })
//     });
//
// })
// .catch((error) => {
//   res.status(401).json({
//     message: error.message
//   });
// });
