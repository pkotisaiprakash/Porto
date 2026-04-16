const mongoose = require('mongoose');

const mailHistorySchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  footer: {
    type: String,
    default: ''
  },
  style: {
    primaryColor: String,
    backgroundColor: String,
    textColor: String,
    footerColor: String
  },
  templateId: {
    type: String,
    default: null
  },
  recipientCount: {
    type: Number,
    required: true
  },
  recipients: [{
    email: String,
    name: String
  }],
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    default: 'sent'
  },
  failedRecipients: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('MailHistory', mailHistorySchema);