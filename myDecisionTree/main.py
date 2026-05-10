from collections import Counter


class MyDecisionTree:
    def __init__(self, max_depth=3, min_samples_split=2):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.tree = None

    def fit(self, X, y):
        self.tree = self._build_tree(X, y, depth=0)
        return self

    def predict(self, X):
        return [self._predict_one(row, self.tree) for row in X]

    def _build_tree(self, X, y, depth):
        if self._should_stop(y, depth):
            return self._make_leaf(y)

        split = self._find_best_split(X, y)
        if split is None:
            return self._make_leaf(y)

        left_X, left_y, right_X, right_y = self._split_data(
            X, y, split["feature_index"], split["threshold"]
        )

        return {
            "type": "node",
            "feature_index": split["feature_index"],
            "threshold": split["threshold"],
            "left": self._build_tree(left_X, left_y, depth + 1),
            "right": self._build_tree(right_X, right_y, depth + 1),
        }

    def _should_stop(self, y, depth):
        return (
            len(set(y)) == 1
            or depth >= self.max_depth
            or len(y) < self.min_samples_split
        )

    def _make_leaf(self, y):
        prediction = Counter(y).most_common(1)[0][0]
        return {"type": "leaf", "prediction": prediction}

    def _find_best_split(self, X, y):
        best_feature_index = None
        best_threshold = None
        best_score = float("inf")

        for feature_index in range(len(X[0])):
            feature_values = [row[feature_index] for row in X]
            thresholds = self._candidate_thresholds(feature_values)

            for threshold in thresholds:
                _, left_y, _, right_y = self._split_data(
                    X, y, feature_index, threshold
                )
                if not left_y or not right_y:
                    continue

                score = self._weighted_gini(left_y, right_y)

                if score < best_score:
                    best_score = score
                    best_feature_index = feature_index
                    best_threshold = threshold

        if best_feature_index is None or best_threshold is None:
            return None

        return {
            "feature_index": best_feature_index,
            "threshold": best_threshold,
            "score": best_score,
        }

    def _split_data(self, X, y, feature_index, threshold):
        left_X = []
        left_y = []
        right_X = []
        right_y = []

        for row, label in zip(X, y):
            if row[feature_index] <= threshold:
                left_X.append(row)
                left_y.append(label)
            else:
                right_X.append(row)
                right_y.append(label)

        return left_X, left_y, right_X, right_y

    def _candidate_thresholds(self, values) -> list[float]:
        values = sorted(set(values))
        thresholds = []

        for i in range(len(values) - 1):
            threshold = (values[i] + values[i + 1]) / 2
            thresholds.append(threshold)

        return thresholds

    def _gini(self, labels):
        counts = Counter(labels)
        total = len(labels)

        gini = 1
        for count in counts.values():
            probability = count / total
            gini -= probability**2

        return gini

    def _weighted_gini(self, left_y, right_y):
        total = len(left_y) + len(right_y)

        value = len(left_y) / total * self._gini(left_y) + len(
            right_y
        ) / total * self._gini(right_y)

        return value

    def _predict_one(self, row, node):
        if node["type"] == "leaf":
            return node["prediction"]

        if row[node["feature_index"]] <= node["threshold"]:
            return self._predict_one(row, node["left"])

        return self._predict_one(row, node["right"])


def main():
    # lebels = ["Age", "Money", "Buy?"]
    data = [[18, 1000, "No"], [20, 3000, "No"], [22, 6000, "Yes"], [25, 8000, "Yes"]]
    X = [row[:-1] for row in data]  # Extract features
    y = [row[-1] for row in data]  # Extract labels

    model = MyDecisionTree(max_depth=3)
    model.fit(X, y)

    print(model.tree)
    print(f"Prediction for [[19, 2000], [21, 5000]]: {model.predict([[19, 2000], [21, 5000]])}")


if __name__ == "__main__":
    main()
