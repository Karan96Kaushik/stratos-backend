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

    remarks:String,
    rating:Number,

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
