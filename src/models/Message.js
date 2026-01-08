const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: [true, 'Chat ID is required']
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required']
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    },
    attachments: [
      {
        type: String,
        url: String,
        fileName: String,
        fileSize: Number,
        fileType: String
      }
    ],
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        readAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    edited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    editHistory: [
      {
        content: String,
        editedAt: Date
      }
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null
    },
    reactions: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        emoji: String
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for efficient queries
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ chatId: 1, isDeleted: 1 });

// Populate sender info automatically
messageSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: 'senderId',
    select: 'username avatar email',
    options: { _recursed: true }
  });
  next();
});

module.exports = mongoose.model('Message', messageSchema);
