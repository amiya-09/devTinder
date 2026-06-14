const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Compound Indexing
connectionRequestSchema.index({fromUserId: 1, toUserId: 1});

// Pre()
// Before i save /request/send/:status/:toUserId , this function will be called
// Does not work with arrow function
// This is like a validation before saving
// It is a middleware
connectionRequestSchema.pre("save", function () {
  const connectionRequest = this;
  // check if the fromUserId is same as toUserId
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send Connection Request to yourself");
  }
});

const ConnectionRequest = mongoose.model(
  "Connection Request",
  connectionRequestSchema,
);
module.exports = ConnectionRequest;
