const express = require("express");
const app = express();
const {adminAuth, userAuth} = require("./middlewares/auth")
// Handle Auth Middleware for all request - GET, POST, PATCH, DELETE
app.use("/admin", adminAuth)

app.get("/user", userAuth, (req,res) => {
  res.send("User Data Sent");
})
app.get("/admin/getAllData", (req, res) => {  
  res.send("All data sent");
});
app.get("/admin/deleteUser", (req, res) => {
  res.send("Deleted a user");
});

app.listen(3000, () => {
  console.log("Server is successfully listening on port 3000....");
});
