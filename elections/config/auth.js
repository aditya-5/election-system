module.exports = {
  ensureAuthenticated: function(req, res, next){
    if(req.isAuthenticated()){
      return next()
    }else{
      res.status(401).json({
        message:"Not allowed to access this resource. Please login to continue."
      })
    }
  }
}
