const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllStaff,
  getUsersByRole,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// All routes here are protected and require 'admin' role
router.use(protect);
router.use(authorizeRoles('admin'));

router.post('/', createUser);
router.get('/staff', getAllStaff);
router.get('/:role', getUsersByRole);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
