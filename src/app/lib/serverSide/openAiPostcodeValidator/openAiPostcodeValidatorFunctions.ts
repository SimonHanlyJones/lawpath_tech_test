import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ChatCompletionToolMessageParam,
} from "openai/src/resources/chat/completions.js";

import { z } from "zod";
import { SearchPostcodeInterface } from "../../../interfaces/frontendBackendCommunication/SearchPostcodeInterface";
import { callAustraliaPostApiPostcode } from "../austpostPostcodeValidator/austpostPostcodeValidatorFunctions";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const tools: ChatCompletionTool[] = [
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
        // strict: true,
        function_call: "auto",
      },
    },
  },
];

// Zod parser needed to work with openAI api according to docs
const SearchPostcodeInterfaceZod = z.object({
  valid: z.boolean(),
  reason: z.string().nullable(),
  badPostcode: z.boolean(),
  badState: z.boolean(),
  badSuburb: z.boolean(),
});

/**
 * Calls the AusPost OpenAI model to perform a chat completion using the provided messages.
 * Utilizes the "gpt-4o" model with the custom tool for calling the AustPost Postcode validator API.
 *
 * @param {Array<ChatCompletionMessageParam>} messages - An array of message parameters to be sent to the OpenAI chat completion.
 * @returns {Promise<any>} - A promise that resolves with the response from the OpenAI chat completion.
 */
async function callAusPostOpenAiModel(
  messages: Array<ChatCompletionMessageParam>
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  return await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages,
    tools: tools,
    // function_call: { name: "callAustraliaPostApiPostcode" },
    response_format: zodResponseFormat(
      SearchPostcodeInterfaceZod,
      "validation_result"
    ),
    tool_choice: "auto",
  });
}

/*************  ✨ Codeium Command ⭐  *************/
/**
 * Handles the openAI chat completion process, including making initial calls and following up on any function calls
 * made by the model. The function will follow up on function calls until the model returns a result or maxes out
 * the number of allowed function calls. If the model does not return a valid result, an error is thrown.
 *
 * @param {Array<ChatCompletionMessageParam>} messages - An array of message parameters to be sent to the OpenAI chat completion.
 * @returns {Promise<SearchPostcodeInterface>} - A promise that resolves with the response from the OpenAI chat completion, in the format of SearchPostcodeInterface.
 */
/******  4fdf21a6-2263-4767-9d18-16d40e4f9dbf  *******/
async function openAiFunctionCallHandler(
  messages: Array<ChatCompletionMessageParam>
): Promise<SearchPostcodeInterface> {
  let response;

  // Make initial call to openAI, this should return a function call to query the AustPost Api
  try {
    response = await callAusPostOpenAiModel(messages);
  } catch (error) {
    throw new Error(`Error in initial call to openAi: ${error}`);
  }

  // We use a while loop to make sure the openAi model has made as many function calls as it wants to, up to a limit to protect our API access
  const MAX_TOOL_CALLS = 5;
  let toolCalls = 0;
  while (
    response.choices[0].finish_reason === "tool_calls" &&
    toolCalls < MAX_TOOL_CALLS
  ) {
    toolCalls++;
    // console.log("Response: ", response.choices[0].message);

    // check that we have a a valid function call
    messages.push(response.choices[0].message);
    if (
      !response.choices[0].message.tool_calls ||
      response.choices[0].message.tool_calls.length === 0
    ) {
      throw new Error("OpenAI API failed to properly form tool call");
    }
    const toolCall = response.choices[0].message.tool_calls![0];
    // console.log("ToolCall: ", toolCall);

    const ausPostApiArgs = JSON.parse(toolCall.function.arguments);

    // call the austpost API with the argument specified by the model, then supply the tool call output the the model
    try {
      const austPostApiResponse = await callAustraliaPostApiPostcode(
        ausPostApiArgs.postcode
      );
      const function_call_result_message: ChatCompletionToolMessageParam = {
        role: "tool",
        content: JSON.stringify({
          austPostApiResponse,
        }),
        tool_call_id: toolCall.id,
      };
      messages.push(function_call_result_message);
      // console.log(messages);

      response = await callAusPostOpenAiModel(messages);
    } catch (error) {
      throw new Error(
        `Error calling AustPost API, or in providing response to openAI model: ${error}`
      );
    }
  }

  // here we should have a clear response from the model, we check this and return the output in the required format
  if (
    response.choices[0].finish_reason !== "stop" ||
    response.choices[0].message.role !== "assistant" ||
    !response.choices[0].message.content
  ) {
    throw new Error(`OpenAi model failed to return meaningful output`);
  }

  try {
    const validationOutput: SearchPostcodeInterface = JSON.parse(
      response.choices[0].message.content
    );
    if (
      validationOutput.reason === null ||
      validationOutput.reason === undefined
    ) {
      validationOutput.reason = "";
    }
    return validationOutput;
  } catch (error) {
    throw new Error(`openAiModel output did not match scheme: ${error}`);
  }
}

/**
 * Calls the openAI model to validate the provided postcode, suburb, and state.
 * The model will return a valid/invalid result, along with a reason if invalid.
 *
 * @param postcode The postcode to validate
 * @param suburb The suburb to validate
 * @param state The state to validate
 * @returns A {SearchPostcodeInterface} object with the validation result
 */
export async function openAiAddressValidator(
  postcode: string,
  suburb: string,
  state: string
) {
  try {
    const messages: Array<ChatCompletionMessageParam> = [
      {
        role: "system",
        content: `
          You are a validator for Australian addresses. Validate whether the provided combination of postcode, suburb, and state is valid.
        `,
      },
      {
        role: "user",
        content: `Validate the following:
        Postcode: ${postcode}
        Suburb: ${suburb}
        State: ${state}`,
      },
    ];

    return openAiFunctionCallHandler(messages);
  } catch (error) {
    console.error("Error:", error);

    return {
      valid: false,
      reason: "An error occurred during validation.",
      badPostcode: false,
      badState: false,
      badSuburb: false,
    };
  }
}
