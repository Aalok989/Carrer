import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiMapPin,
  FiClock,
  FiBookmark,
  FiShare2,
  FiCheck,
  FiBriefcase,
  FiDollarSign,
  FiUsers
} from "react-icons/fi";
import logo from "../assets/Etribe-logo.jpg";
import api from "../api/axiosConfig";
import { getAuthHeaders } from "../utils/apiHeaders";
import { toast } from "react-toastify";

export default function JobDescription() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Load job details and similar jobs
    loadJobDetails();
    loadSimilarJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadJobDetails = async () => {
    setLoading(true);
    try {
      // Fetch all jobs and find the one with matching ID
      const response = await api.post('/JobPortal/list_jobs', {}, {
        headers: getAuthHeaders()
      });
      
      // The API wraps the array in an object: { status: true, data: [...] }
      const apiJobs = Array.isArray(response.data?.data) ? response.data.data : [];
      const jobData = apiJobs.find(job => job.id === id || job.id === parseInt(id));
      
      if (jobData) {
        // Map API response to frontend structure
        const mappedJob = {
          id: jobData.id,
          title: jobData.job_type || "Not specified",
          company: jobData.company_name || "Company",
          location: jobData.location || "Location not specified", // Keep for backend to add later
          postedTime: jobData.dtime ? formatPostedTime(jobData.dtime) : "Recently posted",
          jobType: jobData.job_type_category || "Full Time", // Keep for backend to add later
          experience: jobData.experience || "Not specified", // Keep for backend to add later
          salary: jobData.salary || "Not specified", // Keep for backend to add later
          description: jobData.job_description || "No description available",
          fullDescription: jobData.full_description || jobData.job_description || "No detailed description available",
          requirements: jobData.requirements || [
            "Requirements will be updated soon"
          ],
          tags: jobData.tags || ["Full Time"], // Keep for backend to add later
          logo: jobData.company_logo ? `https://api.etribes.mittalservices.com/${jobData.company_logo}` : null,
          companyDescription: jobData.company_description || `${jobData.company_name || 'This company'} is looking for talented individuals to join their team.`
        };
        
        setJob(mappedJob);
      } else {
        toast.error("Job not found");
        navigate("/");
      }
    } catch (err) {
      console.error("Error loading job details:", err);
      toast.error("Failed to load job details");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to format posted time
  const formatPostedTime = (dateString) => {
    try {
      const jobDate = new Date(dateString);
      const now = new Date();
      const diffInMs = now - jobDate;
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      const diffInWeeks = Math.floor(diffInDays / 7);
      const diffInMonths = Math.floor(diffInDays / 30);
      
      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    } catch {
      return "Recently posted";
    }
  };

  const loadSimilarJobs = async () => {
    try {
      // Fetch all jobs and show other jobs as similar jobs
      const response = await api.post('/JobPortal/list_jobs', {}, {
        headers: getAuthHeaders()
      });
      
      // The API wraps the array in an object: { status: true, data: [...] }
      const apiJobs = Array.isArray(response.data?.data) ? response.data.data : [];
      // Filter out current job and map to similar jobs structure
      const similarJobsList = apiJobs
        .filter(job => job.id !== id && job.id !== parseInt(id))
        .slice(0, 4) // Show only first 4 similar jobs
        .map(job => ({
          id: job.id,
          title: job.job_type || "Not specified",
          company: job.company_name || "Company",
          location: job.location || "Location not specified",
          postedTime: job.dtime ? formatPostedTime(job.dtime) : "Recently posted",
          tags: job.tags || ["Full Time"],
          logo: job.company_logo ? `https://api.etribes.mittalservices.com/${job.company_logo}` : null
        }));
      
      setSimilarJobs(similarJobsList);
    } catch (err) {
      console.error("Failed to load similar jobs:", err);
      setSimilarJobs([]);
    }
  };

  const handleSaveJob = () => {
    if (!isLoggedIn) {
      toast.info("Please log in to save jobs");
      navigate("/login");
      return;
    }
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Job removed from saved" : "Job saved successfully");
  };

  const handleApply = async () => {
    if (!isLoggedIn) {
      toast.info("Please log in to apply for jobs");
      navigate("/login");
      return;
    }
    
    try {
      // Show loading toast
      const loadingToast = toast.info("Submitting your application...", {
        autoClose: false
      });
      
      const response = await api.post(`/JobApplicant/submit_application/${id}`, {}, {
        headers: getAuthHeaders()
      });
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (response.data?.status === true || response.data?.success === true) {
        toast.success(response.data?.message || "Application submitted successfully!");
      } else {
        toast.warning(response.data?.message || "Application submitted");
      }
    } catch (error) {
      console.error("Error applying for job:", error);
      const errorMessage = error.response?.data?.message || "Failed to submit application. Please try again.";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Job not found</p>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Go back to job list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 w-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 w-full fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-3 sm:px-4 py-1 sm:py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <FiArrowLeft size={20} className="text-gray-600" />
              </button>
              <img src={logo} alt="ETRIBE" className="h-10 sm:h-14 md:h-16 w-auto object-contain" />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleSaveJob}
                className={`p-2 rounded-lg transition-colors ${
                  isSaved
                    ? "text-orange-500 bg-orange-50"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                aria-label={isSaved ? "Unsave job" : "Save job"}
              >
                <FiBookmark size={18} fill={isSaved ? "currentColor" : "none"} />
              </button>
              <button
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Share job"
              >
                <FiShare2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-3 sm:px-4 pt-4 sm:pt-6 mt-[60px] sm:mt-[70px] flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg text-gray-700 font-medium">{job.company}</span>
                    <FiCheck className="text-orange-500" size={18} />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <FiMapPin size={16} />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiClock size={16} />
                      <span>{job.postedTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiBriefcase size={16} />
                      <span>{job.jobType}</span>
                    </div>
                  </div>
                </div>
                {job.logo && (
                  <img
                    src={job.logo}
                    alt={job.company}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg bg-gray-50 p-2"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {job.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button
                onClick={handleApply}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Apply Now
              </button>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4 whitespace-pre-line">{job.fullDescription || job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements?.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Info */}
            {job.companyDescription && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About {job.company}</h2>
                <p className="text-gray-700">{job.companyDescription}</p>
              </div>
            )}
          </div>

          {/* Sidebar - Similar Jobs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Jobs</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {similarJobs.length > 0 ? (
                  similarJobs.map((similarJob) => (
                      <div
                        key={similarJob.id}
                        onClick={() => navigate(`/job/${similarJob.id}`)}
                        className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">
                              {similarJob.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2">{similarJob.company}</p>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                              <FiMapPin size={12} />
                              <span>{similarJob.location}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {similarJob.tags.slice(0, 2).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-gray-400">{similarJob.postedTime}</p>
                          </div>
                          {similarJob.logo && (
                            <img
                              src={similarJob.logo}
                              alt={similarJob.company}
                              className="w-10 h-10 object-contain rounded bg-gray-50 p-1 flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                      </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No similar jobs found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



// The End


