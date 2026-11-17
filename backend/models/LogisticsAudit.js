const mongoose = require('mongoose');

const LogisticsAuditSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'USER_REGISTER', 
      'USER_LOGIN', 
      'ROLE_UPDATE', 
      'PROFILE_UPDATE', 
      'SHIPMENT_CREATED', 
      'DRIVER_ASSIGNED', 
      'DRIVER_AUTO_ASSIGNED', 
      'STATUS_UPDATED', 
      'PROOF_VERIFIED',
      'DELIVERY_COMPLETED',
      'USER_DELETED'
    ]
  },
  performedBy: {
    userId: { type: String, default: 'System' },
    name: { type: String, default: 'Administrator' },
    role: { type: String, default: 'Admin' }
  },
  targetEntity: {
    entityType: { type: String, required: true }, // 'User' or 'Shipment'
    entityId: { type: String, required: true },
    identifier: { type: String, default: '' } // Tracking Number or User Email
  },
  details: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('LogisticsAudit', LogisticsAuditSchema);
