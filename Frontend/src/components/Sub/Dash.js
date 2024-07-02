import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import axios from "axios";
const Dash = () => {
  const [activeTab, setActiveTab] = useState("expense");
  const [formData, setFormData] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);
  // const [AllTransactions, setAllTransactions] = useState([]);
  const [userName, setUserName] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [networthData, setNetworthData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    lastUpdated: "",
    inCome:0
  });
  
//  console.log(accounts);
 useEffect(() => {
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

   const fetchData = async () => {
     try {
       const token = localStorage.getItem("token");
       const [accountsRes, transactionsRes] = await Promise.all([
         axios.get(`http://localhost:5000/api/accounts/${userName}`, {
           headers: { "x-auth-token": token },
         }),
         axios.get(`http://localhost:5000/api/Alltransaction/${userName}`, {
           headers: { "x-auth-token": token },
           params: { userName },
         }),
       ]);

       setAccounts(accountsRes.data);
       setRecentTransactions(transactionsRes.data);

       const totalIncome = accountsRes.data.reduce(
         (sum, account) => sum + Number(account.balance),
         0
       );

       const totalExpense = transactionsRes.data
         .filter((tx) => tx.type === "expense")
         .reduce((sum, tx) => sum + Number(tx.amount), 0);

       const income = transactionsRes.data
         .filter((tx) => tx.type === "income")
         .reduce((sum, tx) => sum + Number(tx.amount), 0);

           const lastTransactionDate = transactionsRes.data.length
        ? new Date(Math.max(...transactionsRes.data.map((tx) => new Date(tx.date).getTime())))
            .toLocaleDateString('en-GB') 
            .split('/').reverse().join('-') 
        : "No transactions";

       // console.log(transactionsRes.data);
       setNetworthData({
         totalIncome: totalIncome,
         totalExpense: totalExpense,
         lastUpdated: lastTransactionDate,
         inCome: income,
       });
     } catch (error) {
       console.error("Error fetching data:", error);
     }
   };

   fetchUserData();
   if (userName) {
     fetchData();
   }
 }, [userName, activeTab]);
  const handleChange = (e) => {
    setFormData({
      user: userName,
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const accountFrom = accounts.find(
      (account) => account.name === formData.from
    );
    const accountTo = accounts.find((account) => account.name === formData.to);
    const amount = Number(formData.amount);

    if (
      activeTab === "expense" &&
      accountFrom &&
      accountFrom.balance < amount
    ) {
      alert("Insufficient funds in the selected account.");
      return;
    }

    if (
      activeTab === "transfer" &&
      accountFrom &&
      accountFrom.balance < amount
    ) {
      alert("Insufficient funds in the selected account for transfer.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/transaction",
        { type: activeTab, ...formData }
      );
     // console.log(response.data);
      fetchRecentTransactions();

      // Update balance locally
      if (activeTab === "expense" && accountFrom) {
        const newBalance = accountFrom.balance - amount;
        await updateAccountBalance(accountFrom._id, newBalance);
      } else if (activeTab === "transfer" && accountFrom && accountTo) {
        const newFromBalance = accountFrom.balance - amount;
        const newToBalance = accountTo.balance + amount;
        await updateAccountBalance(accountFrom._id, newFromBalance);
        await updateAccountBalance(accountTo._id, newToBalance);
      } else if (activeTab === "income" && accountTo) {
        const newBalance = accountTo.balance + amount;
        await updateAccountBalance(accountTo._id, newBalance);
      }

      setFormData({});
    } catch (error) {
      console.error(error);
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

      const res = await axios.get(
        `http://localhost:5000/api/accounts/${userName}`,
        { headers: { "x-auth-token": token } }
      );
      setAccounts(res.data);
    } catch (error) {
      console.error("Error updating account balance:", error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/transaction/${activeTab}`,
        {
          headers: { "x-auth-token": token },
          params: { userName },
        }
      );

      setRecentTransactions(response.data);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
    }
  };

  // const fetchAllTransactions = async () => {
  //   try {
  //     // const token = localStorage.getItem("token");
  //     const response = await axios.get(
  //       `http://localhost:5000/api/Alltransaction/${userName}`
  //       // {
  //       //   headers: { "x-auth-token": token },
  //       //   params: { userName },
  //       // }
  //     );
  //     setAllTransactions(response.data);
  //   } catch (error) {
  //     console.error("Error fetching All transactions:", error);
  //   }
  // };

  useEffect(() => {
    fetchRecentTransactions();
  }, [activeTab]);

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "short" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const transaction = recentTransactions.find((tx) => tx._id === id);

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

      fetchRecentTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  // const handleDelete = async (id) => {
  //   try {
  //     await axios.delete(`http://localhost:5000/api/transaction/${id}`);
  //     fetchRecentTransactions();
  //   } catch (error) {
  //     console.error("Error deleting transaction:", error);
  //   }
  // };

  // const updateBalance = async (accountId, newBalance) => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     await axios.put(
  //       `http://localhost:5000/api/accounts/${accountId}/update-balance`,
  //       { newBalance: parseFloat(newBalance) },
  //       { headers: { "x-auth-token": token } }
  //     );

  //     const res = await axios.get(
  //       `http://localhost:5000/api/accounts/${userName}`,
  //       { headers: { "x-auth-token": token } }
  //     );
  //     setAccounts(res.data);
  //   } catch (error) {
  //     console.error("Error updating account balance:", error);
  //   }
  // };

  // const totalIncome = AllTransactions.filter(
  //   (transaction) => transaction.type === "income"
  // ).reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const groupAccounts = () => {
    const grouped = {};
    accounts.forEach((account) => {
      const groupName = account.group ? account.group : "No Group";
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      grouped[groupName].push(account);
    });
    return grouped;
  };

  const groupedAccounts = groupAccounts();
//console.log(recentTransactions);
  return (
    <div className="central">
      <div className="dashboard">
        <div
          style={{ display: "flex", justifyContent: "space-between" }}
          className="net-worth"
        >
          <div>
            <h2>NETWORTH</h2>
            <div className="amount">{networthData.totalIncome} LKR</div>
          </div>
          <div>
            <div className="details">
              <p>
                Total Income: <span>{networthData.inCome}</span>
              </p>
              <p>
                Total Expense: <span>{networthData.totalExpense} LKR</span>
              </p>
              <p>
                Last Updated: <span>{networthData.lastUpdated}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="main-content">
          <div className="transaction-section">
            <div className="new-transaction">
              <h2>NEW TRANSACTION</h2>
              <div className="tabs">
                <button
                  className={`tab ${activeTab === "expense" ? "active" : ""}`}
                  onClick={() => setActiveTab("expense")}
                >
                  Expense
                </button>
                <button
                  className={`tab ${activeTab === "transfer" ? "active" : ""}`}
                  onClick={() => setActiveTab("transfer")}
                >
                  Transfer
                </button>
                <button
                  className={`tab ${activeTab === "income" ? "active" : ""}`}
                  onClick={() => setActiveTab("income")}
                >
                  Income
                </button>
              </div>

              <form onSubmit={handleSubmit} className="transaction-form">
                {activeTab === "expense" && (
                  <div className="form-content">
                    <div className="form-group">
                      <label>From</label>
                      <select
                        name="from"
                        onChange={handleChange}
                        className="transaction-from"
                      >
                        <option>Select</option>
                        {Object.keys(groupedAccounts).map((groupName) => (
                          <optgroup key={groupName} label={groupName}>
                            {groupedAccounts[groupName].map((account) => (
                              <option key={account._id} value={account.name}>
                                {account.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Amount</label>
                      <input
                        name="amount"
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e") {
                            e.preventDefault();
                          }
                        }}
                        min="0"
                        type="number"
                        onChange={handleChange}
                        className="transaction-amount"
                        placeholder="Amount"
                      />
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        name="date"
                        type="date"
                        onChange={handleChange}
                        className="transaction-date"
                      />
                    </div>
                    <div className="form-group">
                      <label>Tags</label>
                      <input
                        name="tags"
                        type="text"
                        onChange={handleChange}
                        className="transaction-tags"
                        placeholder="Choose existing tags or add new"
                      />
                    </div>
                    <div className="form-group">
                      <label>Note</label>
                      <input
                        name="note"
                        type="text"
                        onChange={handleChange}
                        className="transaction-note"
                        placeholder="Note"
                      />
                    </div>
                    <button type="submit" className="add-expense">
                      Add Expense
                    </button>
                  </div>
                )}
                {activeTab === "transfer" && (
                  <div className="form-content">
                    <div className="form-group">
                      <label>From</label>
                      <select
                        name="from"
                        onChange={handleChange}
                        className="transaction-from"
                      >
                        <option>Select</option>
                        {Object.keys(groupedAccounts).map((groupName) => (
                          <optgroup key={groupName} label={groupName}>
                            {groupedAccounts[groupName].map((account) => (
                              <option key={account._id} value={account.name}>
                                {account.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>To</label>
                      <select
                        name="to"
                        onChange={handleChange}
                        className="transaction-to"
                      >
                        <option>Select</option>
                        {Object.keys(groupedAccounts).map((groupName) => (
                          <optgroup key={groupName} label={groupName}>
                            {groupedAccounts[groupName].map((account) => (
                              <option key={account._id} value={account.name}>
                                {account.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Amount</label>
                      <input
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e") {
                            e.preventDefault();
                          }
                        }}
                        min="0"
                        name="amount"
                        type="number"
                        onChange={handleChange}
                        className="transaction-amount"
                        placeholder="Amount"
                      />
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        name="date"
                        type="date"
                        onChange={handleChange}
                        className="transaction-date"
                      />
                    </div>
                    <button type="submit" className="add-transfer">
                      Add Transfer
                    </button>
                  </div>
                )}
                {activeTab === "income" && (
                  <div className="form-content">
                    <div className="form-group">
                      <label>To</label>
                      <select
                        name="to"
                        onChange={handleChange}
                        className="transaction-to"
                      >
                        <option>Select</option>
                        {Object.keys(groupedAccounts).map((groupName) => (
                          <optgroup key={groupName} label={groupName}>
                            {groupedAccounts[groupName].map((account) => (
                              <option key={account._id} value={account.name}>
                                {account.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Amount</label>
                      <input
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e") {
                            e.preventDefault();
                          }
                        }}
                        min="0"
                        name="amount"
                        type="number"
                        onChange={handleChange}
                        className="transaction-amount"
                        placeholder="Amount"
                      />
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        name="date"
                        type="date"
                        onChange={handleChange}
                        className="transaction-date"
                      />
                    </div>
                    <div className="form-group">
                      <label>Note</label>
                      <input
                        name="note"
                        type="text"
                        onChange={handleChange}
                        className="transaction-note"
                        placeholder="Note"
                      />
                    </div>
                    <button type="submit" className="add-income">
                      Add Income
                    </button>
                  </div>
                )}
              </form>
            </div>
            <div className="recent-transactions">
              <h2>RECENT TRANSACTIONS</h2>
              <ul className="transaction-list">
                {recentTransactions.map((transaction) => (
                  <li key={transaction._id} className="transaction-item">
                    <span className="transaction-date">
                      {formatDate(transaction.date)}
                    </span>
                    <span className="transaction-details">
                      {transaction.type === "transfer" &&
                      activeTab === "transfer"
                        ? `${transaction.from} to ${transaction.to}`
                        : transaction.from || transaction.to}
                    </span>
                    <span className="transaction-amount">
                      {transaction.amount} {transaction.currency || "LKR"}
                    </span>
                    <FaTrash
                      className="delete-icon"
                      onClick={() => handleDelete(transaction._id)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="balances">
            <h3>BALANCES</h3>
            <table>
              <tbody>
                {Object.keys(groupedAccounts).map((groupName) => (
                  <React.Fragment key={groupName}>
                    <tr>
                      <td colSpan="2">
                        <h6>{groupName}</h6>
                      </td>
                    </tr>
                    {groupedAccounts[groupName].map((account) => (
                      <tr key={account._id}>
                        <td>{account.name}</td>
                        <td>{account.balance} LKR</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dash;
