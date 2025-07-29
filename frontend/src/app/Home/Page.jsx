import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseList from "../../features/expense/ExpenseList";
import ExpenseForm from "../../features/expense/ExpenseForm";

export const HomePage = () => {
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
}