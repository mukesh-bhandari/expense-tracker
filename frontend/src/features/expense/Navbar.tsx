import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faHistory, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      // Add your logout API call here
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      
      if (response.ok) {
        // Redirect to login page or handle logout
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleExpenseHistory = () => {
    navigate("/expenses");
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <nav className="navbar-expense sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Home */}
          <div className="flex items-center">
            <button
              onClick={handleHome}
              className={`flex items-center cursor-pointer gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                location.pathname === "/" 
                  ? "bg-primary-light text-primary" 
                  : "text-primary-foreground hover:bg-primary-hover"
              }`}
            >
              <FontAwesomeIcon icon={faHome} />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>

          {/* Center - Brand/Logo (optional) */}
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-primary-foreground">
              ExpenseTracker
            </h1>
          </div>

          {/* Right side - Expense History & Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExpenseHistory}
              className={`flex items-center gap-2  cursor-pointer px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                location.pathname === "/expenses" 
                  ? "bg-primary-light text-primary" 
                  : "text-primary-foreground hover:bg-primary-hover"
              }`}
            >
              <FontAwesomeIcon icon={faHistory} />
              <span className="hidden sm:inline">History</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center cursor-pointer gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;