import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/routes";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <Router>
      <ToastContainer />
      <AppRoutes />
    </Router>
  );
};

export default App;
