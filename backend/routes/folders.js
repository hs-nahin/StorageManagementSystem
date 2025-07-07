const express = require('express');
const { body, validationResult } = require('express-validator');
const Folder = require('../models/Folder');
const File = require('../models/File');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all folders for user
router.get('/', auth, async (req, res) => {
  try {
    const { parentFolder, search, favorite } = req.query;
    
    let query = { owner: req.user._id };
    
    if (parentFolder) {
      query.parentFolder = parentFolder === 'root' ? null : parentFolder;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (favorite === 'true') {
      query.isFavorite = true;
    }

    const folders = await Folder.find(query)
      .populate('owner', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { folders }
    });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get folder by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user._id
    }).populate('owner', 'username email');

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Get folder contents
    const [subfolders, files, notes] = await Promise.all([
      Folder.find({ parentFolder: folder._id, owner: req.user._id }),
      File.find({ folder: folder._id, owner: req.user._id }),
      Note.find({ folder: folder._id, owner: req.user._id })
    ]);

    res.json({
      success: true,
      data: {
        folder,
        contents: {
          subfolders,
          files,
          notes
        }
      }
    });
  } catch (error) {
    console.error('Get folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create folder
router.post('/', auth, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Folder name must be between 1 and 255 characters'),
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

    const { name, description, parentFolder, color } = req.body;

    // Check if folder with same name exists in same parent
    const existingFolder = await Folder.findOne({
      name,
      owner: req.user._id,
      parentFolder: parentFolder || null
    });

    if (existingFolder) {
      return res.status(400).json({
        success: false,
        message: 'Folder with this name already exists in this location'
      });
    }

    // Build path
    let path = name;
    if (parentFolder) {
      const parent = await Folder.findOne({
        _id: parentFolder,
        owner: req.user._id
      });
      
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent folder not found'
        });
      }
      
      path = `${parent.path}/${name}`;
    }

    const folder = new Folder({
      name,
      description,
      owner: req.user._id,
      parentFolder: parentFolder || null,
      path,
      color: color || '#3B82F6'
    });

    await folder.save();
    await folder.populate('owner', 'username email');

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      data: { folder }
    });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update folder
router.put('/:id', auth, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Folder name must be between 1 and 255 characters'),
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

    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    const { name, description, color, isFavorite } = req.body;

    // If name is being changed, check for duplicates
    if (name && name !== folder.name) {
      const existingFolder = await Folder.findOne({
        name,
        owner: req.user._id,
        parentFolder: folder.parentFolder,
        _id: { $ne: folder._id }
      });

      if (existingFolder) {
        return res.status(400).json({
          success: false,
          message: 'Folder with this name already exists in this location'
        });
      }

      // Update path if name changed
      const oldPath = folder.path;
      const pathParts = folder.path.split('/');
      pathParts[pathParts.length - 1] = name;
      folder.path = pathParts.join('/');

      // Update paths of all subfolders
      const subfolders = await Folder.find({
        owner: req.user._id,
        path: { $regex: `^${oldPath}/` }
      });

      for (const subfolder of subfolders) {
        subfolder.path = subfolder.path.replace(oldPath, folder.path);
        await subfolder.save();
      }
    }

    // Update folder fields
    if (name) folder.name = name;
    if (description !== undefined) folder.description = description;
    if (color) folder.color = color;
    if (isFavorite !== undefined) folder.isFavorite = isFavorite;

    await folder.save();
    await folder.populate('owner', 'username email');

    res.json({
      success: true,
      message: 'Folder updated successfully',
      data: { folder }
    });
  } catch (error) {
    console.error('Update folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete folder
router.delete('/:id', auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Check if folder has contents
    const [subfolders, files, notes] = await Promise.all([
      Folder.countDocuments({ parentFolder: folder._id, owner: req.user._id }),
      File.countDocuments({ folder: folder._id, owner: req.user._id }),
      Note.countDocuments({ folder: folder._id, owner: req.user._id })
    ]);

    const totalItems = subfolders + files + notes;

    if (totalItems > 0 && req.query.force !== 'true') {
      return res.status(400).json({
        success: false,
        message: `Folder contains ${totalItems} items. Use force=true to delete anyway.`,
        data: { itemCount: totalItems }
      });
    }

    // Delete folder and all its contents recursively
    await deleteFolder(folder._id, req.user._id);

    res.json({
      success: true,
      message: 'Folder deleted successfully'
    });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to recursively delete folder and contents
async function deleteFolder(folderId, userId) {
  // Get all subfolders
  const subfolders = await Folder.find({ parentFolder: folderId, owner: userId });
  
  // Recursively delete subfolders
  for (const subfolder of subfolders) {
    await deleteFolder(subfolder._id, userId);
  }
  
  // Delete files in folder
  await File.deleteMany({ folder: folderId, owner: userId });
  
  // Delete notes in folder
  await Note.deleteMany({ folder: folderId, owner: userId });
  
  // Delete the folder itself
  await Folder.findByIdAndDelete(folderId);
}

// Duplicate folder
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalFolder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!originalFolder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Create duplicate name
    let duplicateName = `${originalFolder.name} (Copy)`;
    let counter = 1;
    
    while (await Folder.findOne({
      name: duplicateName,
      owner: req.user._id,
      parentFolder: originalFolder.parentFolder
    })) {
      duplicateName = `${originalFolder.name} (Copy ${counter})`;
      counter++;
    }

    // Create duplicate folder
    const duplicateFolder = new Folder({
      name: duplicateName,
      description: originalFolder.description,
      owner: req.user._id,
      parentFolder: originalFolder.parentFolder,
      path: originalFolder.parentFolder 
        ? `${originalFolder.path.split('/').slice(0, -1).join('/')}/${duplicateName}`
        : duplicateName,
      color: originalFolder.color
    });

    await duplicateFolder.save();
    await duplicateFolder.populate('owner', 'username email');

    res.status(201).json({
      success: true,
      message: 'Folder duplicated successfully',
      data: { folder: duplicateFolder }
    });
  } catch (error) {
    console.error('Duplicate folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;