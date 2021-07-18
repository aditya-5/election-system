const mongoose = require('mongoose')

const ElectionSchema  = new mongoose.Schema({
  hostId:{
    type:String,
    required: true
  },
  term:{
    type:String,
    required: true
  },
  society:{
    type:String,
    required: true
  },
  categories:{
    type:[String],
    required:true
  },
  candidates:[ mongoose.Schema.Types.Mixed],
  tag:{
    type:String,
    required: true
  },
  dateAdded:{
    type:Date,
    default: Date.now
  },
  start:{
    type:String,
    required: true
  },
  end:{
    type:String,
    required: true
  },
  live:{
    type:Boolean,
    default: false
  }


})


const Election = mongoose.model("Elections", ElectionSchema)

module.exports = Election
