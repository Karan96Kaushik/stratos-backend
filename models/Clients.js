const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Clients = new Schema(
  {
    type: String,
    clientType: String,
    phone: String,
    plotNum: String,
    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Clients"
  }
);

module.exports = {
  Clients: mongoose.model("Clients", Clients),
};
