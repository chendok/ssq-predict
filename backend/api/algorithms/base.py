import random
from collections import Counter

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.neural_network import MLPClassifier, MLPRegressor

from .xgboost_model import XGBoostPredictor


class PredictionEngine:
    def __init__(self, historical_data=None):
        # historical_data should be a list of dicts: [{'red': [1,2,3,4,5,6], 'blue': 10}, ...]
        self.historical_data = historical_data if historical_data else []
        self.data_len = len(self.historical_data)

    def predict(self, algorithms=["random"]):
        results = {}
        confidence_scores = []

        for algo in algorithms:
            try:
                if algo == "random":
                    res = self._predict_random()
                    results["random"] = res
                    confidence_scores.append(0.5)
                elif algo == "markov":
                    res = self._predict_markov()
                    results["markov"] = res
                    confidence_scores.append(0.75)
                elif algo == "neural":
                    try:
                        res = self._predict_neural()
                    except Exception:
                        res = self._predict_random()
                    results["neural"] = res
                    confidence_scores.append(0.8)
                elif algo == "xgboost":
                    try:
                        predictor = XGBoostPredictor(self.historical_data)
                        res = predictor.predict()
                    except Exception:
                        res = self._predict_random()
                    results["xgboost"] = res
                    confidence_scores.append(0.85)
                elif algo == "regression":
                    res = self._predict_regression()
                    results["regression"] = res
                    confidence_scores.append(0.7)
                elif algo == "genetic":
                    res = self._predict_genetic()
                    results["genetic"] = res
                    confidence_scores.append(0.85)
                else:
                    res = self._predict_random()  # Fallback
                    results[algo] = res
                    confidence_scores.append(0.5)
            except Exception as e:
                print(f"Algorithm {algo} failed: {e}")
                res = self._predict_random()
                results[algo] = res
                confidence_scores.append(0.5)

        # Weighted combination logic (simplified: majority vote for red, average for blue)
        final_prediction = self._combine_results(results)

        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.5

        return {
            "red": final_prediction["red"],
            "blue": final_prediction["blue"],
            "confidence": avg_confidence,
            "details": results,
        }

    def _combine_results(self, results):
        if not results:
            return self._predict_random()

        all_reds = []
        all_blues = []

        for res in results.values():
            all_reds.extend(res["red"])
            all_blues.append(res["blue"])

        # Top 6 most common red balls
        red_counts = Counter(all_reds)
        most_common_reds = [num for num, _ in red_counts.most_common(6)]

        # If less than 6 unique numbers, fill with random unique numbers
        while len(most_common_reds) < 6:
            new_num = random.randint(1, 33)
            if new_num not in most_common_reds:
                most_common_reds.append(new_num)

        most_common_reds.sort()

        # Most common blue ball
        blue_counts = Counter(all_blues)
        most_common_blue = blue_counts.most_common(1)[0][0]

        return {"red": most_common_reds, "blue": most_common_blue}

    def _predict_random(self):
        reds = sorted(random.sample(range(1, 34), 6))
        blue = random.randint(1, 16)
        return {"red": reds, "blue": blue}

    def _predict_markov(self):
        if self.data_len < 10:
            return self._predict_random()

        # Simplified Markov: Analyze transition from last issue's numbers
        last_issue = self.historical_data[0]  # Assumes sorted desc
        last_reds = set(last_issue["red"])

        # Count transitions
        transition_counts = {i: Counter() for i in range(1, 34)}

        for i in range(self.data_len - 1):
            # current = self.historical_data[i + 1]["red"]
            # prev = self.historical_data[i]["red"]  # This is actually 'next' in time since sorted desc

            # Here we look at forward transition in time: prev (older) -> current (newer)
            # Since data is desc: data[i+1] (older) -> data[i] (newer)
            older = self.historical_data[i + 1]["red"]
            newer = self.historical_data[i]["red"]

            for num in older:
                for next_num in newer:
                    transition_counts[num][next_num] += 1

        # Predict based on last issue
        predicted_reds = []
        potential_reds = Counter()

        for num in last_reds:
            potential_reds.update(transition_counts[num])

        most_likely = [num for num, _ in potential_reds.most_common(6)]
        predicted_reds.extend(most_likely)

        # Fill if needed
        while len(predicted_reds) < 6:
            r = random.randint(1, 33)
            if r not in predicted_reds:
                predicted_reds.append(r)

        # Blue ball markov (simplified)
        blue_transitions = Counter()
        for i in range(self.data_len - 1):
            older = self.historical_data[i + 1]["blue"]
            newer = self.historical_data[i]["blue"]
            if older == last_issue["blue"]:
                blue_transitions[newer] += 1

        if blue_transitions:
            predicted_blue = blue_transitions.most_common(1)[0][0]
        else:
            predicted_blue = random.randint(1, 16)

        return {"red": sorted(predicted_reds[:6]), "blue": predicted_blue}

    def _predict_neural(self):
        if self.data_len < 50:
            return self._predict_random()

        # Prepare data for MLP
        # Input: last 5 issues (flattened), Output: current issue
        X = []
        y_red = []
        y_blue = []

        window_size = 5
        for i in range(self.data_len - window_size):
            # Input: window_size issues. Data is desc, so we take i+1 to i+window_size
            # We want to predict issue i based on i+1...i+5
            input_window = []
            for j in range(1, window_size + 1):
                input_window.extend(self.historical_data[i + j]["red"])
                input_window.append(self.historical_data[i + j]["blue"])
            X.append(input_window)

            # Target is simplified: we can't easily predict 6 numbers as multi-label classification directly well
            # with simple MLP. Instead, let's predict the SUM and AVERAGE of red balls to guide selection,
            # or use regression for each position
            # For simplicity in this demo: Predict each of the 6 positions (sorted)
            y_red.append(sorted(self.historical_data[i]["red"]))
            y_blue.append(self.historical_data[i]["blue"])

        if not X:
            return self._predict_random()

        # Train simple models
        # Red balls: Regressor for each position
        red_preds = []
        X = np.array(X)
        y_red = np.array(y_red)

        for pos in range(6):
            regr = MLPRegressor(random_state=1, max_iter=500).fit(X, y_red[:, pos])
            # Predict for next issue
            last_window = []
            for j in range(window_size):
                last_window.extend(self.historical_data[j]["red"])
                last_window.append(self.historical_data[j]["blue"])

            pred = regr.predict([last_window])[0]
            red_preds.append(int(round(pred)))

        # Ensure valid range and uniqueness
        red_preds = [max(1, min(33, x)) for x in red_preds]
        red_preds = list(set(red_preds))
        while len(red_preds) < 6:
            n = random.randint(1, 33)
            if n not in red_preds:
                red_preds.append(n)

        # Blue ball classifier
        clf = MLPClassifier(random_state=1, max_iter=500).fit(X, y_blue)
        blue_pred = clf.predict([last_window])[0]

        return {"red": sorted(red_preds[:6]), "blue": int(blue_pred)}

    def _predict_regression(self):
        if self.data_len < 20:
            return self._predict_random()

        # Linear Regression on position trends
        red_preds = []
        issues = np.array(range(self.data_len)).reshape(-1, 1)  # 0 is newest

        for pos in range(6):
            y = [self.historical_data[i]["red"][pos] for i in range(self.data_len)]
            reg = LinearRegression().fit(issues, y)
            # Predict "next" issue which would be index -1 in this relative scale
            pred = reg.predict([[-1]])[0]
            red_preds.append(int(round(pred)))

        # Ensure valid
        red_preds = [max(1, min(33, x)) for x in red_preds]
        red_preds = list(set(red_preds))
        while len(red_preds) < 6:
            n = random.randint(1, 33)
            if n not in red_preds:
                red_preds.append(n)

        # Blue ball regression
        y_blue = [self.historical_data[i]["blue"] for i in range(self.data_len)]
        reg_blue = LinearRegression().fit(issues, y_blue)
        blue_pred = int(round(reg_blue.predict([[-1]])[0]))
        blue_pred = max(1, min(16, blue_pred))

        return {"red": sorted(red_preds[:6]), "blue": blue_pred}

    def _predict_genetic(self):
        # Simplified Genetic Algorithm
        # Population: Random lottery tickets
        # Fitness: Match with recent history (frequency, hot/cold)

        population_size = 50
        generations = 20

        # Init population
        population = [self._predict_random() for _ in range(population_size)]

        # Calculate recent frequency for fitness
        recent_data = self.historical_data[:50]
        all_reds = [num for d in recent_data for num in d["red"]]
        red_freq = Counter(all_reds)

        def fitness(ticket):
            score = 0
            for r in ticket["red"]:
                score += red_freq.get(r, 0)
            return score

        for _ in range(generations):
            # Selection
            population.sort(key=fitness, reverse=True)
            top_half = population[: population_size // 2]

            # Crossover & Mutation
            new_pop = []
            while len(new_pop) < population_size:
                parent1 = random.choice(top_half)
                parent2 = random.choice(top_half)

                # Crossover
                child_red = list(set(parent1["red"][:3] + parent2["red"][3:]))
                while len(child_red) < 6:
                    child_red.append(random.randint(1, 33))
                child_red = child_red[:6]

                # Mutation (10% chance)
                if random.random() < 0.1:
                    child_red[random.randint(0, 5)] = random.randint(1, 33)

                # Ensure unique and sorted
                child_red = sorted(list(set(child_red)))
                while len(child_red) < 6:
                    n = random.randint(1, 33)
                    if n not in child_red:
                        child_red.append(n)
                    child_red.sort()

                new_pop.append({"red": child_red, "blue": random.choice([parent1["blue"], parent2["blue"]])})

            population = new_pop

        # Return best
        population.sort(key=fitness, reverse=True)
        return population[0]
