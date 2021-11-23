const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Leads = new Schema(
  {
    leadID: String,
    leadType: String,

    memberID: String,
    memberName: String,

    name:String,
    mobile: String,
    email: String,
    office: String,

    projectName: String,
    companyName: String,
    reraNum: String,
    location: String,
    serviceType: Array,

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

    quoteAmount: String,

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
