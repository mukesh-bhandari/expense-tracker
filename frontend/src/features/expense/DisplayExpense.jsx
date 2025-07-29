import React, { useState } from "react";
import { useLoaderData } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faCalendarAlt, faReceipt, faFilter } from "@fortawesome/free-solid-svg-icons";

export default function HistoryAndAnalytics() {
  const initialExpenses = useLoaderData();
  const [month, setMonth] = useState("");
  const [expenses, setExpenses] = useState(initialExpenses);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const value = e.target.value;
    setMonth(value);
    setLoading(true);
    
    try {
      const res = await fetch(`/api/pastExpenses/${value}`);
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error("Failed to fetch filtered expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalExpenditure = expenses
    .reduce((sum, expense) => sum + parseFloat(expense.price), 0)
    .toFixed(2);

  // Group expenses by person for additional insights
  const expensesByPerson = expenses.reduce((acc, expense) => {
    const person = expense.paidBy;
    if (!acc[person]) {
      acc[person] = { count: 0, total: 0 };
    }
    acc[person].count += 1;
    acc[person].total += parseFloat(expense.price);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <FontAwesomeIcon icon={faChartLine} className="text-primary" />
          Expense Report
        </h1>
        
        {/* Filter */}
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faFilter} className="text-muted-foreground text-sm" />
          <select
            className="input-financial px-4 py-2 text-sm font-medium min-w-[160px]"
            value={month}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">All Months</option>
            <option value="0">This Month</option>
            <option value="1">Last Month</option>
            <option value="2">Two Months Ago</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
          {/* Total Expenditure Card */}
          <div className="expense-form p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Expenditure</p>
                <p className="text-2xl font-bold amount-negative">
                  NPR {totalExpenditure}
                </p>
              </div>
              <div className="w-12 h-12 bg-expense-light rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faReceipt} className="text-expense text-lg" />
              </div>
            </div>
          </div>

          {/* Total Transactions Card */}
          <div className="expense-form p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
                <p className="text-2xl font-bold text-foreground">
                  {expenses.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-primary text-lg" />
              </div>
            </div>
          </div>

          {/* Monthly Average Card */}
          <div className="expense-form p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Monthly Average</p>
                <p className="text-2xl font-bold text-foreground">
                  NPR {month === "" ? (parseFloat(totalExpenditure) / 3).toFixed(2) : totalExpenditure}
                </p>
              </div>
              <div className="w-12 h-12 bg-info-light rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faChartLine} className="text-info text-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Expense List */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border-light rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faReceipt} className="text-primary" />
              Transaction History
              {loading && (
                <svg className="animate-spin h-4 w-4 text-primary" viewBox="0 0 24 24">
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
              )}
            </h2>
            
            {expenses.length > 0 ? (
              <div className="space-y-0 max-h-96 overflow-y-auto">
                {expenses.map((expense) => (
                  <div key={expense.id_} className="bg-card border-b border-border-light p-4 last:border-b-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{expense.item}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                          <p className="text-sm text-muted-foreground">
                            Paid by <span className="font-medium capitalize text-foreground">{expense.paidBy}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {expense.bs_date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold amount-negative">
                          NPR {parseFloat(expense.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faReceipt} className="text-muted-foreground text-4xl mb-4" />
                <p className="text-muted-foreground">No expenses found for the selected period</p>
              </div>
            )}
          </div>
        </div>

        {/* Expenses by Person */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border-light rounded-lg p-3">
            <h2 className="text-lg font-semibold text-foreground mb-4">Expenses by Person</h2>
            
            {Object.keys(expensesByPerson).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(expensesByPerson)
                  .sort(([,a], [,b]) => b.total - a.total)
                  .map(([person, data]) => (
                    <div key={person} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                      <div>
                        <p className="font-medium capitalize text-foreground">{person}</p>
                        <p className="text-sm text-muted-foreground">
                          {data.count} transaction{data.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <p className="font-semibold amount-negative">
                        NPR {data.total.toFixed(2)}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}