const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Units = new Schema(
  {
    name: String,
    address: String,
    payment: String,
    isOccupied: String,
    capacity: String,
    primaryTenant: String,
    tenantWhatsapp: String,
    otherTenants:Array
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "User"
  }
);

module.exports = {
  Units: mongoose.model("Units", Units),
};
