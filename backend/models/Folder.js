const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  path: {
    type: String,
    required: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  size: {
    type: Number,
    default: 0
  },
  itemCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
folderSchema.index({ owner: 1, parentFolder: 1 });
folderSchema.index({ owner: 1, name: 1 });

// Virtual for getting subfolders
folderSchema.virtual('subfolders', {
  ref: 'Folder',
  localField: '_id',
  foreignField: 'parentFolder'
});

// Virtual for getting files in folder
folderSchema.virtual('files', {
  ref: 'File',
  localField: '_id',
  foreignField: 'folder'
});

// Method to get full path
folderSchema.methods.getFullPath = async function() {
  if (!this.parentFolder) return this.name;
  
  const parent = await this.constructor.findById(this.parentFolder);
  const parentPath = await parent.getFullPath();
  return `${parentPath}/${this.name}`;
};

module.exports = mongoose.model('Folder', folderSchema);