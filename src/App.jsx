import { useState } from "react"
import { Routes, Route } from "react-router-dom"
import Home from "./components/Home"
import Sidebar from "./components/common/Sidebar"
import Footer from "./components/common/Footer"
import LinearRegression from "./components/LinearRegression"
import LogisticRegression from "./components/LogisticRegression"
import KNN from "./components/KNN"
import KMeans from "./components/KMeans"
import DecisionTree from "./components/DecisionTree"
import NaiveBayes from "./components/NaiveBayes"
import About from "./components/About"
import Information from "./components/Information"
import FAQs from "./components/FAQs"
import NotFound from "./components/common/NotFound"
import Tutorial from "./components/common/Tutorial"
import { TutorialProvider } from "./contexts/TutorialContext"

function App() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const handleSidebarToggle = (collapsed) => {
        setIsSidebarCollapsed(collapsed);
    };

    return (
        <TutorialProvider>
            <div className="flex">
                <Sidebar onToggle={handleSidebarToggle} />
                <div 
                    className={`flex-1 transition-all duration-300 ${
                        isSidebarCollapsed ? 'ml-20' : 'ml-64'
                    }`}
                >
                    <Tutorial />
                    <main className="min-h-screen">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route
                                path="/linear-regression"
                                element={<LinearRegression />}
                            />
                            <Route
                                path="/logistic-regression"
                                element={<LogisticRegression />}
                            />
                            <Route path="/knn" element={<KNN />} />
                            <Route path="/kmeans" element={<KMeans />} />
                            <Route path="/decision-tree" element={<DecisionTree />} />
                            <Route path="/naive-bayes" element={<NaiveBayes />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/information" element={<Information />} />
                            <Route path="/faqs" element={<FAQs />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </div>
        </TutorialProvider>
    )
}

export default App
