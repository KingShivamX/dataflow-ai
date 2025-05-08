import React, { useState } from 'react';

const Information = () => {
  const [activeTab, setActiveTab] = useState('linear');

  const algorithms = [
    { id: 'linear', name: 'Linear Regression' },
    { id: 'logistic', name: 'Logistic Regression' },
    { id: 'knn', name: 'K-Nearest Neighbors' },
    { id: 'kmeans', name: 'K-Means Clustering' },
    { id: 'decision-tree', name: 'Decision Tree' },
    { id: 'naive-bayes', name: 'Naive Bayes' }
  ];

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Machine Learning Algorithms</h2>
        
        {/* Tab navigation */}
        <div className="flex flex-wrap border-b border-gray-200 mb-6">
          {algorithms.map(algo => (
            <button
              key={algo.id}
              className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                activeTab === algo.id 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(algo.id)}
            >
              {algo.name}
            </button>
          ))}
        </div>
        
        {/* Linear Regression */}
        {activeTab === 'linear' && (
          <div className="space-y-6">
            <section>
              <h3 className="text-2xl font-semibold mb-3 text-gray-700">Linear Regression</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Linear regression is a supervised learning algorithm used to predict continuous values.
                It models the relationship between a dependent variable and one or more independent variables.
              </p>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-700">Simple Linear Regression Formula:</h4>
                <div className="text-center text-lg font-serif">
                  <p>y = mx + b</p>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Where:</p>
                  <ul className="list-disc pl-6 mt-1">
                    <li>y is the predicted value (dependent variable)</li>
                    <li>m is the slope (coefficient)</li>
                    <li>x is the feature value (independent variable)</li>
                    <li>b is the y-intercept (bias)</li>
                  </ul>
                </div>
              </div>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-700">Cost Function (Mean Squared Error):</h4>
                <div className="text-center text-lg font-serif">
                  <p>MSE = (1/n) Σ(y_i - ŷ_i)²</p>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Where:</p>
                  <ul className="list-disc pl-6 mt-1">
                    <li>n is the number of data points</li>
                    <li>y_i is the actual value</li>
                    <li>ŷ_i is the predicted value</li>
                  </ul>
                </div>
              </div>
              
              <h4 className="font-semibold mb-2 text-gray-700">Key Characteristics:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Assumes a linear relationship between variables</li>
                <li>Minimizes the sum of squared differences between observed and predicted values</li>
                <li>Easily interpretable coefficients</li>
                <li>Can be extended to multiple variables (Multiple Linear Regression)</li>
                <li>Performance is evaluated using metrics like R², MSE, and MAE</li>
              </ul>
            </section>
          </div>
        )}
        
        {/* Logistic Regression */}
        {activeTab === 'logistic' && (
          <div className="space-y-6">
            <section>
              <h3 className="text-2xl font-semibold mb-3 text-gray-700">Logistic Regression</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Despite its name, logistic regression is a classification algorithm used to predict 
                categorical outcomes. It estimates the probability that an instance belongs to a 
                particular class.
              </p>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-700">Logistic Function (Sigmoid):</h4>
                <div className="text-center text-lg font-serif">
                  <p>P(y=1|x) = 1 / (1 + e^(-z))</p>
                  <p className="mt-2">where z = b₀ + b₁x₁ + b₂x₂ + ... + bₙxₙ</p>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Where:</p>
                  <ul className="list-disc pl-6 mt-1">
                    <li>P(y=1|x) is the probability that y=1 given x</li>
                    <li>e is the base of natural logarithms</li>
                    <li>z is the linear combination of features and weights</li>
                    <li>b are the coefficients</li>
                    <li>x are the feature values</li>
                  </ul>
                </div>
              </div>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-700">Cost Function (Log Loss):</h4>
                <div className="text-center text-lg font-serif">
                  <p>J(θ) = -[1/m] Σ[y·log(h(x)) + (1-y)·log(1-h(x))]</p>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Where:</p>
                  <ul className="list-disc pl-6 mt-1">
                    <li>m is the number of training examples</li>
                    <li>y is the actual class (0 or 1)</li>
                    <li>h(x) is the predicted probability</li>
                  </ul>
                </div>
              </div>
              
              <h4 className="font-semibold mb-2 text-gray-700">Key Characteristics:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Maps linear combinations of features to probabilities between 0 and 1</li>
                <li>Uses the sigmoid function to transform linear predictions</li>
                <li>Creates decision boundaries to separate classes</li>
                <li>Provides probabilities for classifications</li>
                <li>Performance is evaluated using accuracy, precision, recall, F1-score</li>
              </ul>
            </section>
          </div>
        )}
        
        {/* K-Nearest Neighbors */}
        {activeTab === 'knn' && (
          <div className="space-y-6">
            <section>
              <h3 className="text-2xl font-semibold mb-3 text-gray-700">K-Nearest Neighbors (KNN)</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                KNN is a non-parametric, instance-based learning algorithm that classifies new data points 
                based on the majority class of their k-nearest neighbors in the feature space.
              </p>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-700">Distance Measurement (Euclidean Distance):</h4>
                <div className="text-center text-lg font-serif">
                  <p>d(p, q) = √[(p₁ - q₁)² + (p₂ - q₂)² + ... + (pₙ - qₙ)²]</p>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Where:</p>
                  <ul className="list-disc pl-6 mt-1">
                    <li>d(p, q) is the distance between points p and q</li>
                    <li>p and q are points in n-dimensional space</li>
                    <li>p₁, p₂, ..., pₙ and q₁, q₂, ..., qₙ are the coordinates of the points</li>
                  </ul>
                </div>
              </div>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-700">Classification Rule:</h4>
                <div className="text-center text-lg font-serif">
                  <p>ŷ = argmax_c Σ I(y_i = c)</p>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Where:</p>
                  <ul className="list-disc pl-6 mt-1">
                    <li>ŷ is the predicted class</li>
                    <li>c is a class label</li>
                    <li>y_i is the class label of the i-th nearest neighbor</li>
                    <li>I(·) is the indicator function (1 if the argument is true, 0 otherwise)</li>
                    <li>The sum is over the k nearest neighbors</li>
                  </ul>
                </div>
              </div>
              
              <h4 className="font-semibold mb-2 text-gray-700">Key Characteristics:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Non-parametric: doesn't make assumptions about the underlying data distribution</li>
                <li>Instance-based: stores all training instances and uses them directly for prediction</li>
                <li>The choice of k affects the decision boundary complexity</li>
                <li>Sensitive to the scale of features</li>
                <li>Computationally expensive for large datasets</li>
                <li>Can be used for both classification and regression tasks</li>
              </ul>
            </section>
          </div>
        )}
        
        {/* K-Means Clustering */}
        {activeTab === 'kmeans' && (
          <div className="space-y-6">
            <section>
              <h3 className="text-2xl font-semibold mb-3 text-gray-700">K-Means Clustering</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                K-Means is an unsupervised learning algorithm that groups similar data points into k clusters
                by minimizing the variance within each cluster.
              </p>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-700">Objective Function:</h4>
                <div className="text-center text-lg font-serif">
                  <p>J = Σ_j=1^k Σ_i=1^n ||x_i^(j) - c_j||²</p>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Where:</p>
                  <ul className="list-disc pl-6 mt-1">
                    <li>J is the objective function to minimize</li>
                    <li>k is the number of clusters</li>
                    <li>n is the number of data points</li>
                    <li>x_i^(j) is the i-th data point belonging to the j-th cluster</li>
                    <li>c_j is the centroid of the j-th cluster</li>
                    <li>||x_i^(j) - c_j||² is the squared Euclidean distance</li>
                  </ul>
                </div>
              </div>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-700">Algorithm Steps:</h4>
                <ol className="list-decimal pl-6 mt-1 text-gray-600 space-y-2">
                  <li>
                    <strong>Initialize:</strong> Randomly place k centroids in the data space
                  </li>
                  <li>
                    <strong>Assign:</strong> Assign each data point to the nearest centroid, forming k clusters
                  </li>
                  <li>
                    <strong>Update:</strong> Recalculate the centroid of each cluster as the mean of all points in that cluster
                  </li>
                  <li>
                    <strong>Repeat:</strong> Repeat steps 2 and 3 until the centroids no longer move significantly or a maximum number of iterations is reached
                  </li>
                </ol>
              </div>
              
              <h4 className="font-semibold mb-2 text-gray-700">Key Characteristics:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Unsupervised: works without labeled data</li>
                <li>Requires the number of clusters (k) to be specified in advance</li>
                <li>Sensitive to initial placement of centroids</li>
                <li>Assumes clusters are spherical and equally sized</li>
                <li>May converge to local optima</li>
                <li>Scales well to large datasets</li>
                <li>Evaluated using metrics like inertia, silhouette score, and calinski-harabasz index</li>
              </ul>
            </section>
          </div>
        )}

        {activeTab === 'decision-tree' && (
          <div className="space-y-6">
            <section>
              <h3 className="text-2xl font-semibold mb-3 text-gray-700">Decision Tree</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                A Decision Tree is a supervised learning algorithm that splits the data recursively using conditions 
                on feature values to classify points. It's like asking a series of yes/no questions until a decision is made.
              </p>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-700">Key Concepts:</h4>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Uses conditions on feature values to split data into branches</li>
                  <li>Splits are chosen to maximize information gain or minimize impurity</li>
                  <li>Each leaf node represents a class prediction</li>
                  <li>Can handle both numerical and categorical features</li>
                </ul>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-700">Algorithm Steps:</h4>
                <ol className="list-decimal pl-6 space-y-2 text-gray-600">
                  <li>Start at the root node with all training data</li>
                  <li>Find the best feature and threshold to split the data</li>
                  <li>Create child nodes for each split</li>
                  <li>Recursively repeat steps 2-3 until stopping criteria are met</li>
                  <li>Assign class labels to leaf nodes</li>
                </ol>
              </div>

              <h4 className="font-semibold mb-2 text-gray-700">Key Characteristics:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Easy to understand and interpret</li>
                <li>Can handle non-linear relationships</li>
                <li>Prone to overfitting if not properly pruned</li>
                <li>Performance is measured using accuracy, confusion matrix, and tree depth</li>
              </ul>
            </section>
          </div>
        )}

        {activeTab === 'naive-bayes' && (
          <div className="space-y-6">
            <section>
              <h3 className="text-2xl font-semibold mb-3 text-gray-700">Naive Bayes</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Naive Bayes is a probabilistic classifier that assumes each feature is independent and normally 
                distributed within each class. It uses Bayes' theorem to predict the most likely class.
              </p>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-700">Bayes' Theorem:</h4>
                <div className="text-center text-lg font-serif">
                  <p>P(class|features) = P(features|class) × P(class) / P(features)</p>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Where:</p>
                  <ul className="list-disc pl-6 mt-1">
                    <li>P(class|features) is the posterior probability</li>
                    <li>P(features|class) is the likelihood</li>
                    <li>P(class) is the prior probability</li>
                    <li>P(features) is the evidence</li>
                  </ul>
                </div>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-700">Algorithm Steps:</h4>
                <ol className="list-decimal pl-6 space-y-2 text-gray-600">
                  <li>Calculate class priors (P(class))</li>
                  <li>For each class, calculate feature statistics (mean and standard deviation)</li>
                  <li>For prediction, calculate likelihood using Gaussian probability</li>
                  <li>Multiply likelihood by prior to get posterior probability</li>
                  <li>Choose class with highest posterior probability</li>
                </ol>
              </div>

              <h4 className="font-semibold mb-2 text-gray-700">Key Characteristics:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Fast and efficient training and prediction</li>
                <li>Works well with high-dimensional data</li>
                <li>Requires less training data than other algorithms</li>
                <li>Assumes features are conditionally independent</li>
                <li>Uses Gaussian distribution for continuous features</li>
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Information; 