import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fail, setFail] = useState(false);
  const [failEmail, setFailEmail] = useState(false);
  const [failPassword, setFailPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const navigate = useNavigate();
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get(
            "http://localhost:5000/api/auth/validate-token",
            {
              headers: {
                "x-auth-token": token,
              },
            }
          );
          if (res.data) {
            navigate("/");
          }
        } catch (error) {
          console.error(
            "Token validation failed:",
            error.response.data.message
          );
        }
      }
    };

    validateToken();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFail(true);
      setFailEmail(!email);
      setFailPassword(!password);
      setTimeout(() => {
        setFail(false);
        setFailEmail(false);
        setFailPassword(false);
      }, 5000);
    } else {
      try {
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email,
          password,
        });
        localStorage.setItem("token", res.data.token);
        navigate("/");
      } catch (error) {
        console.error(error);
        setFail(true);
        setFailEmail(true);
        setFailPassword(true);
        setTimeout(() => {
          setFail(false);
          setFailEmail(false);
          setFailPassword(false);
        }, 5000);
      }
    }
  };

  const handleRegisterToggle = () => {
    setShowRegister(!showRegister);
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        registerData
      );
      localStorage.setItem("token", res.data.token);
      setShowRegister(false);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="">
        <Link to="/" style={{ textDecoration: "none" }}>
          <div style={{ padding: "20px" }} className="head_l">
            <h1 style={{ color: "#70bef3" }}>Finance Tracker</h1>
          </div>
        </Link>
      </div>
      <div className="staff">
        <div className="ST_container">
          <h1>Sign in</h1>
          <div style={{ marginBottom: "10px" }}>
            <label>Please enter your credentials to access your account.</label>
          </div>
          <form onSubmit={handleLogin}>
            <input
              onChange={(e) => setEmail(e.target.value)}
              style={{
                borderColor: fail && !email ? "red" : "",
                color: failEmail ? "red" : "",
              }}
              value={failEmail ? "Invalid Credentials" : email}
              placeholder={fail && !email ? "Email required" : "Email"}
              type="text"
              name="email"
              id="email"
            />
            <input
              style={{
                borderColor: fail && !password ? "red" : "",
                color: failPassword ? "red" : "",
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={fail && !password ? "Password required" : "Password"}
              type="password"
              name="password"
              id="password"
            />
            <button type="submit">Login</button>
            <br />
          </form>
          <a style={{ color: "inherit" }}>If don't have an account</a>{" "}
          <a
            style={{ textDecoration: "underline" }}
            onClick={handleRegisterToggle}
          >
            Register here
          </a>
        </div>
      </div>

      {showRegister && (
        <div className="register-modal">
          <div className="register-container">
            <div style={{ marginLeft: "90%" }} className="close">
              <button
                style={{
                  background: "white",
                  color: "red",
                  fontWeight: "bold",
                }}
                onClick={handleRegisterToggle}
              >
                X
              </button>
            </div>
            <h1>Register</h1>
            <form onSubmit={handleRegisterSubmit}>
              <input
                name="name"
                placeholder="Name"
                value={registerData.name}
                onChange={handleRegisterChange}
                required
              />
              <input
                name="email"
                placeholder="Email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
              />
              <input
                name="phone"
                placeholder="Phone"
                value={registerData.phone}
                onChange={handleRegisterChange}
                required
              />
              <input
                name="password"
                placeholder="Password"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
              />
              <button type="submit">Register</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
