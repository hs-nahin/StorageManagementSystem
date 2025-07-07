const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['image', 'pdf', 'document', 'other']
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
fileSchema.index({ owner: 1, type: 1 });
fileSchema.index({ owner: 1, folder: 1 });
fileSchema.index({ owner: 1, isFavorite: 1 });

// Method to get file type from mime type
fileSchema.methods.getFileType = function() {
  if (this.mimeType.startsWith('image/')) return 'image';
  if (this.mimeType === 'application/pdf') return 'pdf';
  if (this.mimeType.includes('document') || this.mimeType.includes('text')) return 'document';
  return 'other';
};

// Method to format file size
fileSchema.methods.getFormattedSize = function() {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = mongoose.model('File', fileSchema);