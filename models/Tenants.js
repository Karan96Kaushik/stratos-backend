const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Tenants = new Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    rent: Number,
    tenantWhatsapp: String,
    isActive: {type:Boolean, default:true},
    propertyId: mongoose.Schema.Types.ObjectId,
    ownerId: mongoose.Schema.Types.ObjectId,
    bedrooms: Number,
    dueDate:{type:Number, default:1},
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Tenants"
  }
);

module.exports = {
  Tenants: mongoose.model("Tenants", Tenants),
};
