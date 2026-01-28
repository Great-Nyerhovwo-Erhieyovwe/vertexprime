import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Contact from "./pages/Home/Contact/Contact";
import About from "./pages/Home/About/AboutUs";
import Markets from "./pages/Home/Market/Market";
import Platform from "./pages/Home/Platform/Platform";
import Login from "./pages/auth/Login/Login";

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
      </Routes>

      {/* Dashboard routes */}
    </Router>
  );
}

export default App;