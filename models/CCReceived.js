const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let CCReceived = new Schema(
  {
    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "CCReceived",
    strict:false,
  }
);

module.exports = {
  CCReceived: mongoose.model("CCReceived", CCReceived),
};
