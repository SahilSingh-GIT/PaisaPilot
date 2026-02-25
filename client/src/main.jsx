import React from "react"; // React library
import ReactDOM from "react-dom/client"; // Connects React to the browser DOM
import { BrowserRouter } from "react-router-dom"; // Enables routing/navigation
import App from "./App.jsx"; // Main App component
import "./index.css"; // Global CSS styles
import { AuthProvider } from "./contexts/AuthContext"; // Provides authentication state globally
import { Toaster } from "react-hot-toast"; // Shows toast notifications

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#18181b",
              color: "#fff",
              border: "1px solid #27272a",
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);


