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
    startDate:Date,
    endDate:Date,

    password:String,

    permissions:{
      page:Number,
      service:Number,
    },

    activeNotifications: Array,


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
