const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Members = new Schema(
  {
    memberID:String,

    userName:String,
    email:String,
    phone:String,
    designation:String,
    department:String,
    address:String,
    emergencyContact:String,
    bloodGroup:String,
    startDate:String,
    endDate:String,

    password:String,

    permissions:{
      page:Number,
      service:Number,
    },



    addedBy: {
      required:true,
      type:mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Members"
  }
);

module.exports = {
  Members: mongoose.model("Members", Members),
};
