const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let TicketMessages = new Schema(
  {
    _ticketID: String,
    message: String,
    memberName: String,

    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "TicketMessages",
    strict:false,
  }
);

module.exports = {
  TicketMessages: mongoose.model("TicketMessages", TicketMessages),
};
