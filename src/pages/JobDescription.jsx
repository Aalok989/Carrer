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
// import api from "../api/axiosConfig";
// import { getAuthHeaders } from "../utils/apiHeaders";
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
      // Replace with actual API call
      // const response = await api.get(`/Job_post/${id}`, {
      //   headers: getAuthHeaders()
      // });
      // setJob(response.data?.data || response.data);
      
      // Mock data for now
      const mockJob = {
        id: id || 1,
        title: "Web Developer",
        company: "Infosys",
        location: "Delhi, India",
        postedTime: "19 hours ago",
        jobType: "Full Time",
        experience: "0-1 years",
        salary: "₹3,00,000 - ₹6,00,000",
        description: `A bachelor's degree in Computer Science is required. Strong communication skills, team spirit, client call handling. A Web Developer is a professional who is responsible for the development and maintenance of web applications. They work with various technologies including HTML, CSS, JavaScript, and backend frameworks to create dynamic and interactive websites.`,
        fullDescription: `We are looking for a skilled Web Developer to join our team. The ideal candidate will be responsible for developing and maintaining web applications, working with cross-functional teams, and ensuring high-quality code delivery.

**Key Responsibilities:**
- Develop and maintain web applications using modern technologies
- Collaborate with designers and other developers to implement features
- Write clean, maintainable, and efficient code
- Debug and troubleshoot issues
- Participate in code reviews
- Stay updated with the latest web development trends

**Requirements:**
- Bachelor's degree in Computer Science or related field
- Strong knowledge of HTML, CSS, and JavaScript
- Experience with React, Vue, or Angular
- Understanding of RESTful APIs
- Good problem-solving skills
- Strong communication skills

**Benefits:**
- Competitive salary package
- Health insurance
- Flexible working hours
- Professional development opportunities
- Friendly work environment`,
        requirements: [
          "Bachelor's degree in Computer Science",
          "Strong communication skills",
          "Team spirit and collaboration",
          "Client call handling experience",
          "Knowledge of modern web technologies"
        ],
        tags: ["Contract", "Remote", "Full Time", "0-1 years experience"],
        logo: "https://logo.clearbit.com/infosys.com",
        companyDescription: "Infosys is a global leader in next-generation digital services and consulting."
      };
      
      setJob(mockJob);
    } catch (err) {
      toast.error("Failed to load job details");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadSimilarJobs = async () => {
    try {
      // Replace with actual API call
      // const response = await api.get(`/Job_post/similar/${id}`, {
      //   headers: getAuthHeaders()
      // });
      // setSimilarJobs(response.data?.data || []);
      
      // Mock similar jobs data
      const mockSimilarJobs = [
        {
          id: 2,
          title: "Frontend Developer",
          company: "TCS",
          location: "Mumbai",
          postedTime: "2 days ago",
          tags: ["Full Time", "Remote"],
          logo: "https://logo.clearbit.com/tcs.com"
        },
        {
          id: 3,
          title: "React Developer",
          company: "Wipro",
          location: "Bangalore",
          postedTime: "3 days ago",
          tags: ["Contract", "On-site"],
          logo: "https://logo.clearbit.com/wipro.com"
        },
        {
          id: 4,
          title: "Full Stack Developer",
          company: "HCL",
          location: "Chennai",
          postedTime: "1 week ago",
          tags: ["Full Time", "Hybrid"],
          logo: "https://logo.clearbit.com/hcl.com"
        },
        {
          id: 5,
          title: "JavaScript Developer",
          company: "Cognizant",
          location: "Pune",
          postedTime: "5 days ago",
          tags: ["Full Time", "Remote"],
          logo: "https://logo.clearbit.com/cognizant.com"
        }
      ];
      
      setSimilarJobs(mockSimilarJobs);
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

  const handleApply = () => {
    if (!isLoggedIn) {
      toast.info("Please log in to apply for jobs");
      navigate("/login");
      return;
    }
    // Implement apply logic
    toast.success("Application submitted successfully!");
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

