import { useState, useEffect } from "react";

const FetchDataWithKey = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log(data);
  useEffect(() => {
    fetch("https://us-central1-remax-api.cloudfunctions.net/api/propiedades", {
      method: "GET",
      headers: {
        "Authorization": "Bearer Hvh8n23m53.n7hiu32S09gh6tUj.JJpyfq.HioJ19J3RGgHJSIOop4t4t",
        "Content-Type": "application/json",
      },
    })
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error("Error:", error));
    
  }, []);
};

export default FetchDataWithKey;
