import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./components/Dashboard";
import Editor from "./pages/Editor";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>

      {/* ✅ Navbar should be inside Router */}
      <Navbar />

      <Routes>

        {/* Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/editor/new"
          element={
            <PrivateRoute>
              <Editor />
            </PrivateRoute>
          }
        />

        <Route
          path="/editor/:id"
          element={
            <PrivateRoute>
              <Editor />
            </PrivateRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;