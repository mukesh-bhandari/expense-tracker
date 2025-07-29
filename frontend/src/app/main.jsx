import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/inter";
import "../styles/index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useState, useEffect } from "react";
import ExpenseForm from "../features/expense/ExpenseForm.jsx";
import ExpenseList from "../features/expense/ExpenseList.jsx";
import FullExpenseList from "../features/expense/DisplayExpense.jsx";
import { backend_url } from "../utils/util.js";
import LoginPage from "../features/auth/LoginPage.jsx";
import { useNavigate } from "react-router-dom";
import { redirect } from "react-router-dom";

const expenseLoader = async () => {
  let response = await fetch("/api/expenses/expenseList", {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) {
    response = await fetch("/api/expenses/expenseList", {
      method: "GET",
      credentials: "include",
    });
    if (response.status === 401) {
      return redirect("/login");
    }
  }

  // if (response.status === 401) {

  //  const refreshResponse = await fetch("/api/refresh", {
  //     method: "POST",
  //     credentials: "include",
  //   });

  // if (refreshResponse.ok) {
  //     response = await fetch("/api/expenses/expenseList", {
  //       method: "GET",
  //       credentials: "include",
  //     });
  //   }else {
  //     return redirect("/login");
  //     // throw new Error("Session expired. Please log in again.");
  //   }
  // }
  if (!response.ok) {
    return redirect("/login");
    // throw new Error("Failed to fetch expenses");
  }

  return response.json();
};

const AppContent = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const fetchExpenses = async () => {
    try {
      let response = await fetch("/api/expenses", {
        method: "GET",
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (response.status === 401) {
        response = await fetch("/api/expenses", {
          method: "GET",
          credentials: "include",
        });
        if (response.status === 401) {
          navigate("/login");
          return;
        }
      }

      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    //console.log(newExpense)
    // console.log(expenses)
  }, []);

  const addExpense = (data) => {
    // console.log(data)
    setExpenses((prev) => [...prev, data]);
    // console.log(expenses);
  };

  // const handleDeleteBtn = async (id) => {
  //   try {
  //     const response = await fetch(`/api/expenses/${id}`, {
  //       method: "DELETE",
  //     });

  //     if (response.ok) {
  //       setExpenses((prevExpenses) => {
  //         const updatedExpenses = prevExpenses.filter(
  //           (expense) => expense.id_ !== id
  //         );
  //         return updatedExpenses;
  //       });
  //     }
  //   } catch (error) {
  //     console.log("error on deletion");
  //   }
  // };

  return (
    <>
      <ExpenseForm onAddExpense={addExpense} />
      <ExpenseList
        persons={["mukesh", "aadarsh", "kushal", "niraj"]}
        newExpense={expenses}
        // onDelete={handleDeleteBtn}
      />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppContent></AppContent>,
  },
  {
    path: "/expenses",
    element: <FullExpenseList />,
    loader: expenseLoader,
  },
  {
    path: "/login",
    element: <LoginPage></LoginPage>,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
