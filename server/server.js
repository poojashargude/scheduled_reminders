const express = require("express");

const app = express();
app.use(
  express.urlencoded({
    extended: true,
  })
);
//  var http = require('http');
// const app = express();
const path = require("path");
const connectDB = require("./config/db");

// const http = require("http").createServer();

connectDB();

app.use(express.json({ extended: true }));

app.use("/register", require("./routes/register"));



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
