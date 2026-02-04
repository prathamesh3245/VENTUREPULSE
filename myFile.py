from flask import Flask, request, jsonify
import joblib
from simple_xgb_regressor import SimpleXGBoostRegressor
import numpy as np
app = Flask(__name__)


model = joblib.load('simple_xgboost_model.pkl')
print("Model loaded successfully.")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        features = np.array(data["features"]).reshape(1, -1)
        prediction = model.predict(features).tolist()
        return jsonify({"prediction": prediction})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(port=5000)

    