module.exports = {
  ensureSocietyAuthenticated: function(req, res, next){
    if(req.isAuthenticated()){
      if(req.user.type == "society") return next()
      else res.status(401).json({
              message:"Not authorized to perform this action. Please login as a society to do that."
            })
    }else{
      res.status(401).json({
        message:"Not allowed to access this resource. Please login to continue."
      })
    }
  }
}
