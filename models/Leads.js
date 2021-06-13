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
    office: String,

    projectName: String,
    reraNum: String,
    location: String,
    serviceType: String,

    breifService: String,
    breifCase: String,

    plotArea: String,
    plotNum: String,
    certNum: String,

    type: String,
    category: String,
    service: String,
    status: String,

    leadRating: Number,
    leadSource: String,
    leadResponsibility: String,
    followUpDate: String,
    remarks: String,
    closureStatus: String,

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
