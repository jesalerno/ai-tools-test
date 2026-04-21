import type { GenerateCardRequest, GenerateCardResponse } from "./shared/types";

export const generateCard = async (request: GenerateCardRequest): Promise<GenerateCardResponse> => {
  const response = await fetch("/api/cards/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request)
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({ message: "Generation failed." }))) as { message?: string };
    throw new Error(payload.message ?? "Generation failed.");
  }
  return (await response.json()) as GenerateCardResponse;
};
