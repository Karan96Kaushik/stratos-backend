const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Invoices = new Schema(
  {
    invoiceID:String,
    memberID:String,
    from:String,
    type:String,
    date:String,
    gstNum:String,
    billTo:String,
    clientAddress:String,
    clientGST:String,
    billAmount:String,
    taxAmount:String,
    totalAmount:String,
    paidAmount:String,
    totalAmount:String,
    balanceAmount:String,

    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Invoices",
  }
);

module.exports = {
  Invoices: mongoose.model("Invoices", Invoices),
};
