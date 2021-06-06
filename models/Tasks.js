const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Tasks = new Schema(
  {
    clientID:{
      required:true,
      type:mongoose.Schema.Types.ObjectId
    },

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

    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Tasks"
  }
);

module.exports = {
  Tasks: mongoose.model("Tasks", Tasks),
};
