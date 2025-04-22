const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Vendors = new Schema(
  {
    vendorName: String,
    vendorCode: String,
    vendorType: String,

    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Vendors",
    strict:false,
  }
);

module.exports = {
  Vendors: mongoose.model("Vendors", Vendors),
};
