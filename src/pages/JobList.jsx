import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiMapPin,
  FiChevronDown,
  FiGrid,
  FiList,
  FiBookmark,
  FiCheck,
  FiFilter,
  FiX,
  FiUser
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Etribe-logo.jpg";
import api from "../api/axiosConfig";
import { getAuthHeaders } from "../utils/apiHeaders";
import { toast } from "react-toastify";

export default function JobList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"
  const [sortBy, setSortBy] = useState("newest");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userData, setUserData] = useState(null);

  // Filter states
  const [expandedFilters, setExpandedFilters] = useState({
    experience: true,
    jobTitle: true,
    location: true,
    employmentType: true
  });

  const [filters, setFilters] = useState({
    experience: ["any"],
    jobTitle: [],
    location: [],
    employmentType: []
  });

  // Search queries for filter sections
  const [filterSearchQueries, setFilterSearchQueries] = useState({
    jobTitle: "",

    location: "",
    employmentType: ""
  });

  // Job data
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter options state
  const [filterOptions, setFilterOptions] = useState({
    experience: [],
    jobTitle: [],
    location: [],
    employmentType: []
  });

  // Store all jobs for filtering
  const [allJobs, setAllJobs] = useState([]);

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

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await api.post('/JobPortal/list_jobs', {}, {
        headers: getAuthHeaders()
      });

      const apiJobs = Array.isArray(response.data?.data) ? response.data.data : [];

      const mappedJobs = apiJobs.map(job => ({
        id: job.id,
        title: job.job_title || job.job_type || "Not specified",
        company: job.company_name || "Company",
        description: job.job_description || "No description available",
        tags: [job.employment_type, job.work_model].filter(Boolean), // Create tags from employment info
        location: job.location || "Location not specified",
        logo: job.company_logo ? `https://api.etribes.mittalservices.com/${job.company_logo}` : null,
        postedTime: job.dtime ? formatPostedTime(job.dtime) : "Recently posted",
        // Raw fields for filtering
        experience_level: job.experience_level || "Not specified",
        employment_type: job.employment_type || "Not specified",
        job_title_raw: job.job_title || "Not specified"
      }));

      setAllJobs(mappedJobs);
      setJobs(mappedJobs); // Initially show all jobs
    } catch (error) {
      console.error("Error loading jobs:", error);
      toast.error("Failed to load jobs");
      setAllJobs([]);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate filter options when jobs are loaded
  useEffect(() => {
    if (allJobs.length === 0) return;

    const generateOptions = (key) => {
      const counts = allJobs.reduce((acc, job) => {
        const value = job[key];
        if (value) {
          acc[value] = (acc[value] || 0) + 1;
        }
        return acc;
      }, {});

      return Object.entries(counts).map(([label, count]) => ({
        label,
        value: label,
        count
      })).sort((a, b) => b.count - a.count);
    };

    // Experience
    const expOptions = generateOptions('experience_level');
    // Add "Any" option to experience
    expOptions.unshift({ label: "Any work experience", value: "any", count: allJobs.length });

    // Job Title (use title or job_title_raw)
    const titleOptions = generateOptions('title');

    // Location
    const locOptions = generateOptions('location');

    // Employment Type
    const typeOptions = generateOptions('employment_type');

    setFilterOptions({
      experience: expOptions,
      jobTitle: titleOptions,
      location: locOptions,
      employmentType: typeOptions
    });
  }, [allJobs]);

  // Apply filters
  useEffect(() => {
    let result = [...allJobs];

    // Search Query (Global)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query)
      );
    }

    // Location Query (Global)
    if (locationQuery) {
      const query = locationQuery.toLowerCase();
      result = result.filter(job =>
        job.location.toLowerCase().includes(query)
      );
    }

    // Filter: Experience
    if (filters.experience.length > 0 && !filters.experience.includes("any")) {
      result = result.filter(job => filters.experience.includes(job.experience_level));
    }

    // Filter: Job Title
    if (filters.jobTitle.length > 0) {
      result = result.filter(job => filters.jobTitle.includes(job.title));
    }

    // Filter: Location
    if (filters.location.length > 0) {
      result = result.filter(job => filters.location.includes(job.location));
    }

    // Filter: Employment Type
    if (filters.employmentType.length > 0) {
      result = result.filter(job => filters.employmentType.includes(job.employment_type));
    }

    setJobs(result);
  }, [filters, searchQuery, locationQuery, allJobs]);

  useEffect(() => {
    // Load jobs from API
    loadJobs();
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const uid = localStorage.getItem('uid');
    const userName = localStorage.getItem('userName') || localStorage.getItem('name');
    setIsLoggedIn(!!token);

    // Get user data if logged in
    if (token && uid) {
      setUserData({
        id: uid,
        name: userName || 'User',
      });
    }

    // Listen for login events
    const handleLogin = () => {
      const newToken = localStorage.getItem('token');
      const newUid = localStorage.getItem('uid');
      const newUserName = localStorage.getItem('userName') || localStorage.getItem('name');
      setIsLoggedIn(!!newToken);
      if (newToken && newUid) {
        setUserData({
          id: newUid,
          name: newUserName || 'User',
        });
      }
    };

    window.addEventListener('login', handleLogin);

    return () => {
      window.removeEventListener('login', handleLogin);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('uid');
    setIsLoggedIn(false);
    setUserData(null);
    setShowUserMenu(false);
    navigate('/');
  };

  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (category === "experience" && value === "any") {
        newFilters[category] = ["any"];
      } else {
        const current = newFilters[category] || [];
        if (current.includes(value)) {
          newFilters[category] = current.filter(v => v !== value);
          if (category === "experience" && newFilters[category].length === 0) {
            newFilters[category] = ["any"];
          }
        } else {
          if (category === "experience" && current.includes("any")) {
            newFilters[category] = [value];
          } else {
            newFilters[category] = [...current, value];
          }
        }
      }
      return newFilters;
    });
  };

  const toggleFilterSection = (section) => {
    setExpandedFilters(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const resetFilters = () => {
    setFilters({
      experience: ["any"],
      jobTitle: [],
      country: [], // Legacy clean up if needed
      location: [],
      employmentType: []
    });
    setSearchQuery("");
    setLocationQuery("");
    setFilterSearchQueries({
      jobTitle: "",

      location: "",
      employmentType: ""
    });
  };

  // Filter options based on search queries
  const getFilteredJobTitles = () => {
    if (!filterSearchQueries.jobTitle) return filterOptions.jobTitle;
    const query = filterSearchQueries.jobTitle.toLowerCase();
    return filterOptions.jobTitle.filter(option =>
      option.label.toLowerCase().includes(query)
    );
  };

  const getFilteredLocations = () => {
    if (!filterSearchQueries.location) return filterOptions.location;
    const query = filterSearchQueries.location.toLowerCase();
    return filterOptions.location.filter(option =>
      option.label.toLowerCase().includes(query)
    );
  };

  const getFilteredEmploymentTypes = () => {
    if (!filterSearchQueries.employmentType) return filterOptions.employmentType;
    const query = filterSearchQueries.employmentType.toLowerCase();
    return filterOptions.employmentType.filter(option =>
      option.label.toLowerCase().includes(query)
    );
  };

  const handleSaveJob = (jobId) => {
    setSavedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const handleFindJob = () => {
    // Implement search logic
    loadJobs();
  };

  return (
    <div className="h-screen bg-gray-50 w-full flex flex-col overflow-hidden">
      {/* Header Section - Fixed */}
      <header className="bg-white border-b border-gray-200 w-full fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-3 sm:px-4 py-1 sm:py-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="ETRIBE" className="h-10 sm:h-14 md:h-16 w-auto object-contain" />
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {!isLoggedIn ? (
                <button
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:text-blue-700 font-medium bg-white border-2 border-blue-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base flex-1 sm:flex-initial flex items-center gap-2"
                >
                  <FiUser size={18} />
                  <span>Log in</span>
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    aria-label="User menu"
                  >
                    <FiUser size={20} />
                  </button>
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="p-4 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">
                            {userData?.name || 'User Account'}
                          </p>
                          {userData && userData.id && (
                            <p className="text-xs text-gray-500 mt-1">ID: {userData.id}</p>
                          )}
                        </div>
                        <div className="p-2">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar Section - Fixed */}
      <div className="py-4 sm:py-6 w-full flex items-center justify-center fixed top-[60px] sm:top-[70px] left-0 right-0 z-40" style={{ backgroundColor: '#6258BA' }}>
        <div className="w-full max-w-6xl px-3 sm:px-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by: Job title, Position, Company ..."
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 relative">
              <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="City, state or zip code"
                className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm sm:text-base"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <button
              onClick={handleFindJob}
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base w-full sm:w-auto"
            >
              Find Job
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="w-full px-3 sm:px-4 pt-4 sm:pt-6 mt-[140px] sm:mt-[160px] flex-1 overflow-hidden flex flex-col">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FiFilter size={18} />
            <span>Filters</span>
            <FiChevronDown
              className={`transform transition-transform ${showMobileFilters ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Mobile Filter Overlay */}
        {showMobileFilters && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMobileFilters(false)}
          />
        )}

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 w-full h-full">
          {/* Left Column - Filters - Fixed */}
          <div className={`lg:w-1/4 flex-shrink-0 ${showMobileFilters ? 'fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-y-auto bg-white shadow-xl lg:relative lg:inset-auto lg:z-auto lg:w-auto lg:max-w-none lg:shadow-sm lg:overflow-visible lg:h-full' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:h-full lg:flex lg:flex-col">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Filter by</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetFilters}
                    className="text-teal-600 hover:text-teal-700 text-xs sm:text-sm font-medium"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 lg:overflow-y-auto lg:min-h-0">

                {/* Experience Level Filter */}
                <div className="mb-4 sm:mb-6">
                  <button
                    onClick={() => toggleFilterSection("experience")}
                    className="w-full flex items-center justify-between text-gray-700 font-medium mb-2 sm:mb-3 text-sm sm:text-base"
                  >
                    <span>Experience level:</span>
                    <FiChevronDown
                      className={`transform transition-transform ${expandedFilters.experience ? 'rotate-180' : ''}`}
                      size={18}
                    />
                  </button>
                  {expandedFilters.experience && (
                    <div className="space-y-2">
                      {filterOptions.experience.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.experience.includes(option.value)}
                            onChange={() => toggleFilter("experience", option.value)}
                            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                          />
                          <span className="text-sm text-gray-700">
                            {option.label} ({option.count})
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Job Title Filter */}
                <div className="mb-4 sm:mb-6">
                  <button
                    onClick={() => toggleFilterSection("jobTitle")}
                    className="w-full flex items-center justify-between text-gray-700 font-medium mb-2 sm:mb-3 text-sm sm:text-base"
                  >
                    <span>Job title:</span>
                    <FiChevronDown
                      className={`transform transition-transform ${expandedFilters.jobTitle ? 'rotate-180' : ''}`}
                      size={18}
                    />
                  </button>
                  {expandedFilters.jobTitle && (
                    <div className="space-y-3">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          placeholder="Search title"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                          value={filterSearchQueries.jobTitle}
                          onChange={(e) => setFilterSearchQueries(prev => ({ ...prev, jobTitle: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        {getFilteredJobTitles().length > 0 ? (
                          getFilteredJobTitles().map((option) => (
                            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.jobTitle.includes(option.value)}
                                onChange={() => toggleFilter("jobTitle", option.value)}
                                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                              />
                              <span className="text-sm text-gray-700">
                                {option.label} ({option.count})
                              </span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 py-2">No job titles found</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Location Filter */}
                <div className="mb-4 sm:mb-6">
                  <button
                    onClick={() => toggleFilterSection("location")}
                    className="w-full flex items-center justify-between text-gray-700 font-medium mb-2 sm:mb-3 text-sm sm:text-base"
                  >
                    <span>Location:</span>
                    <FiChevronDown
                      className={`transform transition-transform ${expandedFilters.location ? 'rotate-180' : ''}`}
                      size={18}
                    />
                  </button>
                  {expandedFilters.location && (
                    <div className="space-y-3">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          placeholder="Search location"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                          value={filterSearchQueries.location}
                          onChange={(e) => setFilterSearchQueries(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        {getFilteredLocations().length > 0 ? (
                          getFilteredLocations().map((option) => (
                            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.location.includes(option.value)}
                                onChange={() => toggleFilter("location", option.value)}
                                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                              />
                              <span className="text-sm text-gray-700">
                                {option.label} ({option.count})
                              </span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 py-2">No locations found</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>


                {/* Employment Type Filter */}
                <div className="mb-4 sm:mb-6">
                  <button
                    onClick={() => toggleFilterSection("employmentType")}
                    className="w-full flex items-center justify-between text-gray-700 font-medium mb-2 sm:mb-3 text-sm sm:text-base"
                  >
                    <span>Employment Type:</span>
                    <FiChevronDown
                      className={`transform transition-transform ${expandedFilters.employmentType ? 'rotate-180' : ''}`}
                      size={18}
                    />
                  </button>
                  {expandedFilters.employmentType && (
                    <div className="space-y-3">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          placeholder="Search type"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                          value={filterSearchQueries.employmentType}
                          onChange={(e) => setFilterSearchQueries(prev => ({ ...prev, employmentType: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        {getFilteredEmploymentTypes().length > 0 ? (
                          getFilteredEmploymentTypes().map((option) => (
                            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.employmentType.includes(option.value)}
                                onChange={() => toggleFilter("employmentType", option.value)}
                                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                              />
                              <span className="text-sm text-gray-700">
                                {option.label} ({option.count})
                              </span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 py-2">No items found</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              <div className="mt-auto pt-4 border-t border-gray-200 flex-shrink-0">
                <button
                  onClick={handleFindJob}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 sm:py-2.5 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  Find job
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Job Listings - Scrollable */}
          <div className="lg:w-3/4 w-full h-full overflow-y-auto">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">All Job List</h2>
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  <div className="flex items-center gap-1 sm:gap-2 border border-gray-200 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 sm:p-2 rounded ${viewMode === "grid" ? "bg-teal-500 text-white" : "text-gray-600"}`}
                      aria-label="Grid view"
                    >
                      <FiGrid size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 sm:p-2 rounded ${viewMode === "list" ? "bg-teal-500 text-white" : "text-gray-600"}`}
                      aria-label="List view"
                    >
                      <FiList size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 flex-1 sm:flex-initial"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="relevance">Relevance</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Job Cards */}
              {loading ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-teal-600"></div>
                  <p className="mt-4 text-sm sm:text-base text-gray-600">Loading jobs...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-sm sm:text-base text-gray-600">No jobs found</p>
                </div>
              ) : (
                <div className={viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                  : "space-y-3 sm:space-y-4"
                }>
                  {jobs.map((job, index) => (
                    <div
                      key={job.id}
                      onClick={() => navigate(`/job/${job.id}`)}
                      className={`border-2 rounded-lg p-3 sm:p-4 hover:border-orange-400 transition-colors cursor-pointer bg-gray-50 ${index === 0 ? "border-orange-400" : "border-gray-200 hover:border-orange-300"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5">{job.title}</h3>
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-xs sm:text-sm text-gray-600">{job.company}</span>
                            <FiCheck className="text-orange-500 flex-shrink-0" size={14} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {job.logo && (
                            <img
                              src={job.logo}
                              alt={job.company}
                              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveJob(job.id);
                            }}
                            className={`p-1.5 transition-colors flex-shrink-0 ${savedJobs.has(job.id)
                              ? "text-orange-500"
                              : "text-orange-500 hover:text-orange-600"
                              }`}
                            aria-label={savedJobs.has(job.id) ? "Unsave job" : "Save job"}
                          >
                            <FiBookmark size={18} fill={savedJobs.has(job.id) ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-700 text-xs sm:text-sm mb-2 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {job.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="border-t border-gray-300 pt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-gray-700 text-xs sm:text-sm">
                          <FiMapPin className="flex-shrink-0" size={14} />
                          <span>{job.location}</span>
                        </div>
                        <span className="text-xs text-gray-500">{job.postedTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

