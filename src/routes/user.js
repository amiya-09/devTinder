const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();


// get all the pending connection request for the logged in user
userRouter.get("/user/requests/recieved", userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user;
        const connectionRequest = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested",
        }).populate("fromUserId", ["firstname", "lastName"]);
    }catch (err) {
        res.statusCode(400).send("ERROR: "+err.message);
    }

})

module.exports = userRouter;