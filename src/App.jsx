import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import JobList from "./pages/JobList";
import JobDescription from "./pages/JobDescription";
import { ToastContainer } from "react-toastify";

function App() {
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

