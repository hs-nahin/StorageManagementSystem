const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
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
  color: {
    type: String,
    default: '#FEF3C7'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
noteSchema.index({ owner: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ owner: 1, folder: 1 });
noteSchema.index({ owner: 1, isFavorite: 1 });

// Text search index
noteSchema.index({ title: 'text', content: 'text' });

// Method to get preview text
noteSchema.methods.getPreview = function(length = 100) {
  return this.content.length > length 
    ? this.content.substring(0, length) + '...'
    : this.content;
};

// Method to get word count
noteSchema.methods.getWordCount = function() {
  return this.content.trim().split(/\s+/).length;
};

module.exports = mongoose.model('Note', noteSchema);