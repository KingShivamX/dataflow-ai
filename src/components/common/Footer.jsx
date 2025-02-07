const Footer = () => {
    return (
        <footer className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 shadow-lg">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <p className="text-gray-800 font-medium">
                            &copy; 2024 DataFlowAI. Minor Project MIT-AoE.
                        </p>
                    </div>
                    <div className="flex gap-6">
                        <a
                            href="#"
                            className="text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            About
                        </a>
                        <a
                            href="#"
                            className="text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            Contact
                        </a>
                        <a
                            href="#"
                            className="text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            Privacy
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
