import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import { Container, Typography, Grid, Paper, Box } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const ProfileWithChart = () => {
  const [activeTab, setActiveTab] = useState("expense");
  const [formData, setFormData] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [userName, setUserName] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [networthData, setNetworthData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    lastUpdated: "",
    inCome: 0,
  });

  const [monthlyData, setMonthlyData] = useState([]);

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
          ? new Date(
              Math.max(
                ...transactionsRes.data.map((tx) => new Date(tx.date).getTime())
              )
            )
              .toLocaleDateString("en-GB")
              .split("/")
              .reverse()
              .join("-")
          : "No transactions";

        setNetworthData({
          totalIncome: totalIncome,
          totalExpense: totalExpense,
          lastUpdated: lastTransactionDate,
          inCome: income,
        });
        const monthlyIncome = {};
        const monthlyExpense = {};

        transactionsRes.data.forEach((tx) => {
          const month = new Date(tx.date).toISOString().substring(0, 7);
          if (tx.type === "income") {
            monthlyIncome[month] =
              (monthlyIncome[month] || 0) + Number(tx.amount);
          } else if (tx.type === "expense") {
            monthlyExpense[month] =
              (monthlyExpense[month] || 0) + Number(tx.amount);
          }
        });

        const months = Array.from(
          new Set([
            ...Object.keys(monthlyIncome),
            ...Object.keys(monthlyExpense),
          ])
        ).sort();

        setMonthlyData(
          months.map((month) => ({
            month,
            income: monthlyIncome[month] || 0,
            expense: monthlyExpense[month] || 0,
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchUserData();
    fetchData();
  }, [userName]);

  const barData = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        label: "Amount",
        data: [networthData.inCome, networthData.totalExpense],
        backgroundColor: ["#4caf50", "#f44336"],
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Income vs Expenses",
      },
    },
  };

  const lineData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        label: "Monthly Income",
        data: monthlyData.map((d) => d.income),
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        fill: true,
      },
      {
        label: "Monthly Expense",
        data: monthlyData.map((d) => d.expense),
        borderColor: "#f44336",
        backgroundColor: "rgba(244, 67, 54, 0.2)",
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "month",
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Income and Expenses",
      },
    },
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: "20px" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Financial Overview
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Box>
              <Bar data={barData} options={barOptions} />
            </Box>
          </Paper>
          <Paper elevation={3} style={{ padding: "20px", marginTop: "20px" }}>
            <Box>
              <Line data={lineData} options={lineOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Typography variant="h6" gutterBottom>
              User Overview
            </Typography>
            <Box>
              <Typography variant="body1">
                Total Income: ${networthData.totalIncome}
              </Typography>
              <Typography variant="body1">
                Total Expense: ${networthData.totalExpense}
              </Typography>
              <Typography variant="body1">
                Last Updated: {networthData.lastUpdated}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfileWithChart;
