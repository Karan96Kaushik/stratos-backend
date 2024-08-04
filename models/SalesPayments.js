const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let SalesPayments = new Schema(
  {
    
    _salesID:{
      required:true,
      type:mongoose.Schema.Types.ObjectId
    },

    paymentDate: Date,
    receivedAmount: Number,
    balanceAmount: Number,
    confirmedAmount: Number,

    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "SalesPayments",
    strict:false
  }
);

module.exports = {
  SalesPayments: mongoose.model("SalesPayments", SalesPayments),
};
