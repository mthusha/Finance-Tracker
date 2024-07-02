import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
} from "@mui/material";

const Profile = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

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
        const email = res.data.email;
        const userRes = await axios.get(
          `http://localhost:5000/api/users/email/${email}`
        );
        setUserData(userRes.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/users/${userData._id}`,
        userData,
        {
          headers: { "x-auth-token": token },
        }
      );
      setUserData(res.data);
    } catch (error) {
      console.error("Error updating user data:", error.response.data);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/users/${userData._id}`, {
        headers: { "x-auth-token": token },
      });
    } catch (error) {
      console.error("Error deleting user:", error.response.data);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ padding: "20px", marginTop: "20px" }}>
        <Typography variant="h4" align="center" gutterBottom>
          Profile
        </Typography>
        <form onSubmit={handleUpdate}>
          <Box mb={2}>
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              name="name"
              value={userData.name}
              onChange={handleChange}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              name="email"
              value={userData.email}
              onChange={handleChange}
              disabled
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Phone"
              variant="outlined"
              fullWidth
              name="phone"
              value={userData.phone}
              onChange={handleChange}
            />
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Button variant="contained" color="primary" type="submit">
              Update
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Profile;
