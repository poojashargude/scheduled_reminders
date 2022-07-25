const router = require("express").Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");
const schedule = require("node-schedule");
const cron = require("node-cron");
const connectDB = require("../config/db");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

var MongoClient = require("mongodb").MongoClient;
const url = process.env.URL;

MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  //Return only the "name" field in the result:
  var dbo = db.db("myFirstDatabase");
  dbo
    .collection("users")
    .find({}, { projection: { _id: 0, email_address: 1 } })
    .toArray(function (err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
    });
});

cron.schedule("0 */1 * * * *", function () {
  const msg = {
    to: [
      "poojashargude@gmail.com",
      "divyaghate352002@gmail.com",
      "veerwaninandani@gmail.com",
    ], // replace these with your email addresses
    from: "tridetyencore@gmail.com",
    subject: "Reminder for the meeting",
    text: "Here is your scheduled reminder for meeting",
  };

  sgMail
    .sendMultiple(msg)
    .then(() => {
      console.log("emails sent successfully!");
    })
    .catch((error) => {
      console.log(error);
    });
});

router.get("/getUser", async (req, res) => {
  try {
    const user = await User.find({ user: email_address });
    console.log(user);
    res.json(user);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ msg: error });
  }
});

router.post(
  "/",
  [check("full_name", "Please provide your full name").not().isEmpty()],
  [check("email_address", "Please provide email address").isEmail()],
  [check("contact_number", "Please provide contact number").isMobilePhone()],
  [
    check(
      "password",
      "Please provide a password 6 charecter long password"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const { full_name, email_address, contact_number, password } = req.body;
    const errors = validationResult(req);
    console.log(req.body);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    } else {
      try {
        let user = new User({
          full_name,
          email_address,
          contact_number,
          password,
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
          user: {
            id: user.id,
          },
        };
        jwt.sign(
          payload,
          process.env.SECRET,
          {
            expiresIn: 3600,
          },
          (err, token) => {
            if (err) throw err;

            res.send({ token });
          }
        );
      } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error");
      }
    }
  }
);

// const mailOptions = {
//   from: "poojashargude@gmail.com",
//   to: "veerwaninandani@gmail.com",
//   subject: "Reminder for the meeting",
//   text: "Here is your scheduled reminder for meeting",
// };

// //email transport configuration
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "poojashargude@gmail.com",
//     pass: "Aaibaba@123",
//   },
// });

// //send email
// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log("Email send:" + info.response);
//   }
// });

module.exports = router;
