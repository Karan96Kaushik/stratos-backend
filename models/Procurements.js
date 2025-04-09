const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Procurements = new Schema(
  {
    procurementID: String,

    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Procurements",
    strict:false,
  }
);

module.exports = {
  Procurements: mongoose.model("Procurements", Procurements),
};
