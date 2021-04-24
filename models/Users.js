const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Users = new Schema(
  {
    userName: String,
    isActive: Boolean,
    password: String,
    email: String,
    phone: String,
    buildingName: String,
    agentName: String,
    units: Array,
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "User"
  }
);

module.exports = {
  Users: mongoose.model("Users", Users),
};
