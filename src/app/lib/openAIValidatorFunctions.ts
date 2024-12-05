import OpenAI, { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

const tools = [
  {
    type: "function",
    function: {
      name: "callAustraliaPostApiPostcode",
      description:
        "Get a list of suburbs and states that correspond to the input postcode",
      parameters: {
        type: "object",
        properties: {
          postcode: { type: "string", description: "The postcode to lookup." },
        },
        required: ["postcode"],
      },
    },
  },
];

async function oneShotResponder() {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: "Find the suburbs for postcode 3000.",
        },
      ],
      functions: tools.map((tool) => tool.function),
      function_call: { name: "callAustraliaPostApiPostcode" },
    });

    // Extract the function call arguments
    const functionCallArguments =
      response.data.choices[0].message.function_call.arguments;

    // Parse the structured data and call the custom function
    const structuredData = JSON.parse(functionCallArguments);
    const apiResponse = await callAustraliaPostApiPostcode(structuredData);

    console.log("Australia Post API Response:", apiResponse);
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
}
