const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Tenants = new Schema(
  {
    tenantName: String,
    tenantWhatsapp: String,
    isActive: Boolean,
    // paymentAmount: Number,
    // paymentDate: Date,
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Tenants"
  }
);

module.exports = {
  Tenants: mongoose.model("Tenants", Tenants),
};
