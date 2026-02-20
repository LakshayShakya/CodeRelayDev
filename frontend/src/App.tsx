import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import CreatePullRequest from "./pages/CreatePullRequest";
import PullRequestDashboard from "./pages/PullRequestDashboard";
import ReviewerDashboard from "./pages/ReviewerDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pull-requests" element={<PullRequestDashboard />} />
        <Route path="/reviewer" element={<ReviewerDashboard />} />
        <Route path="/projects/:projectId/create-pr" element={<CreatePullRequest />} />
        <Route path="/" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}

export default App;