const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");
const User = require("../models/user");

authRouter.post("/signup", async (req, res) => {
  try {
    // Validation of Data
    validateSignUpData(req);
    const { firstName, lastName, emailId, password } = req.body;
    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);
    // Creating a new instance of the User Model
    // using the data which has been recieved through the POST API
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.send("User Added Successfully");
  } catch (err) {
    res.status(400).send("ERROR :" + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    // when one logins , the backend check for valid emailId and password
    // extracting the emailId and password
    const { emailId, password } = req.body;
    // find the user with the help of emailId
    const user = await User.findOne({ emailId: emailId });
    // if that emailId is not present in the database then the user needs to signup
    if (!user) {
      throw new Error("You need to signup. Invalid Credentials");
    }
    // check for password by comparing it with its encrypted - hash
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      // create a JWT Token
      const token = await user.getJWT();
      // Add the token to cookie and send the response back to the user
      res.cookie("token", token, {
        expires: new Date(Date.now() + 9 * 3600000),
      });
      res.send("Login Successfull");
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { emailId, newPassword } = req.body;
    if (!emailId || !newPassword) {
      throw new Error("emailId and newPassword are required");
    }
    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("Password is not strong enough");
    }
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("User not found");
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.send("Password reset successfully");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .send("Logout Successfull");
});

module.exports = authRouter;
