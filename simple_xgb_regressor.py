import numpy as np

class SimpleXGBoostRegressor:
    def __init__(self, n_estimators=10, learning_rate=0.1, max_depth=3):
        self.n_estimators = int(n_estimators)
        self.learning_rate = float(learning_rate)
        self.max_depth = int(max_depth)
        self.trees = []
        self.base_pred = None

    def _split(self, X, y, depth):
        if depth == self.max_depth or len(np.unique(y)) == 1:
            return float(np.mean(y))
        best_feature, best_thresh, best_loss = None, None, float('inf')
        n_samples, n_features = X.shape
        for feature in range(n_features):
            thresholds = np.unique(X[:, feature])
            for thresh in thresholds:
                left_mask = X[:, feature] <= thresh
                right_mask = X[:, feature] > thresh
                if left_mask.sum() == 0 or right_mask.sum() == 0:
                    continue
                left_y, right_y = y[left_mask], y[right_mask]
                loss = np.var(left_y) * left_y.size + np.var(right_y) * right_y.size
                if loss < best_loss:
                    best_feature, best_thresh, best_loss = feature, thresh, loss
        left_mask = X[:, best_feature] <= best_thresh
        right_mask = X[:, best_feature] > best_thresh
        return {
            'feature': int(best_feature),
            'threshold': float(best_thresh),
            'left': self._split(X[left_mask], y[left_mask], depth + 1),
            'right': self._split(X[right_mask], y[right_mask], depth + 1)
        }

    def _predict_tree(self, tree, x):
        if not isinstance(tree, dict):
            return float(tree)
        if x[tree['feature']] <= tree['threshold']:
            return self._predict_tree(tree['left'], x)
        else:
            return self._predict_tree(tree['right'], x)

    def fit(self, X, y):
        self.base_pred = float(np.mean(y))
        y_pred = np.full(y.shape, self.base_pred, dtype=float)
        for i in range(self.n_estimators):
            residuals = y - y_pred
            tree = self._split(X, residuals, 0)
            self.trees.append(tree)
            updates = np.array([self._predict_tree(tree, x) for x in X], dtype=float)
            y_pred = y_pred + self.learning_rate * updates
            if (i+1) % 5 == 0 or i == 0:
                mse = np.mean((y - y_pred) ** 2)
                print(f"Iter {i+1}/{self.n_estimators} — MSE: {mse:.4f}")

    def predict(self, X):
        y_pred = np.full(X.shape[0], self.base_pred, dtype=float)
        for tree in self.trees:
            updates = np.array([self._predict_tree(tree, x) for x in X], dtype=float)
            y_pred = y_pred + self.learning_rate * updates
        return y_pred
