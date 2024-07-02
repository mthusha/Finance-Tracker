import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";

const Transection = () => {
  const [transactions, setAllTransactions] = useState([]);
  const [userName, setUserName] = useState("");
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userName) {
      fetchAccounts();
      fetchAllTransactions(userName);
    }
  }, [userName]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/auth/validate-token",
        {
          headers: { "x-auth-token": token },
        }
      );
      setUserName(res.data.email);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/accounts/${userName}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setAccounts(res.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchAllTransactions = async (user) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/Alltransaction/${user}`
      );
      setAllTransactions(response.data);
    } catch (error) {
      console.error("Error fetching all transactions:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const transaction = transactions.find((tx) => tx._id === id);

      if (!transaction) {
        console.error("Transaction not found");
        return;
      }

      const amount = Number(transaction.amount);
      const accountFrom = accounts.find(
        (account) => account.name === transaction.from
      );
      const accountTo = accounts.find(
        (account) => account.name === transaction.to
      );

      if (transaction.type === "income" && accountTo) {
        const newBalance = accountTo.balance - amount;
        await updateAccountBalance(accountTo._id, newBalance);
      } else if (transaction.type === "transfer" && accountFrom && accountTo) {
        const newFromBalance = accountFrom.balance + amount;
        const newToBalance = accountTo.balance - amount;
        await updateAccountBalance(accountFrom._id, newFromBalance);
        await updateAccountBalance(accountTo._id, newToBalance);
      } else if (transaction.type === "expense" && accountFrom) {
        const newBalance = accountFrom.balance + amount;
        await updateAccountBalance(accountFrom._id, newBalance);
      }

      await axios.delete(`http://localhost:5000/api/transaction/${id}`, {
        headers: { "x-auth-token": token },
      });

      fetchAllTransactions(userName); // Ensure to refresh transactions after delete
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const updateAccountBalance = async (accountId, newBalance) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/accounts/${accountId}/update-balance`,
        { newBalance: parseFloat(newBalance) },
        { headers: { "x-auth-token": token } }
      );

      // Refresh accounts after updating balance
      fetchAccounts();
    } catch (error) {
      console.error("Error updating account balance:", error);
    }
  };

const Transaction = ({ date, from, amount, type, to, _id }) => {
  return (
    <div className="transaction">
      <div className="transaction-date">
        {new Date(date).toLocaleDateString()}
      </div>
      <div className="transaction-description">
        {type === "transfer" ? `${from} -> ${to}` : from || to}
      </div>
      <div className={`transaction-amount ${type}`}>
        {amount !== undefined
          ? type === "income"
            ? `+${amount.toLocaleString()} LKR`
            : `${amount.toLocaleString()} LKR`
          : "Amount not available"}
      </div>
      <div>
        <a
          onClick={() => handleDelete(_id)}
          style={{ color: "red", fontSize: "14px" }}
        >
          <FaTrash />
        </a>
      </div>
    </div>
  );
};


  const TransactionList = () => {
    const filteredTransactions = transactions.filter(
      (transaction) =>
        transaction.type === "income" || transaction.type === "expense"
    );

    const sortedTransactions = filteredTransactions.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    const totalIncome = sortedTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((acc, transaction) => acc + Number(transaction.amount || 0), 0);

    const totalExpense = sortedTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((acc, transaction) => acc + Math.abs(transaction.amount || 0), 0);

    const netAmount = totalIncome - totalExpense;

    const transferTransactions = transactions
      .filter((transaction) => transaction.type === "transfer")
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const groupByMonth = (transactions) => {
      return transactions.reduce((acc, transaction) => {
        const month = new Date(transaction.date).toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        if (!acc[month]) {
          acc[month] = [];
        }
        acc[month].push(transaction);
        return acc;
      }, {});
    };

    const monthlyTransfers = groupByMonth(transferTransactions);

    return (
      <div className="container">
        <div className="transacti">
          <h3>Income & Expense</h3>
          {sortedTransactions.length > 0 ? (
            sortedTransactions.map((transaction, index) => (
              <Transaction key={index} {...transaction} />
            ))
          ) : (
            <div>No transactions found.</div>
          )}
          {sortedTransactions.length > 0 && (
            <div className="summary">
              <div className="summary-item">
                <div>Total income</div>
                <div className="income">{totalIncome.toLocaleString()} LKR</div>
              </div>
              <div className="summary-item">
                <div>Total expense</div>
                <div className="expense">
                  {totalExpense.toLocaleString()} LKR
                </div>
              </div>
              <div className="summary-item">
                <div>Net amount</div>
                <div>{netAmount.toLocaleString()} LKR</div>
              </div>
            </div>
          )}
        </div>
        <div className="transfers">
          <h2>Transfers</h2>
          {Object.keys(monthlyTransfers).length > 0 ? (
            Object.keys(monthlyTransfers).map((month, index) => (
              <div key={index} className="monthly-transfers">
                <h4 style={{ color: "#ababab" }}>{month}</h4>
                {monthlyTransfers[month].map((transaction, idx) => (
                  <Transaction key={idx} {...transaction} />
                ))}
              </div>
            ))
          ) : (
            <div>No transfers found.</div>
          )}
        </div>
        <style jsx>{`
          .container {
            display: flex;
            flex-direction: column;
          }
          @media (min-width: 768px) {
            .container {
              flex-direction: row;
            }
          }
          .transacti,
          .transfers {
            flex: 1;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            margin: 10px;
          }
          .transaction {
            display: flex;
            justify-content: space-between;
            padding: 16px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .transaction:last-child {
            border-bottom: none;
          }
          .transaction-date,
          .transaction-description,
          .transaction-amount {
            flex: 1;
            text-align: center;
          }
          .transaction-amount {
            font-weight: bold;
          }
          .income {
            color: #4caf50;
          }
          .expense {
            color: #f44336;
          }
          .summary {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px solid #fff;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
          }
          .transfers {
            //   margin-top: 20px;
          }
          .monthly-transfers {
            margin-bottom: 20px;
          }
        `}</style>
      </div>
    );
  };

  return (
    <div>
      <TransactionList />
    </div>
  );
};

export default Transection;
