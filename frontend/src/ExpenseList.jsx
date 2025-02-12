import React from "react";
import { useEffect, useState } from "react";
import { backend_url } from "./util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function ExpenseList({
  persons = ["mukesh", "aadarsh", "kushal", "niraj"],
  newExpense,
  onDelete,
}) {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    setExpenses(newExpense);
  }, [newExpense]);

  // const key = `${expense.id_}-${person}`;
  // setButtonStates((prev) => ({
  //   ...prev,
  //   [key]: !prev[key], // Toggle button state
  // }));
  function handleButtonClick(expenseId, person) {
    setExpenses((prevExpenses) =>
      prevExpenses.map((expense) =>
        expense.id_ === expenseId
          ? {
              ...expense,
              buttonstates: {
                ...expense.buttonstates,
                [person]: !expense.buttonstates[person],
              },
            }
          : expense
      )
    );
  }

  function handleCheckBoxClick(expenseId, person) {
    setExpenses((prevExpenses) =>
      prevExpenses.map((expense) =>
        expense.id_ === expenseId
          ? {
              ...expense,
              checkboxstates: {
                ...expense.checkboxstates,
                [person]: !expense.checkboxstates[person],
              },
            }
          : expense
      )
    );
  }
  const handleSaveButton = async () => {
    const payLoad = expenses.map((expense) => {
      const buttonStateForExpense = {};
      const checkboxStateforExpense = {};
      const transactionCompletePerPerson = {};
      persons.forEach((person) => {
        buttonStateForExpense[person] = expense.buttonstates[person] || false;
        checkboxStateforExpense[person] =
          expense.checkboxstates[person] || false;
        // console.log(buttonStateForExpense)

        if (
          expense.buttonstates[person] == true ||
          expense.checkboxstates[person] == true
        ) {
          transactionCompletePerPerson[person] = true;
        } else {
          transactionCompletePerPerson[person] = false;
        }
      });

      const transactionCompletePerExpense = Object.values(
        transactionCompletePerPerson
      ).every((value) => value === true);
      // console.log(transactionCompletePerExpense);

      return {
        id: expense.id_,
        buttonStates: buttonStateForExpense,
        checkboxStates: checkboxStateforExpense,
        transaction_complete: transactionCompletePerExpense,
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

  const navigate = useNavigate();
  const handleNavigation = () => {
    navigate("/expenses");
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

  // function calculateBalances() {
  //   const balances = {};

  //   persons.forEach((person) => (balances[person] = 0));
  //   //  console.log(expenses)
  //   expenses.forEach((expense) => {
  //     const price = parseFloat(expense.price);
  //     // console.log(typeof(price))
  //     const greenPersons = persons.filter((person) => {
  //       const key = `${expense.id_}-${person}`;
  //       return !buttonStates[key];
  //     });

  //     if (greenPersons.length > 0) {
  //       // console.log(typeof(price))
  //       const sharePerPerson = price / greenPersons.length;

  //       greenPersons.forEach((person) => {
  //         const key = `${expense.id_}-${person}`;
  //         //  console.log(balances[person])
  //         balances[person] -= sharePerPerson;
  //         // console.log(balances[person])
  //         if (checkboxStates[key]) {
  //           balances[person] += sharePerPerson;
  //           balances[expense.paidBy] -= sharePerPerson;
  //         }
  //       });
  //       balances[expense.paidBy] += price;
  //     }
  //   });
  //   // console.log(balances)
  //   // console.log(checkboxStates);
  //   return balances;
  // }

  // const balances = calculateBalances();

  // function handleTransactionComplete(person) {
  //   expenses.forEach((expense) => {
  //     const key = `${expense.id_}-${person}`;
  //     setCheckboxStates((prev) => {
  //       const updatedStates = { ...prev };
  //       updatedStates[key] = !updatedStates[key];
  //       return updatedStates;
  //     });
  //   });
  //   // seperateBalances();
  //   // console.log(checkboxStates);
  // }

  function transactionPerExpense() {
    const transactions = [];
    expenses.forEach((expense) => {
      const price = parseFloat(expense.price);

      const greenPersons = persons.filter((person) => {
        return !expense.buttonstates[person];
      });
      if (greenPersons.length > 0) {
        const sharePerPerson = price / greenPersons.length;
        greenPersons.forEach((person) => {
          if (person !== expense.paidBy) {
            if (expense.checkboxstates[person]) {
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
    setExpenses((prevExpenses) =>
      prevExpenses.map((expense) => {
        const updatedCheckboxStates = { ...expense.checkboxstates };

        let shouldUpdate = false;
        persons.forEach((person) => {
          if (
            (person === from && expense.paidBy === to) ||
            (person === to && expense.paidBy === from)
          ) {
            updatedCheckboxStates[person] = true;
            shouldUpdate = true;
          }
        });

        return shouldUpdate
          ? { ...expense, checkboxstates: updatedCheckboxStates }
          : expense;
      })
    );
  }

  return (
    <>
    <div className="expense-section">
      {expenses.length > 0 && (
        <div className="expenses">
          <h2> Expenses</h2>
          <ol>
            {expenses.map((expense, index) => (
              <li key={index}>
                <span>
                  {expense.item} - {parseFloat(expense.price)} paid by{" "}
                  {expense.paidBy}
                </span>
                <div className="expenses-btns-container">
                  {persons.map((person) => {
                    return (
                      <button
                        key={person}
                        className="btn-toPay"
                        style={{
                          backgroundColor: expense.buttonstates[person]
                            ? "red"
                            : "green",
                        }}
                        onClick={() => handleButtonClick(expense.id_, person)}
                      >
                        {person}
                        <span onClick={(e) => e.stopPropagation()}>
                          <input
                            className="checkbox"
                            type="checkbox"
                            checked={expense.checkboxstates[person] || false}
                            onChange={(e) =>
                              handleCheckBoxClick(expense.id_, person)
                            }
                          />
                        </span>
                      </button>
                    );
                  })}
                   {/* delete button */}
                  <button
                  className="delete-btn"
                  onClick={(e) => onDelete(expense.id_)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
                </div>
               
                
              </li>
            ))}
          </ol>
          {expenses.length > 0 && (
            <div className="save-btn-container">
              <button onClick={handleSaveButton} className="save-btn">
                save
              </button>
            </div>
          )}
        </div>
      )}

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

      {Object.entries(netTransactions).length > 0 && (
        <div className="transactions">
          <h2> Transactions</h2>
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
                    Paid
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

    
    </div>
      <div className="expenseList-btn-container">
      <button onClick={handleNavigation}>Full Expense List</button>
    </div></>
  );
}

export default ExpenseList;
