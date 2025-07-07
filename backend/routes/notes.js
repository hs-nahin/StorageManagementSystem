const express = require('express');
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all notes for user
router.get('/', auth, async (req, res) => {
  try {
    const { folder, search, favorite, pinned, limit = 20, page = 1 } = req.query;
    
    let query = { owner: req.user._id };
    
    if (folder) {
      query.folder = folder === 'root' ? null : folder;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (favorite === 'true') {
      query.isFavorite = true;
    }
    
    if (pinned === 'true') {
      query.isPinned = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let sortQuery = {};
    if (pinned !== 'true') {
      sortQuery = { isPinned: -1, updatedAt: -1 };
    } else {
      sortQuery = { updatedAt: -1 };
    }

    const [notes, total] = await Promise.all([
      Note.find(query)
        .populate('owner', 'username email')
        .populate('folder', 'name path')
        .sort(sortQuery)
        .skip(skip)
        .limit(parseInt(limit)),
      Note.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        notes,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: notes.length,
          totalNotes: total
        }
      }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get note by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user._id
    })
    .populate('owner', 'username email')
    .populate('folder', 'name path');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Update last accessed
    note.lastAccessed = new Date();
    await note.save();

    res.json({
      success: true,
      data: { note }
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create note
router.post('/', auth, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters')
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

    const { title, content, folder, tags, color, isPinned } = req.body;

    const note = new Note({
      title,
      content,
      owner: req.user._id,
      folder: folder || null,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      color: color || '#FEF3C7',
      isPinned: isPinned || false
    });

    await note.save();
    await note.populate('folder', 'name path');

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: { note }
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update note
router.put('/:id', auth, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters')
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

    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    const { title, content, tags, color, isFavorite, isPinned, folder } = req.body;

    // Update note fields
    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags.split(',').map(tag => tag.trim());
    if (color) note.color = color;
    if (isFavorite !== undefined) note.isFavorite = isFavorite;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (folder !== undefined) note.folder = folder || null;

    await note.save();
    await note.populate('folder', 'name path');

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: { note }
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    await Note.findByIdAndDelete(note._id);

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Duplicate note
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalNote = await Note.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!originalNote) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Create duplicate note
    const duplicateNote = new Note({
      title: `${originalNote.title} (Copy)`,
      content: originalNote.content,
      owner: req.user._id,
      folder: originalNote.folder,
      tags: [...originalNote.tags],
      color: originalNote.color
    });

    await duplicateNote.save();
    await duplicateNote.populate('folder', 'name path');

    res.status(201).json({
      success: true,
      message: 'Note duplicated successfully',
      data: { note: duplicateNote }
    });
  } catch (error) {
    console.error('Duplicate note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Search notes
router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    const notes = await Note.find({
      owner: req.user._id,
      $text: { $search: query }
    })
    .populate('folder', 'name path')
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: { notes, query }
    });
  } catch (error) {
    console.error('Search notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;