const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  getRecruiterJobs,
  updateJob,
  deleteJob
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getJobs)
  .post(protect, authorize('recruiter'), createJob);

router.get('/recruiter', protect, authorize('recruiter'), getRecruiterJobs);

router.route('/:id')
  .get(getJobById)
  .put(protect, authorize('recruiter'), updateJob)
  .delete(protect, authorize('recruiter'), deleteJob);

module.exports = router; 