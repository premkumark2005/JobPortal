import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllJobs } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getAllJobs();
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await getAllJobs({ title: searchTerm });
      setJobs(response.data);
    } catch (error) {
      console.error('Error searching jobs:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold text-center mb-6">Find Your Dream Job</h1>
        
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search for jobs..."
            className="form-input flex-grow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
        
        {user ? (
          <div className="mt-4 text-center">
            {user.role === 'seeker' ? (
              <Link to="/seeker/dashboard" className="text-blue-600 hover:underline">
                Go to your dashboard
              </Link>
            ) : (
              <Link to="/recruiter/dashboard" className="text-blue-600 hover:underline">
                Go to your dashboard
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-6 text-center">
            <p className="mb-2">Join our platform to apply for jobs or post job listings</p>
            <div className="flex justify-center gap-4">
              <Link to="/register" className="btn btn-primary">Register</Link>
              <Link to="/login" className="btn btn-secondary">Login</Link>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => (
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
            <p className="text-gray-500">No jobs found. Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 