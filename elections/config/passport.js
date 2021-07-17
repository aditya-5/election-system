const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/VoterUser')


module.exports = function(passport){
  passport.use(
    new LocalStrategy({usernameField : "email"}, (email, password, done)=>{
      // Match the email
      User.findOne({email: email})
      .then(user =>{
        if(!user){
          console.log("jhello")
          return done(null, false, {message : "The email is not registered"})
        }

        //Match password
        bcrypt.compare(password, user.password, (err, isMatch)=>{

          if(err) throw err;
          if(isMatch){
            if(user.isVerified){
              return done(null, user)
            }else{
              return done(null, false, { message: "The account has not been verified. Please check your email or request a new link."})
            }
          }else{
            return done(null, false, { message: "Invalid combination of password/email. Please try again."})
          }
        })
      })
      .catch(err=> console.log(err))
    })
  )

  passport.serializeUser((user, done)=>{
    done(null, user._id);
  });

  passport.deserializeUser((id, done)=>{
    User.findById(id, (err, user)=> {
      done(err, user);
    });
  });


}
