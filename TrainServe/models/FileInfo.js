const mongoose = require('mongoose');

const fileInfoSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadTime: {
    type: Date,
    default: Date.now
  },
  mimeType: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// 创建索引以提高查询性能
fileInfoSchema.index({ hash: 1 });
fileInfoSchema.index({ uploadTime: -1 });

const FileInfo = mongoose.model('FileInfo', fileInfoSchema);

module.exports = FileInfo; 