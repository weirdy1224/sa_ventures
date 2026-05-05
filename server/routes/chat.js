const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const ctrl = require('../controllers/chatController');

// Customer: get or create their conversation
router.get('/conversation', authenticate, requireRole('customer'), ctrl.getOrCreateConversation);

// Any authenticated user: get messages (controller enforces ownership for customers)
router.get('/conversation/:id/messages', authenticate, ctrl.getMessages);

// Any authenticated user: send a message
router.post('/conversation/:id/messages', authenticate, ctrl.sendMessage);

// Admin / Staff only: list all conversations
router.get('/conversations', authenticate, requireRole('admin', 'staff'), ctrl.listConversations);

// Admin / Staff only: mark conversation as read
router.patch('/conversations/:id/read', authenticate, requireRole('admin', 'staff'), ctrl.markRead);

module.exports = router;
