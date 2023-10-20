const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Utils = new Schema(
  {
    type:String,
    clientID:Number,
    agentRegistrationID:Number,
    projectRegistrationID:Number,
    ids: Schema.Types.Mixed
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "Utils"
  }
);

let UtilsModel = mongoose.model("Utils", Utils)

const getID = async (type, padding=10000) => {
    let data = await UtilsModel.findOne({type:"IDs"})
    const idNum = String(padding + (data.ids[type + "ID"] ?? 0) + 1)
    return idNum.substring(1,)
}

const updateID = async (type) => {
    let data = await UtilsModel.findOne({type:"IDs"})
    data = Object.assign({}, data._doc)
    data.ids[type + "ID"] = (data.ids[type + "ID"] ?? 0) + 1 
    // console.log("UPDATEID", data, type + "ID")
    const _ = await UtilsModel.updateOne(data)
    return 
}

module.exports = {
  Utils: UtilsModel,
  getID,
  updateID
};
