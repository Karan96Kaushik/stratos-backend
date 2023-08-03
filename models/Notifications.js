const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Notifications = new Schema(
  {

    id:String,
    type:String,
    text:String,
    _memberID: Schema.Types.ObjectId

  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Notifications",
  }
);

module.exports = {
  Notifications: mongoose.model("Notifications", Notifications),
};
