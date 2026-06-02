const adminAuth = (req, res, next) => {
    console.log("Admin Auth is getting checked");
  // Fetch the token
  const token = "jfbvfbf";
  const isAdminAuthorized = token === "xyz";
  if(!isAdminAuthorized){
    res.status(401).send("Unauthorized Request");
  }
  else{
    next();
  }
};

const userAuth = (req, res, next) => {
    console.log("User Auth is getting checked");
  // Fetch the token
  const token = "jfbvfbf";
  const isAdminAuthorized = token === "xyz";
  if(!isAdminAuthorized){
    res.status(401).send("Unauthorized Request");
  }
  else{
    next();
  }
};

module.exports = {adminAuth, userAuth};