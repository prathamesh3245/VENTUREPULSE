import { useState } from "react"
import { AnalysisComponent } from "./analysis";
import { useAuth } from "../context/AuthContext";

export function DashboardComponent(){

    const [input, setInput] = useState("");
    const [result, setResult] = useState(null);
    const { getAuthHeaders, isAuthenticated } = useAuth();

  const sendRequest = async () => {
    const features = input.split(",").map(v => Number(v.trim()));

    try {
      const headers = isAuthenticated ? getAuthHeaders() : { "Content-Type": "application/json" };
      const res = await fetch("http://localhost:3000/getPredict", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ features }),
      });

      const data = await res.json();
      setResult(data);
      console.log("Response:", data);
    } catch (err) {
      console.log("Error:", err);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="1.5, 2.3, 0.7 ..."
        onChange={(e) => setInput(e.target.value)}
        className="border p-2"
      />

      <button onClick={sendRequest} className="bg-blue-500 p-2 text-white">
        Predict
      </button>

      {result && (
        <div className="mt-4">
          <b>Net Revenue Prediction:</b> {JSON.stringify(result)}
        </div>
      )}
    </div>
  );
}