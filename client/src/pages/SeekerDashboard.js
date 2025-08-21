import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllJobs, getSeekerApplications } from '../utils/api';

const SeekerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsResponse, applicationsResponse] = await Promise.all([
          getAllJobs(),
          getSeekerApplications()
        ]);
        
        console.log('Jobs data:', jobsResponse.data);
        console.log('Applications data:', applicationsResponse.data);
        
        setJobs(jobsResponse.data);
        setApplications(applicationsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await getAllJobs({ 
        title: searchTerm 
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Error searching jobs:', error);
    }
  };

  // Filter out jobs that the seeker has already applied to
  const appliedJobIds = applications.map(app => app.job._id);
  const availableJobs = jobs.filter(job => !appliedJobIds.includes(job._id));

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Job Seeker Dashboard</h1>
      
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'available' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('available')}
          >
            Available Jobs
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'applied' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('applied')}
          >
            My Applications
          </button>
        </div>
      </div>
      
      {activeTab === 'available' && (
        <>
          <form onSubmit={handleSearch} className="mb-6 flex gap-2">
            <input
              type="text"
              placeholder="Search for jobs..."
              className="form-input flex-grow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableJobs.length > 0 ? (
              availableJobs.map((job) => (
                <div key={job._id} className="card hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-blue-600">{job.title}</h3>
                  <p className="text-gray-600 mt-1">{job.company}</p>
                  <p className="text-gray-500 text-sm mt-1">{job.location}</p>
                  <p className="mt-2 text-gray-700 line-clamp-2">{job.description}</p>
                  <div className="mt-4">
                    <Link to={`/jobs/${job._id}`} className="btn btn-primary">View Details</Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">No available jobs found. Try a different search term.</p>
              </div>
            )}
          </div>
        </>
      )}
      
      {activeTab === 'applied' && (
        <div className="grid grid-cols-1 gap-4">
          {applications.length > 0 ? (
            applications.map((application) => (
              <div key={application._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-600">{application.job.title}</h3>
                    <p className="text-gray-600 mt-1">{application.job.company}</p>
                    <p className="text-gray-500 text-sm mt-1">Applied on: {new Date(application.createdAt).toLocaleDateString()}</p>
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
                
                <div className="mt-4">
                  <Link 
                    to={`/applications/${application._id}`} 
                    className="btn btn-secondary"
                  >
                    View Application
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">You haven't applied to any jobs yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SeekerDashboard; 