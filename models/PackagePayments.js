const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let PackagePayments = new Schema(
  {
    paymentID:String,
    remarks:String,

    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "PackagePayments",
    strict:false
  }
);

module.exports = {
  PackagePayments: mongoose.model("PackagePayments", PackagePayments),
};
