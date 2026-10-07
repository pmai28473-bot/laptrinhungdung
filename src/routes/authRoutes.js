const express = require('express');
const router = express.Router();
const { register, login, getMe, createUser, getUsers, updateUserRole, toggleUserStatus, deleteUser } = require('../controllers/authController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/users', protect, adminOnly, createUser);
router.get('/users', protect, adminOnly, getUsers);
router.patch('/users/:id/status', protect, adminOnly, toggleUserStatus);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.put('/users/:id/role', protect, adminOnly, updateUserRole);

module.exports = router;