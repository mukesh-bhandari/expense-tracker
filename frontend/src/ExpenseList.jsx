import { useEffect, useState } from "react";
import { backend_url } from "./util";

function ExpenseList({ persons = ["mukesh", "aadarsh", "kushal", "niraj"] }) {
  const [expenses, setExpenses] = useState([]);
  const [buttonStates, setButtonStates] = useState({});
  const [checkboxStates, setCheckboxStates] = useState({});
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch(backend_url + "/expenses");
        if (response.status == 200) {
          const data = await response.json();
          // console.log(data)
          setExpenses(data);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };
    fetchExpenses();
  }, []);

  useEffect(() => {
    const initialButtonStates = {};
    const initialCheckboxStates = {};
    expenses.forEach((expense) => {
      persons.forEach((person) => {
        const key = `${expense.item}-${person}`;
        initialButtonStates[key] = expense.buttonstates[person];
        // initialCheckboxStates[key] = expense.checkboxstates[person];
        if (expense.paidBy === person) {
          initialCheckboxStates[key] = true;
        } else {
          initialCheckboxStates[key] = expense.checkboxstates[person];
        }
      });
    });
    setButtonStates(initialButtonStates);
    setCheckboxStates(initialCheckboxStates);
  }, [expenses]);

  function handleButtonClick(expense, person) {
    const key = `${expense.item}-${person}`;
    setButtonStates((prev) => ({
      ...prev,
      [key]: !prev[key], // Toggle button state
    }));
  }

  function handleCheckBoxClick(expense, person) {
    const key = `${expense.item}-${person}`;
    setCheckboxStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  const handleSaveButton = async () => {
    console.log(checkboxStates);

    
    const payLoad = expenses.map((expense) => {
      const buttonStateForExpense = {};
      const checkboxStateforExpense = {}
      persons.forEach((person) => {
        const key = `${expense.item}-${person}`;
        buttonStateForExpense[person] = buttonStates[key] || false; 
        checkboxStateforExpense[person] = checkboxStates[key] || false;
      });

      return {
        id: expense.id_, 
        buttonStates: buttonStateForExpense, 
        checkboxStates: checkboxStateforExpense,
      };
    });

    try {
      const response = await fetch(backend_url + "/expenses/save-states", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payLoad),
      });
      if (response.ok) {
        console.log("all states saved");
      }
    } catch (error) {
      console.error("error saving states", error);
    }
  };

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
        });
        balances[expense.paidBy] += price;
      }
    });
    // console.log(balances)
    // console.log(checkboxStates);
    return balances;
  }

  const balances = calculateBalances();

  function handleTransactionComplete(person) {
    expenses.forEach((expense) => {
      const key = `${expense.item}-${person}`;
      setCheckboxStates((prev) => {
        const updatedStates = { ...prev };
        updatedStates[key] = !updatedStates[key];
        return updatedStates;
      });
    });
    // seperateBalances();
    // console.log(checkboxStates);
  }

  function transactionPerExpense() {
    const transactions = [];
    expenses.forEach((expense) => {
      const price = parseFloat(expense.price);

      const greenPersons = persons.filter((person) => {
        const key = `${expense.item}-${person}`;
        return !buttonStates[key];
      });
      if (greenPersons.length > 0) {
        const sharePerPerson = price / greenPersons.length;
        greenPersons.forEach((person) => {
          const key = `${expense.item}-${person}`;
          if (person !== expense.paidBy) {
            if (checkboxStates[key]) {
              transactions.push({
                from: person,
                to: expense.paidBy,
                amount: 0,
                item: expense.item,
              });
            } else {
              transactions.push({
                from: person,
                to: expense.paidBy,
                amount: sharePerPerson,
                item: expense.item,
              });
            }
          }
        });
      }
    });
    // console.log(checkboxStates)
    // console.log(transactions);
    return transactions;
  }
  const transactions = transactionPerExpense();

  function calculateTransactions(transactions) {
    const netTransactions = {};
    transactions.forEach(({ from, to, amount }) => {
      const key = `${from}->${to}`;
      const reverseKey = `${to}->${from}`;
      netTransactions[key] = (netTransactions[key] || 0) + amount;
      netTransactions[reverseKey] = (netTransactions[reverseKey] || 0) - amount;
    });

    const simplifiedTransaction = {};
    Object.entries(netTransactions).forEach(([key, amount]) => {
      if (amount > 0) {
        simplifiedTransaction[key] = amount;
      }
    });
    return simplifiedTransaction;
  }

  const netTransactions = calculateTransactions(transactions);

  function handleTransactionComplete([from, to]) {
    expenses.forEach((expense) => {
      persons.forEach((person) => {
        const key = `${expense.item}-${person}`;
        if (
          (person === from && expense.paidBy === to) ||
          (person === to && expense.paidBy === from)
        ) {
          setCheckboxStates((prev) => {
            const updatedStates = { ...prev };
            updatedStates[key] = true;
            return updatedStates;
          });
        }
      });
    });
  }

  return (
    <>
    {expenses.length > 0 && <div className="expense-list">
        <h2>Expense List</h2>
        <ol>
          {expenses.map((expense, index) => (
            <li key={index}>
              {expense.item} - {parseFloat(expense.price)} paid by{" "}
              {expense.paidBy}
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
                    <span onClick={(e) => e.stopPropagation()}>
                      <input
                        className="checkbox"
                        type="checkbox"
                        checked={checkboxStates[key] || false}
                        onChange={(e) => handleCheckBoxClick(expense, person)}
                      />
                    </span>
                  </button>
                );
              })}
            </li>
          ))}
        </ol>
      </div>}
      
      {expenses.length > 0 &&  <div className="expense-form">
        <button onClick={handleSaveButton}>save</button>
      </div>}
     
      {/* <div className="expense-form">
        <h2>Final Balances:</h2>
        <ul>
          {Object.entries(balances).map(([person, balance]) => (
            <li key={person}>
              {person}: {parseFloat(balance.toFixed(2))}{" "}
              {balance >= 0 ? "to be reimbursed" : "to pay"}
              <button
                className="transactactionDone"
                onClick={() => handleTransactionComplete(person)}
              >
                transaction complete
              </button>
            </li>
          ))}
        </ul>
      </div> */}

{expenses.length > 0 &&    <div className="expense-form">
      
      <h2> seperate transaction</h2>
      <ul>
        {Object.entries(netTransactions).map(([key, amount]) => {
          const [from, to] = key.split("->");

          return (
            <li key={key}>
              {from} owes {to} {amount.toFixed(2)}
              <button
                className="transactactionDone"
                onClick={() => handleTransactionComplete([from, to])}
              >
                transaction complete
              </button>
            </li>
          );
        })}
      </ul>
    </div>}
     
    
    </>
  );
}

export default ExpenseList;
