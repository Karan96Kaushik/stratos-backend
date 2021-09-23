const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Clients = new Schema(
  {
    clientID:String,
    clientType:String,

    name:String,
    promoter:String,
    location:String,
    plotNum:String,
    plotArea:String,
    workStatus:String,
    userID:String,
    password:String,
    certNum:String,
    certDate:String,
    mobile:String,
    office:String,
    email:String,
    ca:String,
    engineer:String,
    architect:String,
    reference:String,
    remarks:String,
    completionDate:String,

    type:String,
    dueDate:String,
    
    relatedProject:String,
    reraNum:String,

    totalUnits:Number,
    bookedUnits:Number,

    receivedAmount:Number,

    extension:Boolean,
    proBono:Boolean,

    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Clients"
  }
);

module.exports = {
  Clients: mongoose.model("Clients", Clients),
};
