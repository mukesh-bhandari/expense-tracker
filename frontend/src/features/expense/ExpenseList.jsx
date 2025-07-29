import React from "react";
import { useEffect, useState } from "react";
import { backend_url } from "../../utils/util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheck, faUser, faClock } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function ExpenseList({
  persons = ["mukesh", "aadarsh", "kushal", "niraj"],
  newExpense,
}) {
  const [expenses, setExpenses] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setExpenses(newExpense);
  }, [newExpense]);

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
    if (isSaving) return;
    setIsSaving(true);
    const payLoad = expenses.map((expense) => {
      const buttonStateForExpense = {};
      const checkboxStateforExpense = {};
      const transactionCompletePerPerson = {};
      persons.forEach((person) => {
        buttonStateForExpense[person] = expense.buttonstates[person] || false;
        checkboxStateforExpense[person] = expense.checkboxstates[person] || false;

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

      return {
        id: expense.id_,
        buttonStates: buttonStateForExpense,
        checkboxStates: checkboxStateforExpense,
        transaction_complete: transactionCompletePerExpense,
      };
    });

    try {
      const response = await fetch("/api/expenses/save-states", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payLoad),
      });
      if (response.ok) {
        console.log("all states saved");
      }
    } catch (error) {
      console.error("error saving states", error);
    } finally {
      setIsSaving(false);
    }
  };

  const navigate = useNavigate();
  const handleNavigation = () => {
    navigate("/expenses");
  };

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
    <div className="space-y-8">
      {/* Expenses Section */}
      {expenses.length > 0 && (
        <div className="expense-form p-4 rounded-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <FontAwesomeIcon icon={faClock} className="text-primary" />
              Recent Expenses
            </h2>
            <div className="flex items-center gap-3">
              {Object.entries(netTransactions).length > 0 && (
                <button
                  onClick={() => setIsSheetOpen(true)}
                  className="p-2 sm:px-4 sm:py-2 text-sm cursor-pointer font-medium border border-border rounded-lg hover:bg-secondary transition-colors duration-200 text-foreground flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faUser} className="text-warning" />
                  View Balances
                </button>
              )}
              {expenses.length > 0 && (
                <button
                  onClick={handleSaveButton}
                  disabled={isSaving}
                  className="btn-primary-expense cursor-pointer px-6 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
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
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-0">
            {expenses.map((expense, index) => (
              <div key={index} className="bg-card border-b border-border-light p-4 last:border-b-0">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Expense Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-foreground">{expense.item}</h3>
                      <span className="amount-negative font-semibold">
                        NPR {parseFloat(expense.price).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <FontAwesomeIcon icon={faUser} className="text-xs" />
                      Paid by <span className="font-medium capitalize">{expense.paidBy}</span>
                    </p>
                  </div>

                  {/* Person Buttons */}
                  <div className="flex flex-wrap gap-2 justify-start">
                    {persons.map((person) => {
                      const isExcluded = expense.buttonstates[person];
                      const isPaid = expense.checkboxstates[person];
                      
                      return (
                        <div key={person} className="relative">
                          <button
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 min-w-[100px] justify-center ${
                              isExcluded
                                ? 'bg-muted text-muted-foreground border border-border'
                                : isPaid
                                ? 'card-income text-income'
                                : 'card-expense text-expense'
                            }`}
                            onClick={() => handleButtonClick(expense.id_, person)}
                          >
                            <span className="capitalize">{person}</span>
                            {isExcluded && (
                              <span className="text-xs opacity-75">Skip</span>
                            )}
                          </button>
                          
                          {!isExcluded && (
                            <button
                              className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                isPaid
                                  ? 'bg-income border-income text-income-foreground'
                                  : 'bg-card border-border hover:border-primary'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCheckBoxClick(expense.id_, person);
                              }}
                            >
                              {isPaid && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outstanding Balances Sheet */}
      {isSheetOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed left-0 top-0 w-lvw h-lvh  bg-slate-300/50  z-40 duration-300"
            onClick={() => setIsSheetOpen(false)}
          />
          
          {/* Sheet */}
          <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50 transform transition-transform duration-300 ease-out ${
            isSheetOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} className="text-warning" />
                  Outstanding Balances
                </h3>
                <button
                  onClick={() => setIsSheetOpen(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors duration-200 text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {Object.entries(netTransactions).length > 0 ? (
                  <div className="space-y-0">
                    {Object.entries(netTransactions).map(([key, amount]) => {
                      const [from, to] = key.split("->");
                      
                      return (
                        <div key={key} className="bg-card border-b border-border-light p-4 last:border-b-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                                <FontAwesomeIcon icon={faUser} className="text-primary text-sm" />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium capitalize text-foreground">{from}</span> owes{' '}
                                  <span className="font-medium capitalize text-foreground">{to}</span>
                                </p>
                                <p className="font-semibold amount-negative">
                                  NPR {amount.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            
                            <button
                              className="btn-primary-expense px-3 py-1.5 text-xs font-medium"
                              onClick={() => handleTransactionComplete([from, to])}
                            >
                              Mark Paid
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <p>No outstanding balances</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Navigation Button */}
      <div className="hidden justify-center pt-4">
        <button
          onClick={handleNavigation}
          className="px-6 py-3 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors duration-200 text-foreground"
        >
          View Expense Report
        </button>
      </div>
    </div>
  );
}

export default ExpenseList;