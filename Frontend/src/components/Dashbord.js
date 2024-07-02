import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import Headder from './Sub/Header';
import VerticalMenu from "./Sub/VerrticalMenu";

const Dashbord = () => {
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();

    // Check authentication
    // useEffect(() => {
    //     const checkAuth = async () => {
    //         const token = localStorage.getItem('token');
    //         if (!token) {
    //             navigate('/Log');
    //             return;
    //         }
    //         try {
    //             const res = await axios.get('http://localhost:5000/api/auth/validate-token', {
    //                 headers: { 'x-auth-token': token }
    //             });
    //             if (!res.data.user) {
    //                 navigate('/Log');
    //             }
    //         } catch (error) {
    //             console.error(error);
    //             navigate('/Log');
    //         }
    //     };

    //     checkAuth();
    // }, [navigate]);

    // Update showMenu
    useEffect(() => {
        const updateShowMenu = () => {
            setShowMenu(window.innerWidth >= 1080);
        };
        updateShowMenu();
        window.addEventListener('resize', updateShowMenu);
        return () => {
            window.removeEventListener('resize', updateShowMenu);
        };
    }, []);

    const handleMenuClick = () => {
        setShowMenu(!showMenu);
    };

    return (
        <div>
            <Headder handleMenuClick={handleMenuClick} />
            <VerticalMenu showMenu={showMenu} />
        </div>
    );
}

export default Dashbord;
