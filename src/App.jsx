import { Routes, Route } from "react-router-dom"
import Home from "./components/Home"
import Header from "./components/common/Header"
import Footer from "./components/common/Footer"
import LinearRegression from "./components/LinearRegression"
import KNN from "./components/KNN"
import KMeans from "./components/KMeans"
import Perceptron from "./components/Perceptron"
import NotFound from "./components/common/NotFound"

function App() {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/linear-regression"
                    element={<LinearRegression />}
                />
                <Route path="/knn" element={<KNN />} />
                <Route path="/kmeans" element={<KMeans />} />
                <Route path="/perceptron" element={<Perceptron />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
        </>
    )
}

export default App
