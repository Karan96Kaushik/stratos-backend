const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Leads = new Schema(
  {
    leadID: String,
    leadType: String,

    memberID: String,

    name:String,
    mobile: String,
    email: String,
    projectName: String,
    reraNum: String,
    location: String,
    plotArea: String,
    serviceType: String,

    type: String,
    category: String,
    service: String,

    quoteAmount: Number,

    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Leads"
  }
);

module.exports = {
  Leads: mongoose.model("Leads", Leads),
};
