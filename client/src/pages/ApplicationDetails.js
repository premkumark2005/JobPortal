import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobApplications, getSeekerApplications, updateApplicationStatus } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ApplicationDetails = () => {
  const { jobId, applicationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState({
    date: '',
    time: '',
    place: '',
    message: ''
  });

  // Define fetchApplications function outside useEffect so it can be reused
  const fetchApplications = async () => {
    try {
      let response;
      if (user.role === 'recruiter' && jobId) {
        // Recruiter viewing all applications for a job
        response = await getJobApplications(jobId);
        setApplications(response.data);
      } else if (user.role === 'seeker') {
        // Seeker viewing their applications
        response = await getSeekerApplications();
        // Filter to show only the specific application
        const application = response.data.find(app => app._id === applicationId);
        setApplications(application ? [application] : []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to load application details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId, applicationId, user.role]);

  const handleStatusUpdate = async (applicationId, status) => {
    setUpdating(true);
    try {
      await updateApplicationStatus(applicationId, { status });
      
      // Update the local state
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status } : app
      ));
      
    } catch (error) {
      setError('Failed to update application status. Please try again.');
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAcceptClick = (applicationId) => {
    setShowInterviewForm(true);
  };

  const handleScheduleInterview = async (applicationId) => {
    try {
      // Validate form fields
      if (!interviewDetails.date || !interviewDetails.time || !interviewDetails.place) {
        setError('Please fill in all required fields (date, time, and place)');
        return;
      }

      const updateData = {
        status: 'interview_scheduled',  // This must match exactly with the enum in the model
        interviewDetails: {
          date: new Date(interviewDetails.date).toISOString(),
          time: interviewDetails.time,
          place: interviewDetails.place,
          message: interviewDetails.message || ''
        }
      };

      console.log('Sending update data:', updateData);

      const response = await updateApplicationStatus(applicationId, updateData);
      console.log('Server response:', response.data);

      setShowInterviewForm(false);
      setError('');
      await fetchApplications();
    } catch (error) {
      console.error('Error scheduling interview:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to schedule interview. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="btn btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  if (!user || (user.role !== 'recruiter' && applications.length === 0)) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">You don't have permission to view these applications.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-4 text-blue-600 hover:underline flex items-center"
      >
        ← Back
      </button>
      
      <h1 className="text-2xl font-bold mb-6">Applications</h1>
      
      {applications.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500">No applications received yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application._id} className="bg-white rounded-lg shadow p-6 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">
                    {application.seeker.name}
                  </h2>
                  <p className="text-gray-600">{application.seeker.email}</p>
                  <p className="text-sm text-gray-500">
                    Applied: {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  application.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : application.status === 'accepted'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>
              
              {application.seeker.skills && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700">Skills</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {application.seeker.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700">Cover Letter</h3>
                <p className="mt-1 text-gray-600">{application.coverLetter}</p>
              </div>
              
              {application.status === 'pending' && user.role === 'recruiter' && (
                <div className="mt-6 flex gap-4">
                  <button 
                    onClick={() => handleAcceptClick(application._id)}
                    className="btn btn-success flex-1"
                  >
                    Schedule Interview
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(application._id, 'rejected')}
                    className="btn btn-danger flex-1"
                  >
                    Reject
                  </button>
                </div>
              )}

              {/* Interview Scheduling Form */}
              {showInterviewForm && application.status === 'pending' && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4">Schedule Interview</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <input
                        type="date"
                        className="mt-1 form-input"
                        value={interviewDetails.date}
                        onChange={(e) => setInterviewDetails({
                          ...interviewDetails,
                          date: e.target.value
                        })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Time</label>
                      <input
                        type="time"
                        className="mt-1 form-input"
                        value={interviewDetails.time}
                        onChange={(e) => setInterviewDetails({
                          ...interviewDetails,
                          time: e.target.value
                        })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Place</label>
                      <input
                        type="text"
                        className="mt-1 form-input"
                        value={interviewDetails.place}
                        onChange={(e) => setInterviewDetails({
                          ...interviewDetails,
                          place: e.target.value
                        })}
                        placeholder="Interview location or meeting link"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Message</label>
                      <textarea
                        className="mt-1 form-input"
                        value={interviewDetails.message}
                        onChange={(e) => setInterviewDetails({
                          ...interviewDetails,
                          message: e.target.value
                        })}
                        placeholder="Additional information for the candidate"
                        rows="3"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleScheduleInterview(application._id)}
                        className="btn btn-primary flex-1"
                      >
                        Send Interview Invitation
                      </button>
                      <button
                        onClick={() => setShowInterviewForm(false)}
                        className="btn btn-secondary flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Display Interview Details for Seeker */}
              {application.status === 'interview_scheduled' && (
                <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    Interview Scheduled!
                  </h3>
                  <div className="space-y-2">
                    <p><strong>Date:</strong> {new Date(application.interviewDetails.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {application.interviewDetails.time}</p>
                    <p><strong>Place:</strong> {application.interviewDetails.place}</p>
                    {application.interviewDetails.message && (
                      <div>
                        <strong>Message:</strong>
                        <p className="mt-1 text-gray-700">{application.interviewDetails.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationDetails; 