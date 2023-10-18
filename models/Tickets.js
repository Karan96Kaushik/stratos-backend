const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Tickets = new Schema(
  {
    ticketID: String,
    description: String,

    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Tickets",
    strict:false,
  }
);

module.exports = {
  Tickets: mongoose.model("Tickets", Tickets),
};
