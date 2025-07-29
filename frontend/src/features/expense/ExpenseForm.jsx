import React, { useState } from "react";
import { backend_url } from "../../utils/util";
import {NepaliDatePicker} from "nepali-datepicker-reactjs";

function ExpenseForm({ onAddExpense }) {
    const [item, setItem] = useState("");
    const [price, setPrice] = useState("");
    const [paidBy, setPaidBy] = useState("");
    const [date, setDate] = useState("");
    const [isAdding, setIsAdding] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("submitted")
        if(isAdding) return;
        setIsAdding(true);

        if (item && price && paidBy) {
            const newExpense = {id: Date.now(), item, price: parseFloat(price), paidBy, date};

            try {
                const response = await fetch( "/api/expenses", {

                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newExpense),
                });

                const data = await response.json();
                // console.log(data)
                onAddExpense(data); 
                setItem("");
                setPrice("");
                setPaidBy("");
                setDate("");
            } catch (error) {
                console.error("Error adding expense:", error);
            }finally{
                setIsAdding(false)
            }
        }
    };
    return (
     <>
     <div className="expense-form">
     <h1>Expense Tracker</h1>
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
                type="text"
                inputMode="decimal"
                placeholder="Price"
                value={price}
                onChange={(e) => {
                    
                    if (/^\d*(\.\d{0,2})?$/.test(e.target.value)) {
                        setPrice(e.target.value)
                      }
                }}
                required
            />
            <select 
            className="select-paidBy"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                required
            >
                 <option value="" disabled >Who Paid?</option> 
                <option value="aadarsh">aadarsh</option>
                <option value="mukesh">mukesh</option>
                <option value="kushal">kushal</option>
                <option value="niraj">niraj</option>
            </select>
                <NepaliDatePicker
                    inputClassName="input-date"
                    className="date-selector"
                    placeholder= "date"
                    value={date}
                    onChange={( value ) =>   setDate(value)}
                    options={{ calenderLocale: "en", valueLocale: "en" }}
                />
            <button type="submit" disabled={isAdding} >
            {isAdding ? "Adding..." : "Add Expense"}
            </button>
        </form>
     </div>
     </>
      
    );
}

export default ExpenseForm;
