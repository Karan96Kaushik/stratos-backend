const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Payments = new Schema(
  {
    ownerId: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    },
    tenantId: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    },
    amount: Number,
    date: Date,
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Payments"
  }
);

module.exports = {
  Payments: mongoose.model("Payments", Payments),
};
