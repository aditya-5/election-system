const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const VoterUser = require('../models/VoterUser')
const SocietyUser = require('../models/SocietyUser')


let voterLocal=
function(passport){
  passport.use("voter-local",
    new LocalStrategy({usernameField : "email"}, (email, password, done)=>{
      // Match the email
      VoterUser.findOne({email: email})
      .then(user =>{
        if(!user){
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
    VoterUser.findById(id, (err, user)=> {
      done(err, user);
    });
  });


}




let societyLocal= function(passport){
  passport.use("society-local",
    new LocalStrategy({usernameField : "email"}, (email, password, done)=>{
      // Match the email
      SocietyUser.findOne({email: email})
      .then(user =>{
        if(!user){
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
    SocietyUser.findById(id, (err, user)=> {

      if(err) done(err)
      if(user) done (null, user)
      else{
        VoterUser.findById(id, (err, user)=>{
          if(err) done(err)
          done(null, user)
        } )
      }
      // done(err, user);
    });
  });


}

module.exports = {
  voterLocal,
  societyLocal
}
