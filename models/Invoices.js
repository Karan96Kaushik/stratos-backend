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
    particulars:String,
    panNum:String,
    projectName:String,
    clientGST:String,
    billAmount:Number,
    taxAmount:Number,
    totalAmount:Number,
    govtFees:Number,
    paidAmount:Number,
    balanceAmount:Number,
    items:Array,

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
