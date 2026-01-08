const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const { logger } = require('../utils/logger');
const { validationResult } = require('express-validator');

/**
 * Create a new chat (direct or group)
 */
const createChat = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { chatType, participantIds, groupName, groupDescription } = req.body;
    const userId = req.userId;

    // Ensure current user is in participants
    let participants = [...(participantIds || [])];
    if (!participants.includes(userId)) {
      participants.push(userId);
    }

    // For direct chat, ensure exactly 2 participants
    if (chatType === 'direct') {
      if (participants.length !== 2) {
        return res.status(400).json({
          success: false,
          message: 'Direct chat must have exactly 2 participants'
        });
      }

      // Check if direct chat already exists
      const existingChat = await Chat.findOne({
        chatType: 'direct',
        participants: { $all: participants }
      });

      if (existingChat) {
        return res.status(200).json({
          success: true,
          message: 'Chat already exists',
          chat: existingChat
        });
      }
    }

    // For group chat, validate group name
    if (chatType === 'group') {
      if (!groupName || groupName.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Group name is required for group chats'
        });
      }

      if (participants.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Group chat must have at least 2 participants'
        });
      }
    }

    // Create new chat
    const chat = new Chat({
      chatType,
      participants,
      groupName: chatType === 'group' ? groupName : null,
      groupDescription: chatType === 'group' ? groupDescription : null,
      createdBy: chatType === 'group' ? userId : null,
      admins: chatType === 'group' ? [userId] : []
    });

    await chat.save();
    await chat.populate([
      {
        path: 'participants',
        select: 'username avatar email status'
      },
      {
        path: 'createdBy',
        select: 'username avatar email'
      }
    ]);

    logger.info(`Chat created: ${chatType} - ${chat._id}`);

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      chat
    });
  } catch (error) {
    logger.error('Create chat error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat',
      error: error.message
    });
  }
};

/**
 * Get list of chats for authenticated user
 */
const getChatList = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 20, skip = 0 } = req.query;

    // Find all chats where user is a participant
    const chats = await Chat.find({
      participants: userId,
      isArchived: false
    })
      .populate('participants', 'username avatar email status')
      .populate('lastMessage')
      .populate('createdBy', 'username avatar')
      .sort({ lastMessageTime: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Get unread count for each chat
    const chatsWithUnreadCount = await Promise.all(
      chats.map(async (chat) => {
        const unreadMessages = await Message.countDocuments({
          chatId: chat._id,
          isDeleted: false,
          'readBy.userId': { $ne: userId }
        });

        return {
          ...chat.toObject(),
          unreadCount: unreadMessages
        };
      })
    );

    const totalChats = await Chat.countDocuments({
      participants: userId,
      isArchived: false
    });

    res.status(200).json({
      success: true,
      chats: chatsWithUnreadCount,
      totalChats,
      hasMore: parseInt(skip) + parseInt(limit) < totalChats
    });
  } catch (error) {
    logger.error('Get chat list error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat list',
      error: error.message
    });
  }
};

/**
 * Get chat history (messages) for a specific chat
 */
const getChatHistory = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;
    const { limit = 50, skip = 0 } = req.query;

    // Verify user is participant in this chat
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (!chat.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat'
      });
    }

    // Get messages sorted by newest first, then reverse to show chronological order
    const messages = await Message.find({
      chatId,
      isDeleted: false
    })
      .populate('senderId', 'username avatar email')
      .populate('replyTo', 'content senderId createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    // Reverse to show in chronological order
    messages.reverse();

    const totalMessages = await Message.countDocuments({
      chatId,
      isDeleted: false
    });

    // Mark messages as read by current user
    await Message.updateMany(
      {
        chatId,
        isDeleted: false,
        'readBy.userId': { $ne: userId }
      },
      {
        $push: {
          readBy: {
            userId,
            readAt: new Date()
          }
        }
      }
    );

    res.status(200).json({
      success: true,
      messages,
      totalMessages,
      hasMore: parseInt(skip) + parseInt(limit) < totalMessages,
      chat: {
        _id: chat._id,
        chatType: chat.chatType,
        groupName: chat.groupName,
        participants: chat.participants.length
      }
    });
  } catch (error) {
    logger.error('Get chat history error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
      error: error.message
    });
  }
};

/**
 * Send a message to a chat
 */
const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { chatId } = req.params;
    const { content, messageType = 'text', attachments = [], replyTo } = req.body;
    const userId = req.userId;

    // Verify chat exists and user is participant
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (!chat.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat'
      });
    }

    // Create message
    const message = new Message({
      chatId,
      senderId: userId,
      content,
      messageType,
      attachments: attachments.length > 0 ? attachments : undefined,
      replyTo: replyTo || null,
      readBy: [{ userId, readAt: new Date() }]
    });

    await message.save();
    await message.populate('senderId', 'username avatar email');

    // Update chat's last message
    chat.lastMessage = message._id;
    chat.lastMessageTime = new Date();
    chat.messageCount = (chat.messageCount || 0) + 1;
    await chat.save();

    logger.info(`Message sent to chat ${chatId}`);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    logger.error('Send message error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

/**
 * Edit a message
 */
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty'
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only message sender can edit
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }

    // Save edit history
    if (!message.editHistory) {
      message.editHistory = [];
    }
    message.editHistory.push({
      content: message.content,
      editedAt: new Date()
    });

    message.content = content;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: message
    });
  } catch (error) {
    logger.error('Edit message error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to edit message',
      error: error.message
    });
  }
};

/**
 * Delete a message
 */
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only message sender or chat admin can delete
    const chat = await Chat.findById(message.chatId);
    const isAdmin = chat.isAdmin(userId);
    const isSender = message.senderId.toString() === userId;

    if (!isAdmin && !isSender) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = '[This message has been deleted]';
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    logger.error('Delete message error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

/**
 * Add participant to group chat
 */
const addParticipant = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId: newUserId } = req.body;
    const requesterId = req.userId;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (chat.chatType !== 'group') {
      return res.status(400).json({
        success: false,
        message: 'Can only add participants to group chats'
      });
    }

    if (!chat.isAdmin(requesterId)) {
      return res.status(403).json({
        success: false,
        message: 'Only group admins can add participants'
      });
    }

    if (chat.isParticipant(newUserId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a participant'
      });
    }

    await chat.addParticipant(newUserId);
    await chat.populate('participants', 'username avatar email');

    res.status(200).json({
      success: true,
      message: 'Participant added successfully',
      chat
    });
  } catch (error) {
    logger.error('Add participant error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to add participant',
      error: error.message
    });
  }
};

/**
 * Remove participant from group chat
 */
const removeParticipant = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId: userToRemove } = req.body;
    const requesterId = req.userId;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (chat.chatType !== 'group') {
      return res.status(400).json({
        success: false,
        message: 'Can only remove participants from group chats'
      });
    }

    // Only admin or the user themselves can remove
    if (!chat.isAdmin(requesterId) && requesterId !== userToRemove) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to remove this participant'
      });
    }

    if (!chat.isParticipant(userToRemove)) {
      return res.status(400).json({
        success: false,
        message: 'User is not a participant'
      });
    }

    await chat.removeParticipant(userToRemove);
    await chat.populate('participants', 'username avatar email');

    res.status(200).json({
      success: true,
      message: 'Participant removed successfully',
      chat
    });
  } catch (error) {
    logger.error('Remove participant error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to remove participant',
      error: error.message
    });
  }
};

module.exports = {
  createChat,
  getChatList,
  getChatHistory,
  sendMessage,
  editMessage,
  deleteMessage,
  addParticipant,
  removeParticipant
};
