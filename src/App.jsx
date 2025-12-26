import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import JobList from "./pages/JobList";
import JobDescription from "./pages/JobDescription";
import { ToastContainer } from "react-toastify";
import api from "./api/axiosConfig";

function App() {
  useEffect(() => {
    const updateFavicon = async () => {
      try {
        const uid = localStorage.getItem('uid') || '1';
        const response = await api.post('/groupSettings/get_group_logo',
          {},
          {
            headers: {
              'Client-Service': 'COHAPPRT',
              'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
              'uid': uid,
              'rurl': 'login.pftiindia.com',
            }
          }
        );

        if (response.data?.status && response.data?.data) {
          const logoUrl = `https://api.etribes.mittalservices.com/${response.data.data}`;

          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          link.href = logoUrl;
        }
      } catch (error) {
        console.error("Error updating favicon:", error);
      }
    };

    updateFavicon();
  }, []);

  return (
    <BrowserRouter basename="/career">
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<JobList />} />
          <Route path="/joblist" element={<JobList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/job/:id" element={<JobDescription />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </BrowserRouter>
  );
}

export default App;

