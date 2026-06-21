const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");
const User = require("../models/user");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
    const savedUser = await user.save();
    const token = await user.getJWT();
    // Add the token to cookie and send the response back to the user
    res.cookie("token", token, {
      expires: new Date(Date.now() + 9 * 3600000),
    });
    res.json({ message: "User Added Successfully", data: savedUser });
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
      res.send(user);
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { emailId } = req.body;
    if (!emailId) throw new Error("Email is required");

    const user = await User.findOne({ emailId });
    // Always respond with success to avoid revealing whether an email exists
    if (!user) return res.send("If that email exists, a reset link has been sent.");

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await transporter.sendMail({
      from: `"DevTinder" <${process.env.EMAIL_USER}>`,
      to: user.emailId,
      subject: "Password Reset Request",
      html: `
        <p>Hi ${user.firstName},</p>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you did not request this, ignore this email.</p>
      `,
    });

    res.send("If that email exists, a reset link has been sent.");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Find a user whose token matches AND hasn't expired
//  → reset their password → burn the token so it can never be reused.
authRouter.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) throw new Error("New password is required");
    if (!validator.isStrongPassword(newPassword))
      throw new Error("Password is not strong enough");

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error("Token is invalid or has expired");

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.send("Password reset successfully. You can now log in.");
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
