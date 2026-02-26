import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Products from "./pages/Products";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;