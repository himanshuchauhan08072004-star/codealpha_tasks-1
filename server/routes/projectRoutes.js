const express = require('express');
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { checkProjectAccess, requireProjectOwner } = require('../middleware/checkProjectAccess');
const projectTaskRoutes = require('./projectTaskRoutes');

const router = express.Router();

router.use(protect);

router.route('/').get(getProjects).post(createProject);

router
  .route('/:id')
  .get(checkProjectAccess, getProject)
  .put(checkProjectAccess, updateProject)
  .delete(checkProjectAccess, requireProjectOwner, deleteProject);

router
  .route('/:id/members')
  .post(checkProjectAccess, requireProjectOwner, addMember);

router
  .route('/:id/members/:userId')
  .delete(checkProjectAccess, requireProjectOwner, removeMember);

router.use('/:id/tasks', projectTaskRoutes);

module.exports = router;
