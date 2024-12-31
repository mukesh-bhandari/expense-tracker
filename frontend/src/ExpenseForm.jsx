import React, { useState } from "react";

function ExpenseForm({ onAddExpense }) {
    const [item, setItem] = useState("");
    const [price, setPrice] = useState("");
    const [paidBy, setPaidBy] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (item && price && paidBy) {
            const newExpense = { item, price: parseFloat(price), paidBy };

            try {
                const response = await fetch("http://localhost:5000/expenses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newExpense),
                });

                const data = await response.json();
                onAddExpense(data); 
                setItem("");
                setPrice("");
                setPaidBy("");
            } catch (error) {
                console.error("Error adding expense:", error);
            }
        }
    };
    return (
     <>
  
       <form 
       className="input-form"
       onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Item"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                required
            />
            <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
            />
            <select 
            className="select-paidBy"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                required
            >
                 <option value="">Who Paid?</option> 
                <option value="aadarsh">aadarsh</option>
                <option value="mukesh">mukesh</option>
                <option value="kushal">kushal</option>
                <option value="niraj">niraj</option>
            </select>
            <button type="submit">Add Expense</button>
        </form></>
      
    );
}

export default ExpenseForm;
