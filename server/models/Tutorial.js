import mongoose from "mongoose";

const tutorialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: String,
    required: true,
  },
  equipment: [{
    type: String,
    trim: true,
  }],
  caloriesBurned: {
    type: Number,
    default: 0,
  },
  muscleGroups: [{
    type: String,
    trim: true,
  }],
  steps: [{
    type: String,
    trim: true,
  }],
  imageUrl: {
    type: String,
    default: '',
  },
  videoUrl: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isPublished: {
    type: Boolean,
    default: true,
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  shares: {
    type: Number,
    default: 0,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    replies: [{
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        auto: true
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      userName: {
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
}, { timestamps: true });

const Tutorial = mongoose.model("Tutorial", tutorialSchema);

export default Tutorial;
