import React, { useState } from "react";
import { useLoaderData } from "react-router-dom";

export default function FullExpenseList() {
  const initialExpenses = useLoaderData();
  const [month, setMonth] = useState("");
  const [expenses, setExpenses] = useState(initialExpenses);

  const handleChange = async (e) => {
    const value = e.target.value;
    setMonth(value);

    try {
      const res = await fetch(`/api/pastExpenses/${value}`);
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error("Failed to fetch filtered expenses:", err);
    }
  };

  return (
    <div>
      <h1>Expense Report</h1>
    <div className="expense-list">
      
      <div className="expense-filter">
        <select className="select-month" value={month} onChange={handleChange}>
          <option value="" disabled>
            All Months
          </option>
          <option value="0">This Month</option>
          <option value="1">Last Month</option>
          <option value="2">Two Month ago</option>
        </select>
        <ol>
          {expenses.map((expense) => (
            <li key={expense.id_}>
              <span>
                {" "}
                {expense.item} - {parseFloat(expense.price)} paid by{" "}
                {expense.paidBy} on {expense.bs_date}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="expense-summary">
        <h2>
          Total Expenditure:{" "}
          {expenses.reduce(
            (sum, expense) => sum + parseFloat(expense.price),
            0
          ).toFixed(2)}
        </h2>
      </div>
    </div>
    </div>
  );
}
