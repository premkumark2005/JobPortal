const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  applyForJob,
  getJobApplications,
  getSeekerApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');

router.post('/', protect, authorize('seeker'), applyForJob);
router.get('/job/:jobId', protect, authorize('recruiter'), getJobApplications);
router.get('/seeker', protect, authorize('seeker'), getSeekerApplications);
router.put('/:id', protect, updateApplicationStatus);

module.exports = router; 