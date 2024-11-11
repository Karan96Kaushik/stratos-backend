const mongoose = require('mongoose');

const IPSettingsSchema = new mongoose.Schema({
  ipAddresses: [String],
  isEnabled: {
    type: Boolean,
    default: false
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Members'
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now
  }
});

const IPSettings = mongoose.model('IPSettings', IPSettingsSchema);

module.exports = { IPSettings }; 