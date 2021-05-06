const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Units = new Schema(
  {
    name: String,
    address: String,
    // payment: String,
    isOccupied: String,
    ownerId: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    },
    rent: Number,
    bedrooms: Number,
    // capacity: String,
    // primaryTenant: String,
    // tenantWhatsapp: String,
    // otherTenants:Array
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Units"
  }
);

module.exports = {
  Units: mongoose.model("Units", Units),
};
