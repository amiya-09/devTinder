const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      // Corner Case 1 : Should not send connection requesto for any kind of status type
      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type: " + status });
      }

      // Corner Case 2 : toUserId should be present in the database
      const toUser = await User.findById(toUserId);
      if(!toUser) {
        return res.status(404).json({
          message: "User Not Found",
        });
      }

      // Corner Case 3 :
      // person A cannot send connection request to the person B(same person) twice
      // and neither the person B, who has recieved the connection should be able to send the connection request to person A
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      // this should return NULL and if it does not then :
      if (existingConnectionRequest) {
        return res
          .status(400)
          .send({ message: "Connection Request Already Exits" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.json({
        message: req.user.firstName + " is " + status + " in " + toUser.firstName,
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  },
);

module.exports = requestRouter;
