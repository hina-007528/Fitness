import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  },
  tutorialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutorial'
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    duration: {
      type: Number, // For audio/video in seconds
      default: null
    }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for replies
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentId'
});

// Index for better query performance
commentSchema.index({ blogId: 1, createdAt: -1 });
commentSchema.index({ tutorialId: 1, createdAt: -1 });
commentSchema.index({ userId: 1, createdAt: -1 });
commentSchema.index({ parentId: 1 });

// Pre-save middleware to update likeCount
commentSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
    this.likeCount = this.likes.length;
  }
  next();
});

// Methods
commentSchema.methods.addLike = function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    this.likeCount = this.likes.length;
  }
  return this.save();
};

commentSchema.methods.removeLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
    this.likeCount = this.likes.length;
  }
  return this.save();
};

commentSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.content = '[deleted]';
  this.attachments = [];
  return this.save();
};

commentSchema.methods.edit = function(newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Static methods
commentSchema.statics.findByBlog = function(blogId, page = 1, limit = 10) {
  return this.find({ 
    blogId, 
    parentId: null, 
    isDeleted: false 
  })
  .populate('userId', 'name')
  .populate('replies')
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);
};

commentSchema.statics.findByTutorial = function(tutorialId, page = 1, limit = 10) {
  return this.find({ 
    tutorialId, 
    parentId: null, 
    isDeleted: false 
  })
  .populate('userId', 'name')
  .populate('replies')
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);
};

commentSchema.statics.findReplies = function(parentId) {
  return this.find({ 
    parentId, 
    isDeleted: false 
  })
  .populate('userId', 'name')
  .sort({ createdAt: 1 });
};

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
