import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    excerpt: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['workout', 'nutrition', 'recovery', 'motivation', 'wellness', 'fitness'],
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
    authorBio: {
      type: String,
    },
    authorAvatar: {
      type: String,
    },
    featuredImage: {
      type: String,
    },
    readTime: {
      type: String,
      required: true,
    },
    tags: [{
      type: String,
    }],
    isPublished: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
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
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    seoTitle: {
      type: String,
    },
    seoDescription: {
      type: String,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", BlogSchema);
