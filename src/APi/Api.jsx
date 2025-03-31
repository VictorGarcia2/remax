import { useState, useEffect } from "react";

const FetchDataWithKey = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
console.log(data)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://us-central1-remax-api.cloudfunctions.net/api/propiedades", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer Hvh8n23m53.n7hiu32S09gh6tUj.JJpyfq.HioJ19J3RGgHJSIOop4t4t" // API Key en los headers
          }
        });

        if (!response.ok) {
          throw new Error("Error en la solicitud");
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

};

export default FetchDataWithKey;
