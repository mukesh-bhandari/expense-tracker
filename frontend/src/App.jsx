import React, { useState, useEffect} from "react";
import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";
import './App.css';

function App() {
    
        const [expenses, setExpenses] = useState([]);
    
        const addExpense = (newExpense) => {
            // console.log(newExpense)
            setExpenses((prev) => [...prev, newExpense]);
            // console.log(expenses)
        };
        // useEffect(() => {
        //     console.log("Updated expenses:", expenses);
        // }, [expenses]);
        

    return (
        <div className="App">
            <h1>Expense Tracker</h1>
            <ExpenseForm onAddExpense={addExpense} />
            <ExpenseList persons={["mukesh", "aadarsh", "kushal", "niraj"]} 
            expenses={expenses}/>
        </div>
    );
}

export default App;

