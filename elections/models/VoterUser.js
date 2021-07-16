const mongoose = require('mongoose')

const VoterUserSchema  = new mongoose.Schema({
  name:{
    type:String,
    required: true
  },
  email:{
    type:String,
    required: true
  },
  password:{
    type:String,
    required: true
  },
  type:{
    type:String,
    default: "voter"
  },
  date:{
    type:Date,
    default: Date.now
  },
  isVerified:{
    type:Boolean,
    default:false
  },
  verifyToken:{
    type:String,
  }
})


const VoterUser = mongoose.model("VoterUser", VoterUserSchema)

module.exports = VoterUser
