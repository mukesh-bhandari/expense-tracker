import React, { useState } from "react";
import { backend_url } from "../../utils/util";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";

function ExpenseForm({ onAddExpense }) {
    const [item, setItem] = useState("");
    const [price, setPrice] = useState("");
    const [paidBy, setPaidBy] = useState("");
    const [date, setDate] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("submitted");
        if (isAdding) return;
        setIsAdding(true);
        
        if (item && price && paidBy) {
            const newExpense = { 
                id: Date.now(), 
                item, 
                price: parseFloat(price), 
                paidBy, 
                date 
            };
            
            try {
                const response = await fetch("/api/expenses", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newExpense),
                });
                const data = await response.json();
                onAddExpense(data);
                setItem("");
                setPrice("");
                setPaidBy("");
                setDate("");
            } catch (error) {
                console.error("Error adding expense:", error);
            } finally {
                setIsAdding(false);
            }
        }
    };

    return (
        <div className="expense-form p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6 text-foreground">
                Add New Expense
            </h2>
            
            <form onSubmit={handleSubmit} className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    {/* Item Input */}
                    <div className="md:col-span-2">
                        <label 
                            htmlFor="item" 
                            className="block text-sm font-medium mb-2 text-muted-foreground"
                        >
                            Item Description
                        </label>
                        <input
                            id="item"
                            type="text"
                            placeholder="Enter item name"
                            value={item}
                            onChange={(e) => setItem(e.target.value)}
                            required
                            className="input-financial w-full px-4 py-3 text-sm font-medium"
                        />
                    </div>

                    {/* Price Input */}
                    <div>
                        <label 
                            htmlFor="price" 
                            className="block text-sm font-medium mb-2 text-muted-foreground"
                        >
                            Amount (NPR)
                        </label>
                        <input
                            id="price"
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={price}
                            onChange={(e) => {
                                if (/^\d*(\.\d{0,2})?$/.test(e.target.value)) {
                                    setPrice(e.target.value);
                                }
                            }}
                            required
                            className="input-financial amount-negative w-full px-4 py-3 text-sm font-medium text-right"
                        />
                    </div>

                    {/* Paid By Select */}
                    <div>
                        <label 
                            htmlFor="paidBy" 
                            className="block text-sm font-medium mb-2 text-muted-foreground"
                        >
                            Paid By
                        </label>
                        <select
                            id="paidBy"
                            value={paidBy}
                            onChange={(e) => setPaidBy(e.target.value)}
                            required
                            className="input-financial w-full px-4 py-3 text-sm font-medium"
                        >
                            <option value="" disabled>Select person</option>
                            <option value="aadarsh">Aadarsh</option>
                            <option value="mukesh">Mukesh</option>
                            <option value="kushal">Kushal</option>
                            <option value="niraj">Niraj</option>
                        </select>
                    </div>

                    {/* Date Picker */}
                    <div>
                        <label 
                            htmlFor="date" 
                            className="block text-sm font-medium mb-2 text-muted-foreground"
                        >
                            Date
                        </label>
                        <NepaliDatePicker
                            inputClassName="input-financial w-full px-4 py-3 text-sm font-medium"
                            className="w-full"
                            placeholder="Select date"
                            value={date}
                            onChange={(value) => setDate(value)}
                            options={{ calenderLocale: "en", valueLocale: "en" }}
                        />
                    </div>
                </div>

                {/* Submit Button - Full width on mobile, auto on desktop */}
                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={isAdding}
                        className="btn-primary-expense px-8 cursor-pointer py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                    >
                        {isAdding ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle 
                                        className="opacity-25" 
                                        cx="12" 
                                        cy="12" 
                                        r="10" 
                                        stroke="currentColor" 
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path 
                                        className="opacity-75" 
                                        fill="currentColor" 
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Adding...
                            </span>
                        ) : (
                            "Add Expense"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ExpenseForm;