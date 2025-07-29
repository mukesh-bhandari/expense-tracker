import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/inter";
import "../styles/index.css";
import { createBrowserRouter, RouterProvider, Outlet, redirect } from "react-router-dom";
import LoginPage from "../features/auth/LoginPage.jsx";
import { HomePage } from "./Home/Page.jsx";
import Navbar from "../features/expense/Navbar.js";
import History from "./History/Page.jsx";

// API utilities
const apiRequest = async (url, options = {}) => {
  const defaultOptions = {
    credentials: "include",
    ...options,
  };
  
  let response = await fetch(url, defaultOptions);
  
  // Handle 401 with retry
  if (response.status === 401) {
    response = await fetch(url, defaultOptions);
    if (response.status === 401) {
      return redirect("/login");
    }
  }
  
  if (!response.ok && response.status !== 401) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  return response;
};

// Loaders
const expenseLoader = async () => {
  try {
    const response = await apiRequest("/api/expenses/expenseList", {
      method: "GET",
    });
    
    if (response instanceof Response && response.type === "opaqueredirect") {
      return response;
    }
    
    return response.json();
  } catch (error) {
    console.error("Failed to load expenses:", error);
    return redirect("/login");
  }
};

// Layout component with navbar
const Layout = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Outlet />
      </main>
    </div>
  );
};

// Login layout (without navbar)
const LoginLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
      <Outlet />
    </div>
  );
};

// Router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "expenses",
        element: <History />,
        loader: expenseLoader,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
]);

// App root
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);