import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Contact from "./pages/Home/Contact/Contact";
import About from "./pages/Home/About/AboutUs";
import Markets from "./pages/Home/Market/Market";
import Platform from "./pages/Home/Platform/Platform";
import Login from "./pages/auth/Login/Login";
import Signup from "./pages/auth/Signup/Signup";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHome from "./pages/admin/AdminHome";
import AdminReports from "./pages/admin/AdminReports";
import AdminTransactions from "./pages/admin/AdminTransactions";

function App() {
  return (
    <Router>
      {/* Homepage routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/platform" element={<Platform />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/markets" element={<Markets />} />
      </Routes>

      {/* Auth routes */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>

      {/* Admin routes */}
      <Routes>
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<AdminHome />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="transactions" element={<AdminTransactions />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;