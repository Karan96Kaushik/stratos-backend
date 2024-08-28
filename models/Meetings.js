const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Meetings = new Schema(
  {
    title:String,

    meetingDate: Date,
    meetingStatus: Number,
    remarks: String,
    
    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Meetings",
    strict:false,
  }
);

module.exports = {
  Meetings: mongoose.model("Meetings", Meetings),
};
