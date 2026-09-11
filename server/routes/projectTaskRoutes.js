const express = require('express');
const { getTasksForProject, createTask } = require('../controllers/taskController');
const { checkProjectAccess } = require('../middleware/checkProjectAccess');

// mergeParams so :id from parent router (project id) is available as req.params.id
const router = express.Router({ mergeParams: true });

router.use(checkProjectAccess);

router.route('/').get(getTasksForProject).post(createTask);

module.exports = router;
