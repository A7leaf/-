const mongoose = require('mongoose');

const privateKeySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  privateKey: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const PrivateKey = mongoose.model('PrivateKey', privateKeySchema);

module.exports = PrivateKey;