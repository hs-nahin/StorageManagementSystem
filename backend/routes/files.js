const express = require('express');
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require('express-validator');
const File = require('../models/File');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// Get all files for user
router.get('/', auth, async (req, res) => {
  try {
    const { folder, type, search, favorite, limit = 20, page = 1 } = req.query;
    
    let query = { owner: req.user._id };
    
    if (folder) {
      query.folder = folder === 'root' ? null : folder;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (favorite === 'true') {
      query.isFavorite = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [files, total] = await Promise.all([
      File.find(query)
        .populate('owner', 'username email')
        .populate('folder', 'name path')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      File.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        files,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: files.length,
          totalFiles: total
        }
      }
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get file by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user._id
    })
    .populate('owner', 'username email')
    .populate('folder', 'name path');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Update last accessed
    file.lastAccessed = new Date();
    await file.save();

    res.json({
      success: true,
      data: { file }
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Upload files
router.post('/upload', auth, upload.array('files', 10), handleMulterError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { folder, tags, description } = req.body;
    const uploadedFiles = [];
    let totalSize = 0;

    // Calculate total size
    req.files.forEach(file => {
      totalSize += file.size;
    });

    // Check storage limit
    if (!req.user.hasEnoughStorage(totalSize)) {
      // Delete uploaded files
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Not enough storage space'
      });
    }

    // Process each file
    for (const file of req.files) {
      const fileType = getFileType(file.mimetype);
      
      const newFile = new File({
        name: file.filename,
        originalName: file.originalname,
        type: fileType,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/uploads/${req.user._id}/${file.filename}`,
        owner: req.user._id,
        folder: folder || null,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        description: description || ''
      });

      await newFile.save();
      await newFile.populate('folder', 'name path');
      uploadedFiles.push(newFile);
    }

    // Update user storage
    req.user.storageUsed += totalSize;
    await req.user.save();

    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      data: { files: uploadedFiles }
    });
  } catch (error) {
    console.error('Upload files error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during file upload'
    });
  }
});

// Update file
router.put('/:id', auth, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('File name cannot be empty'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const { name, description, tags, isFavorite, folder } = req.body;

    // Update file fields
    if (name) file.name = name;
    if (description !== undefined) file.description = description;
    if (tags) file.tags = tags.split(',').map(tag => tag.trim());
    if (isFavorite !== undefined) file.isFavorite = isFavorite;
    if (folder !== undefined) file.folder = folder || null;

    await file.save();
    await file.populate('folder', 'name path');

    res.json({
      success: true,
      message: 'File updated successfully',
      data: { file }
    });
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete file
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete physical file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Update user storage
    req.user.storageUsed = Math.max(0, req.user.storageUsed - file.size);
    await req.user.save();

    // Delete from database
    await File.findByIdAndDelete(file._id);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Download file
router.get('/:id/download', auth, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    if (!fs.existsSync(file.path)) {
      return res.status(404).json({
        success: false,
        message: 'Physical file not found'
      });
    }

    // Update download count
    file.downloadCount += 1;
    file.lastAccessed = new Date();
    await file.save();

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);

    // Stream file
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Duplicate file
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalFile = await File.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!originalFile) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check storage limit
    if (!req.user.hasEnoughStorage(originalFile.size)) {
      return res.status(400).json({
        success: false,
        message: 'Not enough storage space'
      });
    }

    // Create duplicate name
    const ext = path.extname(originalFile.originalName);
    const nameWithoutExt = path.basename(originalFile.originalName, ext);
    let duplicateName = `${nameWithoutExt} (Copy)${ext}`;
    
    // Copy physical file
    const userDir = path.join('uploads', req.user._id.toString());
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFileName = `${nameWithoutExt}-copy-${uniqueSuffix}${ext}`;
    const newFilePath = path.join(userDir, newFileName);

    fs.copyFileSync(originalFile.path, newFilePath);

    // Create duplicate file record
    const duplicateFile = new File({
      name: newFileName,
      originalName: duplicateName,
      type: originalFile.type,
      mimeType: originalFile.mimeType,
      size: originalFile.size,
      path: newFilePath,
      url: `/uploads/${req.user._id}/${newFileName}`,
      owner: req.user._id,
      folder: originalFile.folder,
      tags: [...originalFile.tags],
      description: originalFile.description
    });

    await duplicateFile.save();
    await duplicateFile.populate('folder', 'name path');

    // Update user storage
    req.user.storageUsed += originalFile.size;
    await req.user.save();

    res.status(201).json({
      success: true,
      message: 'File duplicated successfully',
      data: { file: duplicateFile }
    });
  } catch (error) {
    console.error('Duplicate file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to determine file type
function getFileType(mimeType) {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('document') || mimeType.includes('text')) return 'document';
  return 'other';
}

module.exports = router;