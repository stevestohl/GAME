import React from 'react'
import { createRoot } from 'react-dom/client'
// import EmployeeList from './EmployeeList.jsx'
import Page from './Page.jsx'
import { BrowserRouter as Router } from 'react-router-dom'


const root = createRoot(document.getElementById('content'))
root.render(
    <Router>
        <React.StrictMode>
            <Page />
        </React.StrictMode>
    </Router>
)