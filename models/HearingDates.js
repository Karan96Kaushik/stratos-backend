const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let HearingDates = new Schema(
  {
    taskID:String,
    
    hearingDate: Date,
    
    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "HearingDates",
  }
);

module.exports = {
  HearingDates: mongoose.model("HearingDates", HearingDates),
};
