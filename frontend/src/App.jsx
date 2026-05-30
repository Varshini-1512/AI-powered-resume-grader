// import {
//   Routes,
//   Route,
// } from "react-router-dom";

// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import UploadResume from "./pages/UploadResume";
// import ResumeDetails from "./pages/ResumeDetails";

// import ProtectedRoute from "./components/ProtectedRoute";

// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Login />} />

//       <Route
//         path="/register"
//         element={<Register />}
//       />

//       <Route
//         path="/dashboard"
//         element={
//           <ProtectedRoute>
//             <Dashboard />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/upload"
//         element={
//           <ProtectedRoute>
//             <UploadResume />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/resume/:id"
//         element={
//           <ProtectedRoute>
//             <ResumeDetails />
//           </ProtectedRoute>
//         }
//       />
//     </Routes>
//   );
// }

// export default App;

import {
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";

import Login from "./pages/Login";

import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";

import UploadResume from "./pages/UploadResume";

import ResumeDetails from "./pages/ResumeDetails";

import InfoPage from "./pages/InfoPage";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={<UploadResume />}
      />

      <Route
        path="/resume/:id"
        element={
          <ProtectedRoute>
            <ResumeDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/info/:slug"
        element={<InfoPage />}
      />
    </Routes>
  );
}

export default App;
