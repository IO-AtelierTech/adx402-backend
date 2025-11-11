import vision from "@google-cloud/vision";

import env from "../env";

const client = new vision.ImageAnnotatorClient({
  keyFilename: env.GOOGLE_KEY_PATH,
});

export async function moderateImage(
  imageUrl: string,
): Promise<{ approved: boolean; reason: string; details?: any }> {
  const [result] = await client.safeSearchDetection(imageUrl);
  const safe = result.safeSearchAnnotation;

  if (!safe) return { approved: false, reason: "No safeSearch data" };

  const flags = {
    adult: safe.adult,
    violence: safe.violence,
    racy: safe.racy,
    medical: safe.medical,
  };

  // const levels = ["UNKNOWN", "VERY_UNLIKELY", "UNLIKELY", "POSSIBLE", "LIKELY", "VERY_LIKELY"];

  const isExplicit = Object.entries(flags).some(([_key, value]) =>
    ["LIKELY", "VERY_LIKELY"].includes(value as string),
  );

  return {
    approved: !isExplicit,
    reason: isExplicit ? "explicit content detected" : "safe",
    details: flags,
  };
}
