export type LinkedInOptimizeProfile = {
  headline: string;
  summary: string;
};

export type LinkedInOptimizeValidation =
  | { ok: true; headline: string; summary: string }
  | { ok: false; status: number; error: string };

export type LinkedInOptimizeResult = LinkedInOptimizeProfile & {
  mode: "rule-based-preview";
  recommendations: string[];
  disclaimer: string;
};

export function validateLinkedInOptimizeRequest(rawBody: string): LinkedInOptimizeValidation;
export function buildLinkedInRecommendations(
  profile: LinkedInOptimizeProfile
): LinkedInOptimizeResult;
