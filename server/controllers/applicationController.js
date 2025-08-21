const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private/Seeker
exports.applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    console.log('Received application request:', { jobId, coverLetter, userId: req.user._id });
    
    // Check if job exists
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if job is still open
    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }
    
    // Check if user has already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      seeker: req.user._id
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    
    // Create application
    const application = await Application.create({
      job: jobId,
      seeker: req.user._id,
      coverLetter,
      status: 'pending'
    });

    console.log('Application created:', application);
    
    res.status(201).json(application);
  } catch (error) {
    console.error('Error in applyForJob:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get applications for a job
// @route   GET /api/applications/job/:jobId
// @access  Private/Recruiter
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Check if job exists and belongs to the recruiter
    const job = await Job.findOne({
      _id: jobId,
      recruiter: req.user._id
    });
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found or not authorized' });
    }
    
    const applications = await Application.find({ job: jobId })
      .populate('seeker', 'name email skills experience');
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get applications for a seeker
// @route   GET /api/applications/seeker
// @access  Private/Seeker
exports.getSeekerApplications = async (req, res) => {
  try {
    console.log('Getting applications for seeker:', req.user._id);
    
    // Check if user exists in the request
    if (!req.user || !req.user._id) {
      console.error('No user found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Find applications with detailed logging
    console.log('Searching for applications with seeker ID:', req.user._id);
    const applications = await Application.find({ 
      seeker: req.user._id 
    }).populate({
      path: 'job',
      select: 'title company location status'
    });
    
    console.log('Found applications:', applications.length);
    
    // Return empty array instead of error if no applications found
    res.json(applications || []);
  } catch (error) {
    console.error('Error in getSeekerApplications:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private/Recruiter
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, interviewDetails } = req.body;
    console.log('Received update request:', { status, interviewDetails }); // Debug log

    // Validate the status
    const validStatuses = ['pending', 'interview_scheduled', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      console.log('Invalid status received:', status); // Debug log
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('job');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Update the application
    application.status = status;
    
    // Only update interview details if they are provided
    if (interviewDetails) {
      application.interviewDetails = {
        date: new Date(interviewDetails.date),
        time: interviewDetails.time,
        place: interviewDetails.place,
        message: interviewDetails.message || ''
      };
    }

    // Save the updated application
    const updatedApplication = await application.save();
    console.log('Updated application:', updatedApplication); // Debug log

    res.json(updatedApplication);
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get application by ID
// @route   GET /api/applications/:applicationId
// @access  Private
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate('job')
      .populate('seeker', 'name email skills experience');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user has permission to view this application
    const user = await User.findById(req.user._id);
    if (
      user.role === 'seeker' && application.seeker.toString() !== req.user._id.toString() ||
      user.role === 'recruiter' && application.job.recruiter.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 