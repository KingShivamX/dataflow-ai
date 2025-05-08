import React, { useState } from 'react';

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "What is machine learning?",
      answer: "Machine learning is a subset of artificial intelligence that allows systems to automatically learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data, learn from it, and make predictions or decisions."
    },
    {
      question: "What's the difference between supervised and unsupervised learning?",
      answer: "In supervised learning, algorithms learn from labeled training data and make predictions based on that data. The algorithm is 'supervised' because it's given the correct answers during training. Examples include Linear Regression and Logistic Regression. In unsupervised learning, algorithms find patterns in unlabeled data without guidance. It involves discovering hidden structures in data, like K-Means Clustering."
    },
    {
      question: "How do I choose the right algorithm for my problem?",
      answer: "The choice depends on several factors: the type of problem (classification, regression, clustering), the size and type of data, the desired accuracy, training time constraints, and the number of features. Start by understanding whether your problem involves prediction (supervised) or pattern discovery (unsupervised), then consider model complexity and interpretability requirements."
    },
    {
      question: "What is overfitting and how can I avoid it?",
      answer: "Overfitting occurs when a model learns the training data too well, capturing noise and random fluctuations rather than the underlying pattern, resulting in poor performance on new data. To avoid it: use more training data, apply regularization techniques, use cross-validation, simplify your model, or use ensemble methods."
    },
    {
      question: "What does the 'k' represent in K-Means and KNN?",
      answer: "In K-Means clustering, 'k' represents the number of clusters you want to divide your data into. In K-Nearest Neighbors (KNN), 'k' represents the number of nearest neighbors the algorithm considers when making a classification or regression prediction. In both cases, choosing an appropriate value for 'k' is crucial for model performance."
    },
    {
      question: "How is Linear Regression different from Logistic Regression?",
      answer: "Linear Regression predicts continuous values by fitting a linear equation to observed data, making it suitable for regression problems. Logistic Regression, despite its name, is used for binary classification problems. It uses a logistic function to model the probability that an instance belongs to a particular class."
    },
    {
      question: "What are common evaluation metrics for machine learning models?",
      answer: "For regression problems: Mean Squared Error (MSE), Root Mean Squared Error (RMSE), Mean Absolute Error (MAE), and R-squared. For classification problems: Accuracy, Precision, Recall, F1 Score, and Area Under the ROC Curve (AUC). For clustering: Silhouette Score, Davies-Bouldin Index, and Calinski-Harabasz Index."
    },
    {
      question: "How do I handle missing data in my dataset?",
      answer: "Common approaches include: removing rows with missing values (if data is abundant), imputing missing values using mean/median/mode, using algorithms that can handle missing values (like decision trees), predicting missing values using other features, or using advanced imputation techniques like K-Nearest Neighbors imputation or multiple imputation."
    },
    {
      question: "What is feature scaling and why is it important?",
      answer: "Feature scaling is the process of normalizing the range of features in a dataset. It's important because many algorithms (like KNN, K-Means, and gradient descent-based algorithms) perform better when features are on similar scales. Common scaling methods include Min-Max scaling, Standardization (z-score normalization), and Robust scaling."
    },
    {
      question: "How can I start learning machine learning?",
      answer: "Start with the fundamentals of statistics and linear algebra. Learn Python and essential libraries like NumPy, Pandas, and Scikit-learn. Take online courses from platforms like Coursera, edX, or Udacity. Work through tutorials and hands-on projects. Read introductory books like 'An Introduction to Statistical Learning.' Join communities and forums to ask questions and share knowledge. Most importantly, practice by working on real-world datasets and problems."
    }
  ];

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                className={`w-full text-left p-4 focus:outline-none flex justify-between items-center ${
                  openIndex === index ? 'bg-yellow-50' : 'bg-white'
                }`}
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-medium text-gray-800">{faq.question}</span>
                <span className="text-xl">{openIndex === index ? '−' : '+'}</span>
              </button>
              
              {openIndex === index && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Have more questions?</h3>
          <p className="text-gray-600">
            Explore our interactive visualizations to better understand how these algorithms work. 
            The best way to learn is by experimenting with the data and observing the results!
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQs; 