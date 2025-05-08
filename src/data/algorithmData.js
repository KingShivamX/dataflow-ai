export const algorithmData = {
  "linear-regression": {
    title: "Linear Regression",
    description: "Linear Regression is a supervised learning algorithm used to predict continuous values. It works by finding the best-fitting line through a set of data points.",
    concepts: [
      "The goal is to find a linear relationship between input features and a target variable",
      "Uses the method of least squares to minimize the sum of squared differences between observed and predicted values",
      "The resulting line is defined by y = mx + b, where m is the slope and b is the y-intercept"
    ],
    realWorldUses: [
      "Predicting house prices based on features like size, location, etc.",
      "Forecasting sales based on advertising expenditure",
      "Estimating student performance based on study hours"
    ],
    keyPoints: [
      "Simple to understand and implement",
      "Works best with linear relationships",
      "Performance is measured using metrics like R², MSE, and MAE"
    ],
    image: "/images/linear-regression-info.svg"
  },
  "logistic-regression": {
    title: "Logistic Regression",
    description: "Logistic Regression is a supervised learning algorithm used for binary classification problems. It estimates the probability of an instance belonging to a particular class.",
    concepts: [
      "Uses the logistic (sigmoid) function to transform linear predictions into probability values between 0 and 1",
      "Decision boundary is the line where the probability equals 0.5",
      "Optimized using maximum likelihood estimation"
    ],
    realWorldUses: [
      "Predicting whether an email is spam or not",
      "Determining if a transaction is fraudulent",
      "Medical diagnosis (presence or absence of disease)"
    ],
    keyPoints: [
      "Despite the name, it's a classification algorithm, not regression",
      "Provides probability estimates, not just classifications",
      "Works well for linearly separable classes"
    ],
    image: "/images/logistic-regression-info.svg"
  },
  "knn": {
    title: "K-Nearest Neighbors (KNN)",
    description: "KNN is a simple, instance-based learning algorithm that classifies new data points based on the majority class of their k nearest neighbors.",
    concepts: [
      "Non-parametric algorithm that doesn't make assumptions about the data distribution",
      "Classification is based on proximity to other data points",
      "The value of k (number of neighbors to consider) is a hyperparameter"
    ],
    realWorldUses: [
      "Recommendation systems",
      "Credit scoring",
      "Image recognition"
    ],
    keyPoints: [
      "Simple to understand and implement",
      "No training phase - new predictions are made by computing distances to all data points",
      "Performance depends heavily on the choice of k and distance metric"
    ],
    image: "/images/knn-info.svg"
  },
  "kmeans": {
    title: "K-Means Clustering",
    description: "K-Means is an unsupervised learning algorithm that partitions data into k distinct clusters based on distance to the nearest cluster center.",
    concepts: [
      "Iteratively assigns data points to clusters and updates cluster centers",
      "Aims to minimize the sum of squared distances from points to their cluster centers",
      "The number of clusters (k) must be specified in advance"
    ],
    realWorldUses: [
      "Customer segmentation",
      "Image compression",
      "Anomaly detection"
    ],
    keyPoints: [
      "Simple and efficient algorithm for clustering",
      "Results can vary based on initial random selection of centroids",
      "Works best with spherical clusters of similar size"
    ],
    image: "/images/kmeans-info.svg"
  },
  "decision-tree": {
    title: "Decision Tree",
    description: "A Decision Tree is a supervised learning algorithm that splits the data recursively using conditions on feature values to classify points. It's like asking a series of yes/no questions until a decision is made.",
    concepts: [
      "Uses conditions on feature values to split data into branches",
      "Splits are chosen to maximize information gain or minimize impurity",
      "Each leaf node represents a class prediction",
      "Can handle both numerical and categorical features"
    ],
    realWorldUses: [
      "Medical diagnosis",
      "Credit risk assessment",
      "Customer churn prediction",
      "Fraud detection"
    ],
    keyPoints: [
      "Easy to understand and interpret",
      "Can handle non-linear relationships",
      "Prone to overfitting if not properly pruned",
      "Performance is measured using accuracy, confusion matrix, and tree depth"
    ],
    image: "/images/decision-tree-info.svg"
  },
  "naive-bayes": {
    title: "Naive Bayes",
    description: "Naive Bayes is a probabilistic classifier that assumes each feature is independent and normally distributed within each class. It uses Bayes' theorem to predict the most likely class.",
    concepts: [
      "Based on Bayes' theorem of probability",
      "Assumes features are conditionally independent given the class",
      "Uses Gaussian distribution for continuous features",
      "Calculates posterior probability for classification"
    ],
    realWorldUses: [
      "Spam email detection",
      "Text classification",
      "Sentiment analysis",
      "Medical diagnosis"
    ],
    keyPoints: [
      "Fast and efficient training and prediction",
      "Works well with high-dimensional data",
      "Requires less training data than other algorithms",
      "Performance is measured using accuracy and probability estimates"
    ],
    image: "/images/naive-bayes-info.svg"
  }
}; 