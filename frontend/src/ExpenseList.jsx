import { useEffect, useState } from "react";
import { backend_url } from "./util";

function ExpenseList({
  persons = ["mukesh", "aadarsh", "kushal", "niraj"],
}) {

  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
      const fetchExpenses = async () => {
          try {
              const response = await fetch(backend_url+"/expenses");
              if(response.status == 200){
                // console.log(response.body)
                const data = await response.json();
                // console.log(typeof(data[0].price))
                setExpenses(data);
              }
             
              // console.log(expenses)
          } catch (error) {
              console.error("Error fetching expenses:", error);
          }
      };

      fetchExpenses();
  }, []);


  const initialCheckboxStates = {};
  expenses.forEach((expense) => {
    persons.forEach((person) => {
      const key = `${expense.item}-${person}`;
      initialCheckboxStates[key] = false;
    });
  });

  const [buttonStates, setButtonStates] = useState({});
  const [checkboxStates, setCheckboxStates] = useState(initialCheckboxStates);

  function handleButtonClick(expense, person) {
    const key = `${expense.item}-${person}`;
    setButtonStates((prev) => ({
      ...prev,
      [key]: !prev[key], // Toggle button state
    }));
  }

  function handleCheckBoxClick( expense, person) {
    
    const key = `${expense.item}-${person}`;
    setCheckboxStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  // function calculateShare(expense) {
  //   const greenPersons = persons.filter((person) => {
  //     const key = `${expense.item}-${person}`;
  //     return !buttonStates[key]; // Only consider green buttons
  //   });

  //   return greenPersons.length === 0
  //     ? 0
  //     : (expense.price / greenPersons.length).toFixed(2);
  // }

  function calculateBalances() {
    const balances = {};


    persons.forEach((person) => (balances[person] = 0));
  //  console.log(expenses)
    expenses.forEach((expense) => {
      const price = parseFloat(expense.price);
      // console.log(typeof(price))
      const greenPersons = persons.filter((person) => {
        const key = `${expense.item}-${person}`;
        return !buttonStates[key]; 
      });

      if (greenPersons.length > 0) {
        // console.log(typeof(price))
        const sharePerPerson = price / greenPersons.length;

        greenPersons.forEach((person) => {
          const key = `${expense.item}-${person}`;
          //  console.log(balances[person])
          balances[person] -= sharePerPerson;
          // console.log(balances[person])
          if (checkboxStates[key]) {
            balances[person] += sharePerPerson;
            balances[expense.paidBy] -= sharePerPerson;
          }
          // console.log(balances[person])
        });
        // console.log(balances)
        // console.log(expense.paidBy)
        balances[expense.paidBy] += price;
      }
    });
    // console.log(balances)
    return balances;
  }

  const balances = calculateBalances();

  return (
    <>
    <div className="expense-list">
      <h2>Expense List</h2>
      <ol>
        {expenses.map((expense, index) => (
          <li key={index}>
            {expense.item} - {parseFloat(expense.price)} paid by {expense.paidBy}
            {/* <br /> */}
            {/* <strong>Share per person: {calculateShare(expense)}</strong> */}
            {persons.map((person) => {
              const key = `${expense.item}-${person}`;
              return (
                <button
                  key={person}
                  className="btn-toPay"
                  style={{
                    backgroundColor: buttonStates[key] ? "red" : "green",
                  }}
                  onClick={() => handleButtonClick(expense, person)}
                >
                  {person}
                  <span onClick={(e)=>e.stopPropagation()}>
                    <input
                    className="checkbox"
                    type="checkbox"
                    checked={checkboxStates[key] || false}
                    onChange={(e) => handleCheckBoxClick(expense, person)}
                  /></span>
                </button>
              );
            })}
          </li>
        ))}
      </ol>
      </div>
<div className="expense-form">
<h2>Final Balances:</h2>
      <ul>
        {Object.entries(balances).map(([person, balance]) => (
          <li key={person}>
            {person}: {parseFloat(balance.toFixed(2))}{" "}
            {balance >= 0 ? "to be reimbursed" : "to pay"}
          </li>
        ))}
      </ul>
</div>
      </>
  
  );
}

export default ExpenseList;
