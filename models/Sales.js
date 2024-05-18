const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Sales = new Schema(
  {
    salesID: String,
    meetingDate: Date,
    followUpDate: Date,
    callingDate: Date,

    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Sales",
    strict:false,
  }
);

module.exports = {
  Sales: mongoose.model("Sales", Sales),
};
