import React from "react"
import { Route, Routes } from "react-router-dom"
import Home from "./components/Home"
import DatasetSelection from "./components/DatasetSelection"
import AlgorithmImplementation from "./components/AlgorithmImplementation"
import Visualization from "./components/Visualization"
import Header from "./components/common/Header"
import Footer from "./components/common/Footer"

const App = () => {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/dataset-selection"
                    element={<DatasetSelection />}
                />
                <Route
                    path="/algorithm-implementation"
                    element={<AlgorithmImplementation />}
                />
                <Route path="/visualization" element={<Visualization />} />
            </Routes>
            <Footer />
        </>
    )
}

export default App
