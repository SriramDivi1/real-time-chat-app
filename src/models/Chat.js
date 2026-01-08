const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    chatType: {
      type: String,
      enum: ['direct', 'group'],
      required: [true, 'Chat type is required'],
      index: true
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    groupName: {
      type: String,
      maxlength: [100, 'Group name cannot exceed 100 characters'],
      required: function () {
        return this.chatType === 'group';
      }
    },
    groupAvatar: {
      type: String,
      default: null
    },
    groupDescription: {
      type: String,
      maxlength: [500, 'Group description cannot exceed 500 characters'],
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return this.chatType === 'group';
      }
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null
    },
    lastMessageTime: {
      type: Date,
      default: null
    },
    messageCount: {
      type: Number,
      default: 0
    },
    pinnedMessages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
      }
    ],
    mutedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        mutedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    isArchived: {
      type: Boolean,
      default: false
    },
    archivedAt: Date,
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
chatSchema.index({ participants: 1, createdAt: -1 });
chatSchema.index({ chatType: 1, createdAt: -1 });
chatSchema.index({ createdBy: 1, chatType: 1 });
chatSchema.index({ lastMessageTime: -1 });

// Create unique index for direct chats between two users
chatSchema.index(
  { participants: 1, chatType: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { chatType: 'direct' }
  }
);

// Virtual for participant count
chatSchema.virtual('participantCount').get(function () {
  return this.participants ? this.participants.length : 0;
});

// Populate participants and last message
chatSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: 'participants',
    select: 'username avatar email status',
    options: { _recursed: true }
  })
    .populate({
      path: 'lastMessage',
      select: 'content senderId createdAt messageType',
      options: { _recursed: true }
    })
    .populate({
      path: 'createdBy',
      select: 'username avatar email',
      options: { _recursed: true }
    });
  next();
});

// Method to add participant
chatSchema.methods.addParticipant = async function (userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    await this.save();
  }
  return this;
};

// Method to remove participant
chatSchema.methods.removeParticipant = async function (userId) {
  this.participants = this.participants.filter((id) => id.toString() !== userId.toString());
  if (this.admins.includes(userId)) {
    this.admins = this.admins.filter((id) => id.toString() !== userId.toString());
  }
  await this.save();
  return this;
};

// Method to add admin
chatSchema.methods.addAdmin = async function (userId) {
  if (!this.admins.includes(userId)) {
    this.admins.push(userId);
    await this.save();
  }
  return this;
};

// Method to check if user is admin
chatSchema.methods.isAdmin = function (userId) {
  return this.admins.some((id) => id.toString() === userId.toString());
};

// Method to check if user is participant
chatSchema.methods.isParticipant = function (userId) {
  return this.participants.some((id) => id.toString() === userId.toString());
};

// Ensure virtuals are included in JSON
chatSchema.set('toJSON', { virtuals: true });
chatSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Chat', chatSchema);
