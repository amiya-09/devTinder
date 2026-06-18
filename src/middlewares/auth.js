const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {// Read the token from the req cookies
    const {token} = req.cookies;
    if(!token){
      return res.status(401).send("Please Login");
    }
    // Validate the token
    const decodedObj = await jwt.verify(token, "DEV@Tinder$790");
    const { _id } = decodedObj;
    // Find the User
    const user = await User.findById(_id);
    if(!user){
      throw new Error("User Not Found");
    }
    // attach the USER found from the database 
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
};

module.exports = {userAuth};