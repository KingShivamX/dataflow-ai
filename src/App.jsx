import React from "react"
import { Route, Routes } from "react-router-dom"
import Home from "./components/Home"
import DatasetSelection from "./components/DatasetSelection"
import AlgorithmImplementation from "./components/AlgorithmImplementation"
import Visualization from "./components/Visualization"

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dataset-selection" element={<DatasetSelection />} />
            <Route
                path="/algorithm-implementation"
                element={<AlgorithmImplementation />}
            />
            <Route path="/visualization" element={<Visualization />} />
        </Routes>
    )
}

export default App
