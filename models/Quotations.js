const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Quotations = new Schema(
  {
    quotationID:String,
    memberID:String,
    dept:String,
    clientName:String,
    relatedProject:String,
    leadID:String,
    quoteValid:String,
    quotationDesc:String,
    quotationAmount:String,
    status:String,

    serviceType:String,
    remarks:String,

    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Quotations",
  }
);

module.exports = {
  Quotations: mongoose.model("Quotations", Quotations),
};
