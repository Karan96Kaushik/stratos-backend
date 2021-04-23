// const mongoose = require('mongoose');
// import { ObjectID }  from 'mongodb';

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema
let LearningSchema = new Schema(
  {
    title: String,
    description: String,
    _projectID: mongoose.Types.ObjectId,
    _ownerID: mongoose.Types.ObjectId,
    _creatorID: mongoose.Types.ObjectId,
    gridType: String,
    uuid: mongoose.Types.ObjectId
  },
  {
    timestamps: { createdAt: "createdTime", updatedAt: "updateTime" },
    collection: "learning"
  }
);

module.exports = mongoose.model("Learning", LearningSchema);
