import { callAustraliaPostApiPostcode } from "@/app/lib/serverSide/austpostPostcodeValidator/austpostPostcodeValidatorFunctions";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.MockedFunction<typeof axios>;

describe("callAustraliaPostApiPostcode", () => {
  it("should return an empty array when no matching locations are found", async () => {
    mockedAxios.mockResolvedValue({
      data: { localities: { locality: null } },
    });

    const result = await callAustraliaPostApiPostcode("0000");
    expect(result).toEqual([]);
  });

  it("should return a parsed response for a single matching location", async () => {
    mockedAxios.mockResolvedValue({
      status: 200,
      data: {
        localities: {
          locality: {
            location: "Sydney",
            state: "NSW",
            postcode: "2000",
          },
        },
      },
    });

    const result = await callAustraliaPostApiPostcode("2000");
    expect(result).toEqual([
      {
        location: "Sydney",
        state: "NSW",
        postcode: "2000",
      },
    ]);
  });

  it("should return a parsed response for multiple matching locations", async () => {
    mockedAxios.mockResolvedValue({
      status: 200,
      data: {
        localities: {
          locality: [
            { location: "Sydney", state: "NSW", postcode: "2000" },
            { location: "Sydney South", state: "NSW", postcode: "2001" },
          ],
        },
      },
    });

    const result = await callAustraliaPostApiPostcode("200");
    expect(result).toEqual([
      { location: "Sydney", state: "NSW", postcode: "2000" },
      { location: "Sydney South", state: "NSW", postcode: "2001" },
    ]);
  });

  it("should throw an error when the API call fails", async () => {
    mockedAxios.mockResolvedValue(new Error("API Error"));

    await expect(callAustraliaPostApiPostcode("2000")).rejects.toThrow(
      "Error parsing AustPost API call:"
    );
  });
});
