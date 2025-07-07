const express = require('express');
const User = require('../models/User');
const Folder = require('../models/Folder');
const File = require('../models/File');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

const router = express.Router();

// Get storage summary
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get counts and sizes
    const [
      folderCount,
      fileStats,
      noteCount,
      recentFiles,
      recentNotes,
      favoriteItems,
      storageByType
    ] = await Promise.all([
      // Total folders
      Folder.countDocuments({ owner: userId }),
      
      // File statistics
      File.aggregate([
        { $match: { owner: userId } },
        {
          $group: {
            _id: null,
            totalFiles: { $sum: 1 },
            totalSize: { $sum: '$size' },
            imageCount: {
              $sum: { $cond: [{ $eq: ['$type', 'image'] }, 1, 0] }
            },
            pdfCount: {
              $sum: { $cond: [{ $eq: ['$type', 'pdf'] }, 1, 0] }
            },
            documentCount: {
              $sum: { $cond: [{ $eq: ['$type', 'document'] }, 1, 0] }
            },
            otherCount: {
              $sum: { $cond: [{ $eq: ['$type', 'other'] }, 1, 0] }
            }
          }
        }
      ]),
      
      // Total notes
      Note.countDocuments({ owner: userId }),
      
      // Recent files (last 5)
      File.find({ owner: userId })
        .populate('folder', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name originalName type size createdAt folder'),
      
      // Recent notes (last 5)
      Note.find({ owner: userId })
        .populate('folder', 'name')
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title content createdAt updatedAt folder'),
      
      // Favorite items count
      Promise.all([
        Folder.countDocuments({ owner: userId, isFavorite: true }),
        File.countDocuments({ owner: userId, isFavorite: true }),
        Note.countDocuments({ owner: userId, isFavorite: true })
      ]),
      
      // Storage breakdown by file type
      File.aggregate([
        { $match: { owner: userId } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            size: { $sum: '$size' }
          }
        }
      ])
    ]);

    // Process file stats
    const fileStatsData = fileStats[0] || {
      totalFiles: 0,
      totalSize: 0,
      imageCount: 0,
      pdfCount: 0,
      documentCount: 0,
      otherCount: 0
    };

    // Calculate storage usage
    const user = req.user;
    const storageUsed = user.storageUsed;
    const storageLimit = user.storageLimit;
    const storagePercentage = user.getStoragePercentage();

    // Format storage breakdown
    const storageBreakdown = storageByType.reduce((acc, item) => {
      acc[item._id] = {
        count: item.count,
        size: item.size,
        percentage: storageUsed > 0 ? Math.round((item.size / storageUsed) * 100) : 0
      };
      return acc;
    }, {});

    // Summary data
    const summary = {
      storage: {
        used: storageUsed,
        limit: storageLimit,
        percentage: storagePercentage,
        available: storageLimit - storageUsed,
        breakdown: storageBreakdown
      },
      counts: {
        folders: folderCount,
        files: fileStatsData.totalFiles,
        notes: noteCount,
        favorites: {
          folders: favoriteItems[0],
          files: favoriteItems[1],
          notes: favoriteItems[2],
          total: favoriteItems[0] + favoriteItems[1] + favoriteItems[2]
        }
      },
      fileTypes: {
        images: fileStatsData.imageCount,
        pdfs: fileStatsData.pdfCount,
        documents: fileStatsData.documentCount,
        others: fileStatsData.otherCount
      },
      recent: {
        files: recentFiles.map(file => ({
          id: file._id,
          name: file.originalName,
          type: file.type,
          size: file.size,
          folder: file.folder?.name || 'Root',
          createdAt: file.createdAt
        })),
        notes: recentNotes.map(note => ({
          id: note._id,
          title: note.title,
          preview: note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
          folder: note.folder?.name || 'Root',
          updatedAt: note.updatedAt
        }))
      },
      statistics: {
        totalItems: folderCount + fileStatsData.totalFiles + noteCount,
        storageEfficiency: storageUsed > 0 ? Math.round((fileStatsData.totalFiles / (storageUsed / (1024 * 1024))) * 100) / 100 : 0, // files per MB
        averageFileSize: fileStatsData.totalFiles > 0 ? Math.round(fileStatsData.totalSize / fileStatsData.totalFiles) : 0
      }
    };

    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get detailed analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30' } = req.query; // days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Activity over time
    const [fileActivity, noteActivity, folderActivity] = await Promise.all([
      File.aggregate([
        {
          $match: {
            owner: userId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            },
            count: { $sum: 1 },
            size: { $sum: '$size' }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]),
      
      Note.aggregate([
        {
          $match: {
            owner: userId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]),
      
      Folder.aggregate([
        {
          $match: {
            owner: userId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ])
    ]);

    // Most accessed files
    const popularFiles = await File.find({ owner: userId })
      .sort({ downloadCount: -1, lastAccessed: -1 })
      .limit(10)
      .select('name originalName type downloadCount lastAccessed')
      .populate('folder', 'name');

    // Storage growth over time
    const storageGrowth = await File.aggregate([
      { $match: { owner: userId } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          dailyStorage: { $sum: '$size' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Calculate cumulative storage
    let cumulativeStorage = 0;
    const cumulativeStorageGrowth = storageGrowth.map(item => {
      cumulativeStorage += item.dailyStorage;
      return {
        date: item._id.date,
        storage: cumulativeStorage
      };
    });

    const analytics = {
      period: parseInt(period),
      activity: {
        files: fileActivity.map(item => ({
          date: item._id.date,
          count: item.count,
          size: item.size
        })),
        notes: noteActivity.map(item => ({
          date: item._id.date,
          count: item.count
        })),
        folders: folderActivity.map(item => ({
          date: item._id.date,
          count: item.count
        }))
      },
      popularFiles: popularFiles.map(file => ({
        id: file._id,
        name: file.originalName,
        type: file.type,
        downloads: file.downloadCount,
        lastAccessed: file.lastAccessed,
        folder: file.folder?.name || 'Root'
      })),
      storageGrowth: cumulativeStorageGrowth
    };

    res.json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;