import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Analysis from "@/pages/Analysis";
import Prediction from "@/pages/Prediction";
import TraditionalPrediction from "@/pages/TraditionalPrediction";
import HistoryPage from "@/pages/History";
import About from "@/pages/About";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/prediction" element={<Prediction />} />
        <Route path="/astro" element={<TraditionalPrediction />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </Router>
  );
}
