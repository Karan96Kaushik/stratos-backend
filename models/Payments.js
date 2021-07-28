const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Payments = new Schema(
  {
    taskID:String,
    
    _clientID:{
      required:true,
      type:mongoose.Schema.Types.ObjectId
    },

    clientName:String,

    serviceType:String,
    remarks:String,

    priority:Number,

    letterHead:Boolean,
    form3:Boolean,
    form2:Boolean,
    itr:Boolean,
    receiptFormat:Boolean,
    titleCertificate:Boolean,
    agreementDraft:Boolean,
    
    remarks:String,
    status:String,
    action:String,
    notes:String,
    deadline:String,

    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Payments",
    strict:false
  }
);

module.exports = {
  Payments: mongoose.model("Payments", Payments),
};
