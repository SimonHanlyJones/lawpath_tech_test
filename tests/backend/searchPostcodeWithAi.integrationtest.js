/* eslint-disable @typescript-eslint/no-require-imports */
const axios = require("axios");

describe("GraphQL API Endpoint with AI Validation", () => {
  const endpoint = "http://localhost:3000/api/validatorProxy";

  it("should return valid true for correct suburb, postcode, and state using AI", async () => {
    jest.setTimeout(10000);
    const query = `
      query SearchPostcode($suburb: String!, $postcode: String!, $state: String!, $useAi: Boolean!) {
        searchPostcode(suburb: $suburb, postcode: $postcode, state: $state, useAi: $useAi) {
          valid
          reason
          badPostcode
          badState
          badSuburb
        }
      }
    `;

    const variables = {
      suburb: "Melbourne",
      postcode: "3000",
      state: "VIC",
      useAi: true,
    };

    const response = await axios.post(endpoint, { query, variables });

    expect(response.status).toBe(200);
    expect(response.data.errors).toBeUndefined();
    expect(response.data.data.searchPostcode.valid).toBe(true);
    expect(response.data.data.searchPostcode.reason).toBe("");
    expect(response.data.data.searchPostcode.badPostcode).toBe(false);
    expect(response.data.data.searchPostcode.badState).toBe(false);
    expect(response.data.data.searchPostcode.badSuburb).toBe(false);
  });

  it("should return valid false for incorrect suburb, postcode, and state using AI", async () => {
    jest.setTimeout(10000);
    const query = `
        query SearchPostcode($suburb: String!, $postcode: String!, $state: String!, $useAi: Boolean!) {
          searchPostcode(suburb: $suburb, postcode: $postcode, state: $state, useAi: $useAi) {
            valid
            reason
            badPostcode
            badState
            badSuburb
          }
        }
      `;

    const variables = {
      suburb: "InvalidSuburb",
      postcode: "9999",
      state: "ZZ",
      useAi: true,
    };

    const response = await axios.post(endpoint, { query, variables });

    expect(response.status).toBe(200);
    expect(response.data.errors).toBeUndefined();
    expect(response.data.data.searchPostcode.valid).toBe(false);
    expect(response.data.data.searchPostcode.reason).not.toBe("");
  });

  const additionalPositiveTestCases = [
    { state: "VIC", suburb: "Ferntree Gully", postcode: "3156", useAi: true },
    { state: "QLD", suburb: "Noosa Heads", postcode: "4567", useAi: true },
    { state: "NSW", suburb: "Broadway", postcode: "2007", useAi: true },
    { state: "NSW", suburb: "Surry Hills", postcode: "2010", useAi: true },
    { state: "WA", suburb: "Perth", postcode: "6000", useAi: true },
    { state: "SA", suburb: "Adelaide", postcode: "5000", useAi: true },
    { state: "SA", suburb: "Whyalla", postcode: "5600", useAi: true },
    { state: "TAS", suburb: "Hobart", postcode: "7000", useAi: true },
    { state: "TAS", suburb: "Launceston", postcode: "7250", useAi: true },
  ];

  additionalPositiveTestCases.forEach(({ state, suburb, postcode }) => {
    it(`should validate address using AI: ${suburb}, ${state}, ${postcode}`, async () => {
      jest.setTimeout(10000);
      const query = `
          query SearchPostcode($suburb: String!, $postcode: String!, $state: String!, $useAi: Boolean!) {
            searchPostcode(suburb: $suburb, postcode: $postcode, state: $state, useAi: $useAi) {
              valid
              reason
              badPostcode
              badState
              badSuburb
            }
          }
        `;

      const variables = { suburb, postcode, state, useAi: true };
      //   await setTimeout(() => {}, 200);

      const response = await axios.post(endpoint, { query, variables });

      expect(response.status).toBe(200);
      expect(response.data.errors).toBeUndefined();
      expect(response.data.data.searchPostcode.valid).toBe(true);
      expect(response.data.data.searchPostcode.reason).toBe("");
      expect(response.data.data.searchPostcode.badPostcode).toBe(false);
      expect(response.data.data.searchPostcode.badState).toBe(false);
      expect(response.data.data.searchPostcode.badSuburb).toBe(false);
    });
  });

  const additionalNegativeTestCases = [
    { state: "WA", suburb: "Fremantle", postcode: "6163", useAi: true },
    // { state: "QLD", suburb: "Brisbane", postcode: "4000", useAi: true },
  ];

  additionalNegativeTestCases.forEach(({ state, suburb, postcode }) => {
    it(`should invalidate address using AI: ${suburb}, ${state}, ${postcode}`, async () => {
      jest.setTimeout(10000);
      const query = `
          query SearchPostcode($suburb: String!, $postcode: String!, $state: String!, $useAi: Boolean!) {
            searchPostcode(suburb: $suburb, postcode: $postcode, state: $state, useAi: $useAi) {
              valid
              reason
              badPostcode
              badState
              badSuburb
            }
          }
        `;

      const variables = { suburb, postcode, state, useAi: true };

      const response = await axios.post(endpoint, { query, variables });

      expect(response.status).toBe(200);
      expect(response.data.errors).toBeUndefined();
      expect(response.data.data.searchPostcode.valid).toBe(false);
      expect(response.data.data.searchPostcode.reason).not.toBe("");
    });
  });
});
