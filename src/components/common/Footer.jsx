import React from "react"

const Footer = () => {
    return (
        <footer className="bg-blue-600 p-4">
            <div className="container mx-auto flex flex-col md:flex-row justify-center items-center">
                <p className="text-white text-center md:text-left mb-2 md:mb-0">
                    &copy; {new Date().getFullYear()} DataFlowAI. All rights
                    reserved.
                </p>
            </div>
        </footer>
    )
}

export default Footer
