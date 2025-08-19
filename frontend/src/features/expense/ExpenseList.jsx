import React from "react";
import { useEffect, useState } from "react";
import { backend_url } from "../../utils/util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheck, faUser, faClock, faEdit } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function ExpenseList({
  persons = ["mukesh", "aadarsh", "kushal", "niraj"],
  newExpense,
}) {
  const [expenses, setExpenses] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editAmounts, setEditAmounts] = useState({});

  useEffect(() => {
    setExpenses(newExpense);
  }, [newExpense]);

  function handleButtonClick(expenseId, person) {
    setExpenses((prevExpenses) =>
      prevExpenses.map((expense) => {
        if (expense.id_ === expenseId) {
          const newButtonStates = {
            ...expense.buttonstates,
            [person]: !expense.buttonstates[person],
          };
          
          // If we have custom amounts (manually edited)
          if (expense.amounts) {
            const isBeingSkipped = !expense.buttonstates[person]; // Will be skipped after toggle
            
            if (isBeingSkipped) {
              // Person is being skipped - redistribute their amount equally to others
              const newAmounts = { ...expense.amounts };
              const personAmount = newAmounts[person] || 0;
              newAmounts[person] = 0;
              
              // Find non-skipped persons (excluding the one being skipped)
              const nonSkippedPersons = persons.filter(p => 
                p !== person && !newButtonStates[p]
              );
              
              if (nonSkippedPersons.length > 0 && personAmount > 0) {
                const redistribution = personAmount / nonSkippedPersons.length;
                nonSkippedPersons.forEach(p => {
                  newAmounts[p] = (newAmounts[p] || 0) + redistribution;
                  newAmounts[p] = Math.round(newAmounts[p] * 100) / 100; // Round to 2 decimals
                });
              }
              
              return {
                ...expense,
                buttonstates: newButtonStates,
                amounts: newAmounts,
              };
            } else {
              // Person is being unskipped - open edit popup
              // First update the button state
              const updatedExpense = {
                ...expense,
                buttonstates: newButtonStates,
              };
              
              // Then trigger edit popup after state update
              setTimeout(() => {
                handleEditExpense(updatedExpense);
              }, 0);
              
              return updatedExpense;
            }
          }
          
          return {
            ...expense,
            buttonstates: newButtonStates,
          };
        }
        return expense;
      })
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

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    
    // Calculate current equal division amounts for non-skipped persons
    const price = parseFloat(expense.price);
    const greenPersons = persons.filter(person => !expense.buttonstates[person]);
    const sharePerPerson = greenPersons.length > 0 ? price / greenPersons.length : 0;
    
    // Pre-populate with existing amounts or equal division
    const amounts = {};
    persons.forEach(person => {
      if (expense.amounts && expense.amounts[person] !== undefined) {
        // Use existing custom amount
        amounts[person] = expense.amounts[person];
      } else if (!expense.buttonstates[person]) {
        // Use equal division for non-skipped persons
        amounts[person] = sharePerPerson;
      } else {
        // Skipped persons get 0
        amounts[person] = 0;
      }
    });
    
    setEditAmounts(amounts);
    setIsEditModalOpen(true);
  };

  const handleAmountChange = (person, value) => {
    const numericValue = parseFloat(value) || 0;
    const roundedValue = Math.round(numericValue * 100) / 100; // Round to 2 decimal places
    
    setEditAmounts(prev => ({
      ...prev,
      [person]: roundedValue
    }));

    // If amount is set to 0, also update the button state to show as skipped
    if (roundedValue === 0 && editingExpense) {
      setExpenses(prevExpenses => 
        prevExpenses.map(expense => 
          expense.id_ === editingExpense.id_
            ? {
                ...expense,
                buttonstates: {
                  ...expense.buttonstates,
                  [person]: true // Mark as skipped
                }
              }
            : expense
        )
      );
    } else if (roundedValue > 0 && editingExpense) {
      // If amount is greater than 0, ensure they're not marked as skipped
      setExpenses(prevExpenses => 
        prevExpenses.map(expense => 
          expense.id_ === editingExpense.id_
            ? {
                ...expense,
                buttonstates: {
                  ...expense.buttonstates,
                  [person]: false // Mark as not skipped
                }
              }
            : expense
        )
      );
    }
  };

  const handleSaveAmounts = () => {
    const totalAllocated = Object.values(editAmounts).reduce((sum, amount) => sum + amount, 0);
    const expensePrice = parseFloat(editingExpense.price);
    
    // Check if total allocated equals expense price (allowing for small rounding errors)
    const difference = Math.abs(totalAllocated - expensePrice);
    if (difference > 0.01) {
      if (totalAllocated > expensePrice) {
        alert(`Total allocated amount (${totalAllocated.toFixed(2)}) cannot exceed expense price (${expensePrice.toFixed(2)})`);
      } else {
        alert(`Total allocated amount (${totalAllocated.toFixed(2)}) must equal expense price (${expensePrice.toFixed(2)})`);
      }
      return;
    }

    // Update the expense with custom amounts
    setExpenses(prevExpenses => 
      prevExpenses.map(expense => 
        expense.id_ === editingExpense.id_
          ? { ...expense, amounts: { ...editAmounts } }
          : expense
      )
    );

    setIsEditModalOpen(false);
    setEditingExpense(null);
    setEditAmounts({});
  };

  const handleDivideEqually = () => {
    if (!editingExpense) return;
    
    const price = parseFloat(editingExpense.price);
    const nonSkippedPersons = persons.filter(person => !editingExpense.buttonstates[person]);
    
    if (nonSkippedPersons.length === 0) return;
    
    const sharePerPerson = price / nonSkippedPersons.length;
    const newAmounts = {};
    
    persons.forEach(person => {
      if (editingExpense.buttonstates[person]) {
        // Skipped person gets 0
        newAmounts[person] = 0;
      } else {
        // Non-skipped person gets equal share
        newAmounts[person] = Math.round(sharePerPerson * 100) / 100;
      }
    });
    
    // Handle rounding errors by adjusting the last person
    const totalAllocated = Object.values(newAmounts).reduce((sum, amount) => sum + amount, 0);
    const difference = price - totalAllocated;
    if (Math.abs(difference) > 0.01 && nonSkippedPersons.length > 0) {
      const lastPerson = nonSkippedPersons[nonSkippedPersons.length - 1];
      newAmounts[lastPerson] = Math.round((newAmounts[lastPerson] + difference) * 100) / 100;
    }
    
    setEditAmounts(newAmounts);
  };

  const handleCustomDistribution = () => {
    if (!editingExpense) return;
    
    const price = parseFloat(editingExpense.price);
    const nonSkippedPersons = persons.filter(person => !editingExpense.buttonstates[person]);
    
    if (nonSkippedPersons.length === 0) return;
    
    // Custom distribution: Aadarsh gets 2 portions, others get 1 portion each
    // Total portions = number of non-skipped persons + 1 (extra portion for Aadarsh)
    const totalPortions = nonSkippedPersons.length + (nonSkippedPersons.includes('aadarsh') ? 1 : 0);
    const portionValue = price / totalPortions;
    
    const newAmounts = {};
    
    persons.forEach(person => {
      if (editingExpense.buttonstates[person]) {
        // Skipped person gets 0
        newAmounts[person] = 0;
      } else if (person === 'aadarsh') {
        // Aadarsh gets 2 portions
        newAmounts[person] = Math.round((portionValue * 2) * 100) / 100;
      } else {
        // Others get 1 portion each
        newAmounts[person] = Math.round(portionValue * 100) / 100;
      }
    });
    
    // Handle rounding errors by adjusting the last non-aadarsh person
    const totalAllocated = Object.values(newAmounts).reduce((sum, amount) => sum + amount, 0);
    const difference = price - totalAllocated;
    if (Math.abs(difference) > 0.01 && nonSkippedPersons.length > 0) {
      const adjustPerson = nonSkippedPersons.find(p => p !== 'aadarsh') || nonSkippedPersons[nonSkippedPersons.length - 1];
      newAmounts[adjustPerson] = Math.round((newAmounts[adjustPerson] + difference) * 100) / 100;
    }
    
    setEditAmounts(newAmounts);
  };

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
        amounts: expense.amounts || {}, // Direct amounts object without ID wrapper
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

      if (expense.amounts) {
        // Use custom amounts
        persons.forEach((person) => {
          const amount = expense.amounts[person] || 0;
          if (person !== expense.paidBy && amount > 0) {
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
                amount: amount,
                item: expense.item,
              });
            }
          }
        });
      } else {
        // Use equal division (original logic)
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

  const getTotalAllocated = () => {
    return Object.values(editAmounts).reduce((sum, amount) => sum + amount, 0);
  };

  const getRemainingAmount = () => {
    if (!editingExpense) return 0;
    return parseFloat(editingExpense.price) - getTotalAllocated();
  };

  const canSaveAmounts = () => {
    const remaining = getRemainingAmount();
    return Math.abs(remaining) <= 0.02; // Allow small rounding errors
  };

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
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors duration-200 text-muted-foreground hover:text-foreground"
                        title="Edit amounts"
                      >
                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <FontAwesomeIcon icon={faUser} className="text-xs" />
                      Paid by <span className="font-medium capitalize">{expense.paidBy}</span>
                    </p>
                  </div>

                  {/* Person Buttons */}
                  <div className="flex flex-wrap gap-2 justify-start">
                    {persons.map((person) => {
                      // Check both button state and custom amounts for skip status
                      const isExcluded = expense.buttonstates[person] || (expense.amounts && expense.amounts[person] === 0);
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

      {/* Edit Amount Modal */}
      {isEditModalOpen && editingExpense && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed left-0 top-0 w-lvw h-lvh bg-slate-300/50 z-40 duration-300"
            onClick={() => setIsEditModalOpen(false)}
          />
          
          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-lg z-50 shadow-lg">
            <div className="flex flex-col max-h-[80vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FontAwesomeIcon icon={faEdit} className="text-primary" />
                  Edit Amount Distribution
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors duration-200 text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p><span className="font-medium">Expense:</span> {editingExpense.item}</p>
                    <p><span className="font-medium">Total Amount:</span> NPR {parseFloat(editingExpense.price).toFixed(2)}</p>
                  </div>
                  
                  <div className="space-y-3">
                    {persons.map((person) => {
                      const isSkipped = editingExpense.buttonstates[person];
                      return (
                        <div key={person} className="flex items-center justify-between">
                          <label className="capitalize font-medium text-foreground">
                            {person}
                            {isSkipped && <span className="text-xs text-muted-foreground ml-2">(Skipped)</span>}
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">NPR</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={isSkipped}
                              value={editAmounts[person] || 0}
                              onChange={(e) => handleAmountChange(person, e.target.value)}
                              className="w-20 px-2 py-1 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:text-muted-foreground"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={handleDivideEqually}
                      className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors duration-200 text-foreground"
                    >
                      Distribute Equally
                    </button>
                    <button
                      onClick={handleCustomDistribution}
                      className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors duration-200 text-foreground bg-primary/10 border-primary/20"
                    >
                      Custom Distribution
                    </button>
                  
                  </div>
                  
                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Allocated:</span>
                      <span className="font-medium">NPR {getTotalAllocated().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Remaining:</span>
                      <span className={`font-medium ${getRemainingAmount() < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        NPR {getRemainingAmount().toFixed(2)}
                      </span>
                    </div>
                    {getRemainingAmount() < 0 && (
                      <p className="text-xs text-red-500">⚠️ Total allocated exceeds expense amount</p>
                    )}
                    {getRemainingAmount() > 0.01 && (
                      <p className="text-xs text-yellow-600">⚠️ Total allocated is less than expense amount</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors duration-200 text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAmounts}
                  disabled={!canSaveAmounts()}
                  className="btn-primary-expense px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Amounts
                </button>
              </div>
            </div>
          </div>
        </>
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