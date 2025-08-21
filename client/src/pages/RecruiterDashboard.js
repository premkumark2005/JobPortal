import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecruiterJobs } from '../utils/api';

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getRecruiterJobs();
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
        <Link to="/post-job" className="btn btn-primary">Post a New Job</Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Job Listings</h2>
        <p className="text-gray-600">You have posted {jobs.length} job{jobs.length !== 1 ? 's' : ''}.</p>
      </div>
      
      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <div key={job._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-blue-600">{job.title}</h3>
                  <p className="text-gray-600 mt-1">{job.company}</p>
                  <p className="text-gray-500 text-sm mt-1">{job.location}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {job.status === 'open' ? 'Open' : 'Occupied'}
                </span>
              </div>
              
              <p className="mt-2 text-gray-700 line-clamp-2">{job.description}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/jobs/${job._id}`} className="btn btn-secondary">View Details</Link>
                <Link to={`/applications/job/${job._id}`} className="btn btn-primary">View Applications</Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 mb-4">You haven't posted any jobs yet.</p>
          <Link to="/post-job" className="btn btn-primary">Post Your First Job</Link>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard; 