import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../utils/api';

const PostJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    salary: '',
    location: '',
    category: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Format requirements as array
    const jobData = {
      ...formData,
      requirements: formData.requirements.split('\n').filter(req => req.trim() !== ''),
      salary: Number(formData.salary)
    };

    try {
      await createJob(jobData);
      navigate('/recruiter/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Post a New Job</h1>
      
      <div className="card">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="form-label">Job Title</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="form-label">Job Description</label>
            <textarea
              id="description"
              name="description"
              className="form-input h-32"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label htmlFor="requirements" className="form-label">
              Requirements (one per line)
            </label>
            <textarea
              id="requirements"
              name="requirements"
              className="form-input h-32"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="Bachelor's degree in Computer Science
3+ years of experience in web development
Proficiency in JavaScript"
              required
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label htmlFor="salary" className="form-label">Annual Salary (USD)</label>
            <input
              type="number"
              id="salary"
              name="salary"
              className="form-input"
              value={formData.salary}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="location" className="form-label">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              className="form-input"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. New York, NY or Remote"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="category" className="form-label">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              className="form-input"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. Software Development, Marketing, Finance"
              required
            />
          </div>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/recruiter/dashboard')}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob; 