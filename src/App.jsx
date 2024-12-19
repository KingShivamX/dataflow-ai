import React from "react"
import { Route, Routes } from "react-router-dom"
import Home from "./components/Home"
import Header from "./components/common/Header"
import Footer from "./components/common/Footer"

const App = () => {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
            <Footer />
        </>
    )
}

export default App
