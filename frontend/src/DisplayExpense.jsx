import React from 'react'
import {useLoaderData} from 'react-router-dom';
 
export default function FullExpenseList(){

  const expenses = useLoaderData();

  return(
    <div className="expense-form">
      <h1>Expense List</h1>
      <ol>
        {expenses.map(expense =>(
          <li key={expense.id_}>
          {expense.item} - {parseFloat(expense.price)} paid by{" "}
          {expense.paidBy}
          </li>
        ))}
      </ol>
    </div>
  )
}