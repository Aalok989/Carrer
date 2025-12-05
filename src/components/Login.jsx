import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { getApiHeaders } from '../utils/apiHeaders';
import logo from '../assets/Etribe-logo.jpg';
import bgImage from '../assets/images/bg-login.jpg';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [redirect, _setRedirect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [_showResetModal, _setShowResetModal] = useState(false);
  const [_resetLoading, _setResetLoading] = useState(false);
  const [_resetError, _setResetError] = useState('');
  const [_resetUserId, _setResetUserId] = useState('');
  const [_resetForm, _setResetForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    login: false,
    register: false,
    registerConfirm: false,
    reset: false,
    resetConfirm: false,
  });


  const [regForm, setRegForm] = useState({
    name: '',
    contact: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    state: '',
  });
  const [regError, setRegError] = useState('');
  const navigate = useNavigate();

  // Country and State data from API
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);

  // Fetch countries from API
  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const response = await api.get('/common/countries', {
        headers: getApiHeaders()
      });
      
      // Handle response: { status: true, data: [{ country: "India" }] }
      if (response.data?.status === true || response.data?.status === 'success') {
        const countriesData = response.data?.data || [];
        // Map the response to include id and name
        // Since API doesn't provide id, we'll use index + 1 as id and store country name
        const mappedCountries = Array.isArray(countriesData) 
          ? countriesData.map((country, index) => ({
              id: country.id || country.country_id || (index + 1),
              name: country.country || country.name || country.country_name || '',
              originalData: country // Keep original data for reference
            }))
          : [];
        setCountries(mappedCountries);
      } else {
        setCountries([]);
      }
    } catch (err) {
      console.error('Error fetching countries:', err);
      setCountries([]);
      toast.error('Failed to load countries. Please try again.');
    } finally {
      setLoadingCountries(false);
    }
  };

  // Fetch states for selected country
  const fetchStates = async (countryId) => {
    if (!countryId) {
      setStates([]);
      return;
    }

    // Find the country name from the selected country ID
    const selectedCountry = countries.find(c => 
      c.id === parseInt(countryId) || c.id === countryId || 
      c.country_id === parseInt(countryId) || c.country_id === countryId
    );
    
    if (!selectedCountry) {
      setStates([]);
      return;
    }

    const countryName = selectedCountry.name || selectedCountry.country || '';

    setLoadingStates(true);
    try {
      const response = await api.post('/common/states', {
        country: countryName
      }, {
        headers: getApiHeaders()
      });
      
      // Handle response: { status: true, data: [{ id: "1", country: "India", state: "Delhi", phone_code: "91" }] }
      if (response.data?.status === true || response.data?.status === 'success') {
        const statesData = response.data?.data || [];
        // Map the response to normalize the structure
        const mappedStates = Array.isArray(statesData) 
          ? statesData.map((state) => ({
              id: parseInt(state.id) || state.id,
              state_id: parseInt(state.id) || state.id,
              area_id: parseInt(state.id) || state.id, // Use id as area_id
              name: state.state || state.name || state.state_name || '',
              country: state.country || countryName,
              phone_code: state.phone_code || '',
              originalData: state // Keep original data for reference
            }))
          : [];
        setStates(mappedStates);
      } else {
        setStates([]);
      }
    } catch (err) {
      console.error('Error fetching states:', err);
      setStates([]);
      toast.error('Failed to load states. Please try again.');
    } finally {
      setLoadingStates(false);
    }
  };

  // Get states for selected country
  const getStatesForCountry = () => {
    return states;
  };

  // Password validation function
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) return 'Password must be at least 8 characters long';
    if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
    if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
    if (!hasNumbers) return 'Password must contain at least one number';
    if (!hasSpecialChar) return 'Password must contain at least one special character';
    
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const email = (e.target.email.value || '').trim();
    const password = (e.target.password.value || '').trim();
    
    // Basic validation
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      setLoading(false);
      return;
    }
    
    try {
      // Updated API endpoint for JobApplicant login
      const response = await api.post('/JobApplicant/login', { email, password }, {
        headers: getApiHeaders()
      });
      
      // Handle malformed responses that might contain PHP errors mixed with JSON
      let data = response.data || {};
      
      // If response is a string, try to extract JSON from it
      if (typeof data === 'string') {
        try {
          // Look for JSON object in the response string
          const jsonMatch = data.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            data = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No valid JSON found in response');
          }
        } catch {
          toast.error('Server returned invalid response format. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Success path: token present
      if (data?.token || data?.status === 'success') {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        // Extract user data
        const userData = data.data || data.user || {};
        const uidCandidate = userData.id ?? userData.user_id ?? data.user_id ?? data.id;
        if (uidCandidate) {
          localStorage.setItem('uid', String(uidCandidate));
        }
        
        // Extract and save user name
        const userName = userData.name ?? userData.user_name ?? data.name ?? data.user_name;
        if (userName) {
          localStorage.setItem('userName', userName);
        }
        
        toast.success('Login successful!');
        navigate('/joblist');
        
        setTimeout(() => {
          window.dispatchEvent(new Event('login'));
        }, 50);
        return;
      }

      // No token returned: show backend message if available
      const backendMessage = data?.message || data?.error || data?.msg;
      if (backendMessage) {
        toast.error(backendMessage);
      } else {
        toast.error('Invalid email or password.');
      }
    } catch (err) {
      const status = err.response?.status;
      const respData = err.response?.data;

      // Handle cases where response might contain PHP errors but still have valid data
      if (respData && typeof respData === 'object' && respData.token) {
        localStorage.setItem('token', respData.token);
        
        const userData = respData.data || respData.user || {};
        const uidCandidate = userData.id ?? userData.user_id ?? respData.user_id ?? respData.id;
        if (uidCandidate) {
          localStorage.setItem('uid', String(uidCandidate));
        }
        
        // Extract and save user name
        const userName = userData.name ?? userData.user_name ?? respData.name ?? respData.user_name;
        if (userName) {
          localStorage.setItem('userName', userName);
        }
        
        toast.success('Login successful!');
        navigate('/joblist');
        
        setTimeout(() => {
          window.dispatchEvent(new Event('login'));
        }, 50);
        return;
      }

      // Extract meaningful backend messages
      const backendMessage =
        respData?.message ||
        respData?.error ||
        respData?.msg ||
        (Array.isArray(respData?.errors) ? respData.errors.join(', ') : undefined);

      if (backendMessage) {
        toast.error(backendMessage);
      } else if (status === 401 || status === 403) {
        toast.error('Unauthorized. Please check your credentials.');
      } else if (status === 429) {
        toast.error('Too many attempts. Please try again later.');
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      } else if (err.message === 'Network Error') {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setLoading(true);
    
    // Validation
    if (regForm.password !== regForm.confirmPassword) {
      setRegError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    const passwordError = validatePassword(regForm.password);
    if (passwordError) {
      setRegError(passwordError);
      setLoading(false);
      return;
    }
    
    // Check if all required fields are filled
    const requiredFields = ['name', 'contact', 'email', 'password', 'country', 'state'];
    const missingFields = requiredFields.filter(field => !regForm[field]);
    
    if (missingFields.length > 0) {
      setRegError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    // Get area_id from selected state
    const selectedState = getStatesForCountry().find(s => 
      s.id === parseInt(regForm.state) || 
      s.id === regForm.state ||
      s.state_id === parseInt(regForm.state) ||
      s.state_id === regForm.state
    );
    if (!selectedState) {
      setRegError('Please select a valid state.');
      setLoading(false);
      return;
    }
    
    // Extract area_id - the state id is used as area_id
    const areaId = selectedState.area_id || selectedState.id || selectedState.state_id || regForm.state;
    
    try {
      // Updated API endpoint and payload format for JobApplicant registration
      const registrationData = {
        name: regForm.name,
        email: regForm.email,
        password: regForm.password,
        contact: parseInt(regForm.contact, 10), // Convert to number
        area_id: parseInt(areaId, 10), // Use state id as area_id
      };
      
      const response = await api.post('/JobApplicant/register', registrationData, {
        headers: getApiHeaders()
      });
      
      // Handle response: API may return status: true or status: 'success'
      if (response.data?.status === true || response.data?.status === 'success' || response.data?.success) {
        toast.success('Registration successful! Please log in.');
        setIsLogin(true); // Switch back to login form
        setRegForm({
          name: '',
          contact: '',
          email: '',
          password: '',
          confirmPassword: '',
          country: '',
          state: '',
        });
        // Reset states when switching back to login
        setStates([]);
      } else {
        const errorMessage = response.data?.message || response.data?.error || response.data?.msg || 'Registration failed. Please try again.';
        setRegError(errorMessage);
      }
    } catch (err) {
      setRegError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    
    // If country changes, reset state and fetch new states
    if (name === 'country') {
      setRegForm({ ...regForm, country: value, state: '' });
      fetchStates(value);
    } else {
    setRegForm({ ...regForm, [name]: value });
    }
    
    // Clear error when user starts typing
    if (regError) setRegError('');
  };

  // Clear any dark theme classes when login page loads
  useEffect(() => {
    // Remove dark theme classes from document
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    
    // Also remove from any parent containers
    const containers = document.querySelectorAll('.dark');
    containers.forEach(container => {
      container.classList.remove('dark');
    });
  }, []);

  // Fetch countries when registration form is shown
  useEffect(() => {
    if (!isLogin && countries.length === 0 && !loadingCountries) {
      fetchCountries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin]);

  // Use useEffect for navigation
  useEffect(() => {
    if (redirect) {
      navigate('/joblist', { replace: true });
    }
  }, [redirect, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden font-poppins login-page"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="relative z-10 w-full max-w-md p-8 bg-white/95 rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Company Logo" className="h-20 mb-4 drop-shadow-xl rounded-full bg-white/80 p-2" />
          <h2 className={`text-3xl font-extrabold tracking-tight mb-1 ${isLogin ? 'text-primary-dark' : 'text-green-700'}`}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-accent text-sm mb-2">{isLogin ? 'Sign in to your account' : 'Register to get started'}</p>
        </div>
        {isLogin ? (
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label htmlFor="login-email" className="block text-primary-dark font-semibold mb-1">Email</label>
              <input 
                id="login-email"
                name="email" 
                type="email" 
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-primary-dark" 
                placeholder="Enter your email"
                aria-describedby="login-email-error"
                style={{
                  backgroundColor: 'white',
                  borderColor: '#d1d5db',
                  color: '#1e40af'
                }}
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-primary-dark font-semibold mb-1">Password</label>
              <div className="relative">
                <input 
                  id="login-password"
                  name="password" 
                  type={passwordVisibility.login ? 'text' : 'password'} 
                  required 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-primary-dark pr-12" 
                  placeholder="Enter your password"
                  aria-describedby="login-password-error"
                  style={{
                    backgroundColor: 'white',
                    borderColor: '#d1d5db',
                    color: '#1e40af'
                  }}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('login')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
                  aria-label={passwordVisibility.login ? 'Hide password' : 'Show password'}
                >
                  {passwordVisibility.login ? (
                    <AiOutlineEyeInvisible className="h-5 w-5" />
                  ) : (
                    <AiOutlineEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition disabled:opacity-50" 
              disabled={loading}
              aria-describedby={loading ? "loading-status" : undefined}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {loading && <div id="loading-status" className="sr-only">Loading...</div>}
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label htmlFor="reg-name" className="block text-primary-dark font-semibold mb-1">Name</label>
              <input 
                id="reg-name"
                name="name" 
                value={regForm.name || ''} 
                onChange={handleRegChange} 
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-primary-dark" 
                placeholder="Enter your name"
                aria-describedby="reg-name-error"
              />
            </div>
            <div>
              <label htmlFor="reg-contact" className="block text-primary-dark font-semibold mb-1">Contact No</label>
              <input 
                id="reg-contact"
                name="contact" 
                value={regForm.contact || ''} 
                onChange={handleRegChange} 
                type="tel"
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-primary-dark" 
                placeholder="Enter your contact number"
                aria-describedby="reg-contact-error"
              />
            </div>
            <div>
              <label htmlFor="reg-email" className="block text-primary-dark font-semibold mb-1">Email</label>
              <input 
                id="reg-email"
                name="email" 
                value={regForm.email || ''} 
                onChange={handleRegChange} 
                type="email" 
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 bg-white text-primary-dark" 
                placeholder="Enter your email"
                aria-describedby="reg-email-error"
              />
            </div>
            <div className="flex gap-2">
              <div className="w-1/2">
                <label htmlFor="reg-password" className="block text-primary-dark font-semibold mb-1">Password</label>
                <div className="relative">
                  <input 
                    id="reg-password"
                    name="password" 
                    value={regForm.password || ''} 
                    onChange={handleRegChange} 
                    type={passwordVisibility.register ? 'text' : 'password'} 
                    required 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-primary-dark pr-12" 
                    placeholder="Password"
                    aria-describedby="reg-password-error"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('register')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-800"
                    aria-label={passwordVisibility.register ? 'Hide password' : 'Show password'}
                  >
                    {passwordVisibility.register ? (
                      <AiOutlineEyeInvisible className="h-5 w-5" />
                    ) : (
                      <AiOutlineEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="w-1/2">
                <label htmlFor="reg-confirm-password" className="block text-primary-dark font-semibold mb-1">Confirm Password</label>
                <div className="relative">
                  <input 
                    id="reg-confirm-password"
                    name="confirmPassword" 
                    value={regForm.confirmPassword || ''} 
                    onChange={handleRegChange} 
                    type={passwordVisibility.registerConfirm ? 'text' : 'password'} 
                    required 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-primary-dark pr-12" 
                    placeholder="Confirm Password"
                    aria-describedby="reg-confirm-password-error"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('registerConfirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-800"
                    aria-label={passwordVisibility.registerConfirm ? 'Hide password' : 'Show password'}
                  >
                    {passwordVisibility.registerConfirm ? (
                      <AiOutlineEyeInvisible className="h-5 w-5" />
                    ) : (
                      <AiOutlineEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div>
               <label htmlFor="reg-country" className="block text-primary-dark font-semibold mb-1">Country</label>
               <select
                 id="reg-country"
                 name="country"
                 value={regForm.country || ''}
                 onChange={handleRegChange}
                 required
                 disabled={loadingCountries}
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-primary-dark disabled:bg-gray-100 disabled:cursor-not-allowed"
                 aria-describedby="reg-country-error"
               >
                 <option value="">{loadingCountries ? 'Loading countries...' : 'Select Country'}</option>
                 {countries.map((country) => (
                   <option key={country.id || country.country_id} value={country.id || country.country_id}>
                     {country.name || country.country || country.country_name}
                   </option>
                 ))}
               </select>
             </div>
             <div>
               <label htmlFor="reg-state" className="block text-primary-dark font-semibold mb-1">State</label>
               <select
                 id="reg-state"
                 name="state"
                 value={regForm.state || ''}
                onChange={handleRegChange} 
                required 
                 disabled={!regForm.country || loadingStates}
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-primary-dark disabled:bg-gray-100 disabled:cursor-not-allowed"
                 aria-describedby="reg-state-error"
               >
                 <option value="">{loadingStates ? 'Loading states...' : 'Select State'}</option>
                 {getStatesForCountry().map((state) => (
                   <option key={state.id || state.state_id} value={state.id || state.state_id}>
                     {state.name || state.state || state.state_name}
                   </option>
                 ))}
               </select>
            </div>
            {regError && <div id="reg-error" className="text-green-500 text-sm text-center" role="alert">{regError}</div>}
            <button 
              type="submit" 
              className="w-full bg-green-600 text-white py-2 rounded-lg font-bold shadow-lg hover:bg-green-700 transition disabled:opacity-50"
              disabled={loading}
              aria-describedby={loading ? "reg-loading-status" : undefined}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
            {loading && <div id="reg-loading-status" className="sr-only">Loading...</div>}
          </form>
        )}
        {isLogin ? (
          <>
            <div className="mt-2 text-center">
              <span className="text-gray-600 text-sm">Don't have an account? </span>
              <button type="button" className="text-green-700 underline hover:text-primary text-sm" onClick={() => setIsLogin(false)}>
                Register
              </button>
            </div>
          </>
        ) : (
          <div className="mt-2 text-center">
            <span className="text-gray-600 text-sm">Already have an account? </span>
            <button type="button" className="text-green-700 underline hover:text-primary text-sm" onClick={() => setIsLogin(true)}>
              Login
            </button>
          </div>
        )}
        <div className="mt-8 text-xs text-gray-500 text-center">
          {isLogin ? (
            <>By logging in, you agree to our <a href="#" className=" text-blue-500 underline hover:text-primary">Terms & Conditions</a>.</>
          ) : (
            <>By registering, you agree to our <a href="#" className=" text-blue-500 underline hover:text-primary">Terms & Conditions</a>.</>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} ETribe. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;

