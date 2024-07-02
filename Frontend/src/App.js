import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "./components/css/Bootstrap.css";
import Dashbord from './components/Dashbord';
import Login from './components/Login';
// import './components/css/Header.css';
import "./components/css/Bootstrap.css";

function App() {
  return (
<Router>  
  <Routes>
     <Route path="/" element={<Dashbord/>}/>
     <Route path="/log" element={<Login/>}/>
   </Routes>
</Router>
  );
}

export default App;
