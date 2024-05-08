const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Meetings = new Schema(
  {
    title:String,

    taskID:String,
    hearingDate: Date,
    court: String,
    remarks: String,
    clientName: String,
    clientID: String,
    
    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Meetings",
  }
);

module.exports = {
  Meetings: mongoose.model("Meetings", Meetings),
};
