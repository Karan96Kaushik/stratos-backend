// const mongoose = require('mongoose');
// import { ObjectID }  from 'mongodb';

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let Project = new Schema(
  {
    id: mongoose.Schema.Types.ObjectId,
    uuid: mongoose.Schema.Types.ObjectId,
    _ownerID: mongoose.Schema.Types.ObjectId,
    title: String,
    rationale: String,
    description: String,
    isCurrentProject: Boolean,
    projectType: String,
    projectSubType: String,
    projectVisibility: String,
    grids: Array
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "projects"
  }
);

module.exports = mongoose.model("Project", Project);
