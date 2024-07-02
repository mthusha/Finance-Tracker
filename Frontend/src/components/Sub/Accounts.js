import React, { useState, useEffect } from "react";
import axios from "axios";

const Accounts = () => {
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);
  const [showEditAccountForm, setShowEditAccountForm] = useState(false);
  const [userName, setUserName] = useState("");
  const [accountsData, setAccountsData] = useState([]);
  const [currentEditAccount, setCurrentEditAccount] = useState(null);

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
        fetchAccountsData(res.data.email);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchAccountsData = async (userName) => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/accounts/${userName}`
        );
        setAccountsData(res.data);
      } catch (error) {
        console.error("Error fetching accounts data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleNewAccountClick = () => {
    setShowNewAccountForm(true);
  };

  const handleSaveAccount = async () => {
    const accountName = document.querySelector(
      "input[name='account-name']"
    ).value;
    const group = document.querySelector("select[name='group']").value;
    const balance = document.querySelector("input[name='usd-balance']").value;
    const currency = "LKR";

    const newAccount = {
      name: accountName,
      group: group,
      balance: 0,
      currency: currency,
      userName: userName,
    };

    try {
      const response = await fetch("http://localhost:5000/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAccount),
      });

      if (response.ok) {
        const savedAccount = await response.json();
        setAccountsData([...accountsData, savedAccount]);
        console.log("Account saved successfully");
      } else {
        console.error("Failed to save account");
      }
    } catch (error) {
      console.error("Error:", error);
    }

    setShowNewAccountForm(false);
  };

  const handleCloseForm = () => {
    setShowNewAccountForm(false);
    setShowEditAccountForm(false);
  };

  const handleEditClick = (account) => {
    setCurrentEditAccount(account);
    setShowEditAccountForm(true);
  };

  const handleSaveEditAccount = async () => {
    const accountName = document.querySelector(
      "input[name='edit-account-name']"
    ).value;
    const group = document.querySelector("select[name='edit-group']").value;

    const updatedAccount = {
      ...currentEditAccount,
      name: accountName,
      group: group,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/accounts/${updatedAccount._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedAccount),
        }
      );

      if (response.ok) {
        const updatedData = accountsData.map((account) =>
          account._id === updatedAccount._id ? updatedAccount : account
        );
        setAccountsData(updatedData);
        console.log("Account updated successfully");
      } else {
        console.error("Failed to update account");
      }
    } catch (error) {
      console.error("Error:", error);
    }

    setShowEditAccountForm(false);
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "This deletion only deletes your account, not transactions. You can delete transactions manually. Are you sure you want to delete this account?"
      )
    ) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/accounts/${currentEditAccount._id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          const updatedData = accountsData.filter(
            (account) => account._id !== currentEditAccount._id
          );
          setAccountsData(updatedData);
          console.log("Account deleted successfully");
        } else {
          console.error("Failed to delete account");
        }
      } catch (error) {
        console.error("Error:", error);
      }

      setShowEditAccountForm(false);
    }
  };

  const groupAccountsByCategory = () => {
    const groupedAccounts = {};
    accountsData.forEach((account) => {
      const category = account.group;
      if (groupedAccounts[category]) {
        groupedAccounts[category].push(account);
      } else {
        groupedAccounts[category] = [account];
      }
    });
    return groupedAccounts;
  };

  return (
    <div className="accounts">
      <button className="new-account" onClick={handleNewAccountClick}>
        + New
      </button>
      {showNewAccountForm && (
        <div className="new-account-form">
          <div className="form-content">
            <h2>New Account</h2>
            <label>
              Name
              <input type="text" name="account-name" required />
            </label>
            <label>
              Group
              <select name="group">
                <option value="cash">Cash</option>
                <option value="asset">Asset</option>
                <option value="credit">Credit</option>
                <option value="bank">Bank Account</option>
              </select>
            </label>
            <div className="currencies">
              <label>
                <input
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  readOnly="true"
                  min="0"
                  type="text"
                  name="usd-balance"
                  placeholder="Balance (Adjust the balance by treating it solely as income)"
                />
              </label>
            </div>
            <div className="form-actions">
              <button onClick={handleSaveAccount}>Save Account</button>
              <button onClick={handleCloseForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showEditAccountForm && (
        <div className="edit-account-form">
          <div className="form-content">
            <h2>Edit Account</h2>
            <label>
              Name
              <input
                type="text"
                name="edit-account-name"
                defaultValue={currentEditAccount.name}
                required
              />
            </label>
            <label>
              Group
              <select name="edit-group" defaultValue={currentEditAccount.group}>
                <option value="cash">Cash</option>
                <option value="asset">Asset</option>
                <option value="credit">Credit</option>
                <option value="bank">Bank Account</option>
              </select>
            </label>
            <div className="form-actions">
              <button onClick={handleSaveEditAccount}>Save Changes</button>
              <button onClick={handleDeleteAccount}>Delete Account</button>
              <button onClick={handleCloseForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {Object.keys(accountsData).length > 0 ? (
        Object.entries(groupAccountsByCategory()).map(
          ([category, accounts], index) => (
            <div key={index} className="account-category">
              <h2>{category}</h2>
              {accounts.map((account, idx) => (
                <div key={idx} className="account-item">
                  <div className="account-name">{account.name}</div>
                  <div className="account-amounts">
                    <div className={`amount ${account.currency}`}>
                      {account.balance} {account.currency}
                    </div>
                  </div>
                  <div className="account-edit">
                    <button onClick={() => handleEditClick(account)}>
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )
      ) : (
        <div>No accounts available</div>
      )}
      <style jsx>{`
        .accounts {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .new-account {
          background-color: #70bef3;
          color: white;
          border: none;
          padding: 10px 20px;
          margin-bottom: 20px;
          cursor: pointer;
          border-radius: 5px;
          font-size: 16px;
        }
        .new-account-form,
        .edit-account-form {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .form-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          width: 100%;
        }
        .form-content h2 {
          margin-top: 0;
        }
        .form-content label {
          display: block;
          margin-bottom: 10px;
        }
        .form-content input,
        .form-content select {
          width: 100%;
          padding: 8px;
          margin-top: 5px;
        }
        .currencies {
          display: flex;
          justify-content: space-between;
        }
        .currencies label {
          flex: 1;
          margin-right: 10px;
        }
        .form-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }
        .form-actions button {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        .form-actions button:nth-child(1) {
          background-color: #70bef3;
          color: white;
        }
        .form-actions button:nth-child(2) {
          background-color: #ccc;
          color: black;
        }
        .account-category {
          margin-bottom: 20px;
          background-color: #fff;
          padding: 10px;
          border-radius: 8px;
        }
        .account-category h2 {
          margin-bottom: 10px;
          font-size: 1.5em;
          color: #333;
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 5px;
        }
        .account-item {
          margin-left: 5%;
          max-width: 90%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          border-bottom: 1px solid #e0e0e0;
        }
        .account-item:last-child {
          border-bottom: none;
        }
        .account-name {
          flex: 2;
          font-weight: bold;
        }
        .account-amounts {
          flex: 3;
          display: flex;
          justify-content: space-around;
        }
        .amount {
          text-align: right;
          font-weight: bold;
        }
        .amount.USD {
          color: green;
        }
        .amount.EUR {
          color: black;
        }
        .amount.JPY {
          color: black;
        }
        .account-edit {
          flex: 1;
          text-align: right;
        }
        .account-edit button {
          border: none;
          background-color: #70bef3;
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          margin-right: 5px;
        }
      `}</style>
    </div>
  );
};

export default Accounts;
