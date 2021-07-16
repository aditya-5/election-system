const mongoose = require('mongoose')

const SocietyUserSchema  = new mongoose.Schema({
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
  date:{
    type:Date,
    default: Date.now
  },
  position:{
    type:String,
    required: true
  },
  positionText:{
    type:String,
    required: false
  },
  societyName:{
    type:String,
    required: true
  },
  type:{
    type:String,
    default: "society"
  },
  isVerified:{
    type:Boolean,
    default:false
  },
  verifyToken:{
    type:String,
  }
})


const SocietyUser = mongoose.model("SocietyUser", SocietyUserSchema)

module.exports = SocietyUser
