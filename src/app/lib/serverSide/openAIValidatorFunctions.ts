import { callAustraliaPostApiPostcode } from "@/pages/api/validatorProxy";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ChatCompletionToolMessageParam,
} from "openai/src/resources/chat/completions.js";

import { z } from "zod";

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

async function callAusPostOpenAiModel(
  messages: Array<ChatCompletionMessageParam>
) {
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

export async function openAiAddressValidator(
  postcode: string,
  suburb: string,
  state: string
) {
  try {
    // The function 'callAustraliaPostApiPostcode' is available, it provides the locations that match the postcode you are provided with.
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

    const response = await callAusPostOpenAiModel(messages);

    console.log("Response: ", response.choices[0].message);

    messages.push(response.choices[0].message);

    if (response.choices[0].finish_reason === "tool_calls") {
      if (
        !response.choices[0].message.tool_calls ||
        response.choices[0].message.tool_calls.length === 0
      ) {
        return {
          valid: false,
          reason: "An error occurred during validation.",
          badPostcode: false,
          badState: false,
          badSuburb: false,
        };
      }
      const toolCall = response.choices[0].message.tool_calls![0];
      console.log("ToolCall: ", toolCall);

      const ausPostApiArgs = JSON.parse(toolCall.function.arguments);

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
      console.log(messages);

      const validationResult = (await callAusPostOpenAiModel(messages))
        .choices[0];
      console.log("Validation Result:", validationResult.message.content);

      // TODO null check
      return JSON.parse(validationResult.message.content!);
    }

    return;
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
