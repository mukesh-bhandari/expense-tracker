import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ExpenseForm from "./ExpenseForm.jsx";
import ExpenseList from "./ExpenseList.jsx";
import FullExpenseList from "./DisplayExpense.jsx";
import { backend_url } from "./util.js";

const expenseLoader = async () => {
  const response = await fetch(backend_url + "/expenses/expenseList");
  if (!response.ok) {
    throw new Error("Failed to fetch expenses")
  }
  return response.json();
};
const addExpense = (newExpense) => {
  console.log("nothing new");
  
};
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <ExpenseForm onAddExpense={addExpense}/>
        <ExpenseList persons={["mukesh", "aadarsh", "kushal", "niraj"]}/>
      </>
    ),
  },
  {
    path: "/expenses",
    element: <FullExpenseList />,
    loader: expenseLoader,
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
