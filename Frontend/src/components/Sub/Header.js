import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import profile from "./assets/3.jpg";
import "@fortawesome/react-fontawesome";
import "@fortawesome/free-solid-svg-icons";
import { FaBars } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
import { FiRefreshCcw } from "react-icons/fi";
import { IoIosLogOut } from "react-icons/io";
import axios from "axios";
const Header = ({ handleMenuClick }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/Log");
        return;
      }
      try {
        const res = await axios.get(
          "http://localhost:5000/api/auth/validate-token",
          {
            headers: { "x-auth-token": token },
          }
        );
        setUserName(res.data.name);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        navigate("/Log");
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="admin-header">
      <div className="head_in">
        <div className="pros_dis_no1">
          <h1 style={{ fontSize: "25px" }}>Finance Tracker</h1>
        </div>
        <div className="ad_srch">
          <form action="#">
            <div style={{ position: "relative" ,display:'none'}}>
              <input
                type="text"
                placeholder="Search..."
                style={{
                  border: "none",
                  marginTop: "2px",
                  paddingRight: "30px",
                }}
              />
              <i
                style={{
                  position: "absolute",
                  top: "40%",
                  fontSize: "12px",
                  right: "10px",
                  transform: "translateY(-50%)",
                }}
                className="fas fa-search"
              ></i>
            </div>
          </form>
        </div>
        <div className="pros_ded_b">
          <div className="ad_h_but">
            <a onClick={handleMenuClick}>
              <i class="fa fa-bars" aria-hidden="true">
                <FaBars />
              </i>
            </a>
          </div>
        </div>
        <div className="pros_profile">
          <div
            className="prof_img"
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: "40px",
              marginTop: "15px",
              height: "40px",
            }}
          >
            {/* <img src={profile} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> */}
          </div>
        </div>
        <div className="ad_name">
          <div className="col header-menu-column">
            <div className="header-menu d-none d-xl-block go-top">
              <nav>
                <div className="ltn__main-menu">
                  <ul>
                    <li>
                      <Link style={{ fontSize: "12px" }} to="/about">
                        <a style={{ marginRight: "10px" }}>Hi, {userName}</a>
                        <i style={{ fontSize: "10px" }}>
                          <FaChevronDown />
                        </i>
                      </Link>
                      <ul className="sub-menu menu-pages-img-show">
                        <li>
                          <Link style={{ fontSize: "12px" }} to="/service">
                            <i
                              style={{ fontSize: "12px" }}
                              className="fa fa-history"
                              aria-hidden="true"
                            ></i>{" "}
                            Activity Log
                          </Link>
                        </li>
                        <li>
                          <Link style={{ fontSize: "12px" }} to="/service">
                            <i
                              style={{ fontSize: "12px", color: "red" }}
                              className="fa fa-sign-in"
                              aria-hidden="true"
                            ></i>{" "}
                            Signout
                          </Link>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "35px" }} className="message">
          <a style={{ fontSize: "20px" }} href="/">
            <FiRefreshCcw />
          </a>
        </div>
        <div style={{ marginTop: "17px" }} className="ad_noti">
          <a href="/">
            <i className="fa fa-bell" aria-hidden="true"></i>
          </a>
        </div>
        <div style={{ marginTop: "35px" }} className="ad_npoff">
          <Link href="/">
            <a style={{ fontSize: "20px" }} onClick={handleLogout}>
              <IoIosLogOut />{" "}
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
