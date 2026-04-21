import Ajv2020 from "ajv/dist/2020.js";
import { FRACTAL_METHODS, type GenerateCardRequest } from "../shared/types.js";

type AjvCtor = new (options: { allErrors: boolean }) => {
  compile: (schema: object) => {
    (value: unknown): boolean;
    errors?: Array<{ instancePath?: string; message?: string }>;
  };
};

const AjvResolved = Ajv2020 as unknown as AjvCtor;
const ajv = new AjvResolved({ allErrors: true });

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    method: { type: "string", enum: [...FRACTAL_METHODS] },
    seed: { type: "string", minLength: 1, maxLength: 200 }
  }
};

const validator = ajv.compile(schema);

export const validateGenerateRequest = (input: unknown): { ok: true; value: GenerateCardRequest } | { ok: false; message: string } => {
  if (!validator(input)) {
    const message =
      validator.errors?.map((error: { instancePath?: string; message?: string }) => `${error.instancePath || "/"} ${error.message}`).join("; ") ??
      "Invalid request.";
    return { ok: false, message };
  }
  return { ok: true, value: input as GenerateCardRequest };
};
