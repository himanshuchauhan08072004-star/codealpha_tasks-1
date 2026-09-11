const express = require('express');
const { getProjectActivity } = require('../controllers/activityController');
const { checkProjectAccess } = require('../middleware/checkProjectAccess');

const router = express.Router({ mergeParams: true });

router.use(checkProjectAccess);
router.get('/', getProjectActivity);

module.exports = router;
