"use client";
import { fetchHello } from "@/app/apiCalls";
import React, { useState } from "react";

const HelloPage = () => {
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    try {
      const result = await fetchHello();
      setMessage(result);
    } catch (error) {
      setMessage("Error fetching data: " + error);
    }
  };

  return (
    <div>
      <p>{message || "Click the button to fetch data!"}</p>
      <button onClick={handleClick}>Fetch Hello</button>
    </div>
  );
};

export default HelloPage;
