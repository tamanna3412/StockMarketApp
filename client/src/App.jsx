import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import User from "./User";
import User from "./User"
import "./app.css";
import Container from "./Container";

function App(){

    return(
    <Router>
        <Routes>
        <Route path="/" element={<Container />} />
        <Route path="/user" element={<User />} />
        </Routes>
    </Router>);
}

export default App;