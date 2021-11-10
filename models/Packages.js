const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Packages = new Schema(
  {
    packageID:String,
    
    _clientID:{
      required:true,
      type:mongoose.Schema.Types.ObjectId
    },

    clientName:String,

    remarks:String,

    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Packages",
    strict:false
  }
);

module.exports = {
  Packages: mongoose.model("Packages", Packages),
};
