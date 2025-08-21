import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById, applyForJob } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await getJobById(id);
        setJob(response.data);
      } catch (error) {
        setError('Failed to load job details. Please try again.');
        console.error('Error fetching job:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'seeker') {
      setError('Only job seekers can apply for jobs.');
      return;
    }
    
    setApplying(true);
    setError('');
    
    try {
      console.log('Submitting application:', { jobId: id, coverLetter });
      await applyForJob(id, coverLetter);
      setApplicationSuccess(true);
    } catch (err) {
      console.error('Application error:', err);
      setError(err.response?.data?.message || 'Failed to apply for this job. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!job) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error || 'Job not found'}</p>
        <button onClick={() => navigate(-1)} className="btn btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline flex items-center">
        ← Back
      </button>
      
      <div className="card mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">{job.title}</h1>
            <p className="text-gray-600 mt-1">{job.company}</p>
            <p className="text-gray-500 text-sm mt-1">{job.location}</p>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {job.status === 'open' ? 'Open' : 'Occupied'}
          </span>
        </div>
        
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Salary</h2>
          <p className="text-gray-700">${job.salary.toLocaleString()} per year</p>
        </div>
        
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
        </div>
        
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Requirements</h2>
          <ul className="list-disc pl-5 text-gray-700">
            {job.requirements.map((req, index) => (
              <li key={index} className="mb-1">{req}</li>
            ))}
          </ul>
        </div>
        
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Category</h2>
          <p className="text-gray-700">{job.category}</p>
        </div>
        
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Posted By</h2>
          <p className="text-gray-700">{job.recruiter?.name || 'Unknown'}</p>
        </div>
      </div>
      
      {user && user.role === 'seeker' && job.status === 'open' && !applicationSuccess && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Apply for this Job</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleApply}>
            <div className="mb-4">
              <label htmlFor="coverLetter" className="form-label">Cover Letter</label>
              <textarea
                id="coverLetter"
                className="form-input h-32"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Explain why you're a good fit for this position..."
                required
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={applying}
            >
              {applying ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </form>
        </div>
      )}
      
      {applicationSuccess && (
        <div className="card bg-green-50">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-green-700 mb-2">Application Submitted!</h2>
            <p className="text-green-600 mb-4">Your application has been successfully submitted.</p>
            <button 
              onClick={() => navigate('/seeker/dashboard')} 
              className="btn btn-primary"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
      
      {user && user.role === 'recruiter' && job.recruiter?._id === user._id && (
        <div className="card bg-blue-50">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">This is your job posting</h2>
            <p className="text-blue-600 mb-4">You can view applications from your dashboard.</p>
            <button 
              onClick={() => navigate('/recruiter/dashboard')} 
              className="btn btn-primary"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails; 