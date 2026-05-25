import mongoose from 'mongoose';

const adminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['approve_faq', 'reject_faq', 'edit_faq', 'delete_faq', 'create_faq', 'login', 'settings_update'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    targetType: {
      type: String,
      enum: ['faq', 'user', 'system', null],
      default: null,
    },
    details: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('AdminLog', adminLogSchema, 'yaksha_faq_adminlogs');
