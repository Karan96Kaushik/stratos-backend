// const mongoose = require('mongoose');
// import { ObjectID }  from 'mongodb';

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Grids = new Schema(
  {
    projectType: String,
    projectSubType: String,
    grids: Array
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "grids"
  }
);

let ProjectGrids = new Schema(
  {
    _projectID: mongoose.Schema.Types.ObjectId,
    _creatorID: mongoose.Types.ObjectId,
    gridname: String,
    gridType: String,
    isMaster: {
      type:Boolean, 
      default:false
    },
    isGroupItem: {
      type:Boolean, 
      default:false
    },
    _ownerID: String
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "projectgrids"
  }
);

module.exports = {
  Grids: mongoose.model("Grids", Grids),
  ProjectGrids: mongoose.model("ProjectGrids", ProjectGrids)
};
