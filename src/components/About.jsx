import React from 'react';

const About = () => {
  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">About DataFlowAI</h2>
        
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Our Platform</h3>
            <p className="text-gray-600 leading-relaxed">
              DataFlowAI is an interactive educational platform designed to help beginners understand 
              machine learning algorithms through visual, hands-on experiences. We believe that the best way to 
              learn is by doing, so we've created intuitive visualizations that allow you to experiment with 
              different algorithms and see how they work in real-time.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              Our mission is to democratize machine learning education by making complex algorithms 
              accessible to everyone. We aim to bridge the gap between theoretical knowledge and practical 
              understanding, enabling users to gain insights into how different algorithms process data and make predictions.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-gray-700">What You Can Do Here</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-700 mb-2">Linear Regression</h4>
                <p className="text-gray-600">Experiment with fitting lines to data points and understand how linear regression predicts continuous values.</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-700 mb-2">Logistic Regression</h4>
                <p className="text-gray-600">Learn how logistic regression classifies data into categories with a probability-based approach.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-700 mb-2">K-Nearest Neighbors</h4>
                <p className="text-gray-600">Discover how KNN classifies data by looking at the closest neighboring points.</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-700 mb-2">K-Means Clustering</h4>
                <p className="text-gray-600">Visualize how K-means groups similar data points into clusters automatically.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Built For Learning</h3>
            <p className="text-gray-600 leading-relaxed">
              Each algorithm comes with interactive tutorials that guide you through the process step by step.
              You can create your own data points, adjust parameters, and see immediate visual feedback on how
              the algorithm performs. Performance metrics help you understand the effectiveness of your models,
              and detailed explanations provide context for what you're seeing.
            </p>
          </section>

          <section className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Project Information</h3>
            <p className="text-gray-600">
              DataFlowAI was developed as a Minor Project at MIT-AoE to help students visualize and understand 
              foundational machine learning concepts. It combines modern web technologies with educational 
              principles to create an engaging learning experience.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About; 