import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Additional routes (login, dashboard…) will go here later */}
      </Routes>
    </Router>
  );
}

export default App;