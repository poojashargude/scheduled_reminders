const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
  },
  email_address: {
    type: String,
    required: true,
  },
  contact_number: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  
});

module.exports = mongoose.model("User", UserSchema);
