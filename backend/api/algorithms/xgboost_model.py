import random

import numpy as np
import xgboost as xgb


class XGBoostPredictor:
    def __init__(self, historical_data):
        self.historical_data = historical_data
        self.data_len = len(historical_data)
        self.window_size = 5  # Number of past issues to use as features

    def predict(self):
        if self.data_len < self.window_size + 10:
            return self._predict_random()

        # Prepare Data
        # Features: Flattened list of last `window_size` issues (Red1..6, Blue)
        # Targets: Red1, Red2, ..., Red6, Blue (Separate models for each)

        X = []
        y_reds = [[] for _ in range(6)]
        y_blue = []

        # Data is typically sorted DESC (newest first).
        # We need to iterate such that we use older data to predict newer data.
        # Let's reverse it locally for easier logic: Oldest -> Newest
        data_asc = self.historical_data[::-1]

        for i in range(self.window_size, len(data_asc)):
            # Features: Previous `window_size` draws
            features = []
            for j in range(self.window_size):
                idx = i - self.window_size + j
                features.extend(data_asc[idx]["red"])
                features.append(data_asc[idx]["blue"])
            X.append(features)

            # Targets
            current = data_asc[i]
            sorted_red = sorted(current["red"])
            for pos in range(6):
                y_reds[pos].append(sorted_red[pos])
            y_blue.append(current["blue"])

        X = np.array(X)
        y_reds = [np.array(y) for y in y_reds]
        y_blue = np.array(y_blue)

        # Train Models
        red_predictions = []
        for pos in range(6):
            model = xgb.XGBRegressor(objective="reg:squarederror", n_estimators=100, max_depth=3, learning_rate=0.1)
            model.fit(X, y_reds[pos])

            # Predict next
            last_features = []
            for j in range(self.window_size):
                idx = len(data_asc) - self.window_size + j
                last_features.extend(data_asc[idx]["red"])
                last_features.append(data_asc[idx]["blue"])

            pred = model.predict(np.array([last_features]))[0]
            red_predictions.append(int(round(pred)))

        # Blue Model (Classifier might be better for 1-16, but regressor is okay for trend)
        # Let's use Classifier for Blue since range is small (1-16)
        # Actually XGBClassifier expects classes 0..N-1. Blue is 1..16.
        # Let's stick to Regressor for consistency and robustness against missing classes in small data
        blue_model = xgb.XGBRegressor(objective="reg:squarederror", n_estimators=100, max_depth=3)
        blue_model.fit(X, y_blue)

        last_features = []
        for j in range(self.window_size):
            idx = len(data_asc) - self.window_size + j
            last_features.extend(data_asc[idx]["red"])
            last_features.append(data_asc[idx]["blue"])

        blue_pred = int(round(blue_model.predict(np.array([last_features]))[0]))
        blue_pred = max(1, min(16, blue_pred))

        # Post-process Reds (Unique, Range 1-33)
        red_predictions = [max(1, min(33, x)) for x in red_predictions]
        red_predictions = sorted(list(set(red_predictions)))

        # Fill missing if duplicates were removed
        while len(red_predictions) < 6:
            n = random.randint(1, 33)
            if n not in red_predictions:
                red_predictions.append(n)

        red_predictions.sort()

        return {"red": red_predictions, "blue": blue_pred}

    def _predict_random(self):
        reds = sorted(random.sample(range(1, 34), 6))
        blue = random.randint(1, 16)
        return {"red": reds, "blue": blue}
