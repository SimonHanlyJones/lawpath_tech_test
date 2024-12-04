"use client";
import React, { useState } from "react";
import { gql, useLazyQuery } from "@apollo/client";

// Define the new query
const SEARCH_POSTCODE_QUERY = gql`
  query SearchPostcode($suburb: String!, $postcode: String!, $state: String!) {
    searchPostcode(suburb: $suburb, postcode: $postcode, state: $state) {
      valid
      reason
    }
  }
`;

function SearchPostcodePage() {
  const [message, setMessage] = useState(
    "Click the button to validate the postcode!"
  );

  // Use `useLazyQuery` to trigger the query on demand
  const [fetchPostcodeValidation, { loading, error }] = useLazyQuery(
    SEARCH_POSTCODE_QUERY,
    {
      variables: {
        suburb: "Sydney", // Hardcoded suburb
        postcode: "2000", // Hardcoded postcode
        state: "NSW", // Hardcoded state
      },
      onCompleted: (data) => {
        if (data?.searchPostcode.valid) {
          setMessage("Valid Postcode: " + data.searchPostcode.reason);
        } else {
          setMessage("Invalid Postcode: " + data.searchPostcode.reason);
        }
      },
      onError: (error) => {
        setMessage("Error validating postcode: " + error.message);
      },
    }
  );

  // Handle button click
  const handleClick = () => {
    fetchPostcodeValidation(); // Trigger the query
  };

  return (
    <div>
      <p>{loading ? "Loading..." : message}</p>
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
      <button onClick={handleClick} disabled={loading}>
        Validate Postcode
      </button>
    </div>
  );
}

export default SearchPostcodePage;
