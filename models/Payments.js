const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Payments = new Schema(
  {
    userID: String,
    tenantID: String,
    paymentAmount: Number,
    paymentDate: Date,
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Payments"
  }
);

module.exports = {
  Payments: mongoose.model("Payments", Payments),
};
