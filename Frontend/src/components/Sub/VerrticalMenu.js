import React, { useState } from 'react';
import Dash from './Dash';
import Transection from './Transection';
import Accounts from './Accounts';
import Report from './Report';
import Profile from './Profile';

const VerticalMenu = ({ showMenu }) => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabClick = (index) => {
      setActiveTab(index);
    };
  
    return (
      <div className="vertical-menu">
        {showMenu && (
          <ul className="tab-list">
            <li className={activeTab === 0 ? "active" : ""} onClick={() => handleTabClick(0)}>Dashbord</li>
            <li className={activeTab === 1 ? "active" : ""} onClick={() => handleTabClick(1)}>Transaction</li>
            <li className={activeTab === 2 ? "active" : ""} onClick={() => handleTabClick(2)}>Accounts</li>
            <li className={activeTab === 3 ? "active" : ""} onClick={() => handleTabClick(3)}>Report</li>
            <li className={activeTab === 4 ? "active" : ""} onClick={() => handleTabClick(4)}>Profile</li>
          </ul>
        )}
        <div className="tab-content">
          <div className={`tab-pane ${activeTab === 0 ? "active" : ""}`}><Dash/></div>
          <div className={`tab-pane ${activeTab === 1 ? "active" : ""}`}><Transection/></div>
          <div className={`tab-pane ${activeTab === 2 ? "active" : ""}`}><Accounts/></div>
          <div className={`tab-pane ${activeTab === 3 ? "active" : ""}`}><Report/></div>
          <div className={`tab-pane ${activeTab === 4 ? "active" : ""}`}><Profile/></div>

        </div>
      </div>
    );
  }
export default VerticalMenu;
