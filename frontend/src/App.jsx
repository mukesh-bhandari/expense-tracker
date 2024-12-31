import React, { useState } from "react";
import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";
import './App.css';

function App() {
    
        const [expenses, setExpenses] = useState([]);
    
        const addExpense = (newExpense) => {
            setExpenses((prev) => [...prev, newExpense]);
        };

    return (
        <div className="App">
            <h1>Expense Tracker</h1>
            <ExpenseForm onAddExpense={addExpense} />
            <ExpenseList persons={["mukesh", "aadarsh", "kushal", "niraj"]} />
        </div>
    );
}

export default App;
