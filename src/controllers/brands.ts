import { eq } from "drizzle-orm"
import {
  FormField,
  Middlewares,
  Post,
  Query,
  Request,
  Route,
  SuccessResponse,
  UploadedFile,
} from "tsoa";
import { z } from "zod";

import { db, supabase } from "../db/client";
import { ads, brands } from "../db/schema";
import { brandAdPostHandler } from "../handlers/brands";
import { adx402MiddlewareFactory } from "../middlewares/Adx402Payment";
import type { Adx402Request } from "../models/request";
import type { Adx402AsyncResponse } from "../models/response";
import logger from "../utils/logger";
import Adx402Controller from "../utils/response";

const payloadSchema = z.object({
  wallet: z
    .string()
    .regex(/^[A-Za-z0-9]+$/, { message: "Wallet must be alphanumeric" }),
  tags: z
    .array(
      z.string().regex(/^[A-Za-z][A-Za-z0-9]{0,9}$/, {
        message:
          "Each tag must start with a letter, be alphanumeric and max length 10",
      }),
    )
    .max(8, { message: "At most 8 tags are allowed" })
    .optional(),
  targetUrl: z.url().optional(),
});

export interface BrandRecord {
  id: string;
  walletAddress: string;
  name: string;
  status: string | null;
  createdAt: string | null;
}

export async function getBrandByWallet(wallet: string): Promise<BrandRecord | null> {
  const result = await db
    .select()
    .from(brands)
    .where(eq(brands.walletAddress, wallet))
    .limit(1);

  return result[0] ?? null;
}

export async function createBrand(wallet: string, name = "Unnamed Brand"): Promise<BrandRecord> {
  const [brand] = await db
    .insert(brands)
    .values({
      walletAddress: wallet,
      name,
      status: "active",
    })
    .returning();

  return brand;
}

export async function ensureBrand(wallet: string): Promise<BrandRecord> {
  const existing = await getBrandByWallet(wallet);
  if (existing) return existing;

  return await createBrand(wallet);
}

@Route("brand")
export class BrandController extends Adx402Controller {
  /**
   * Endpoint for brand to upload an ad (requires dynamic micropayment)
   */
  @Post("ad")
  @Middlewares([adx402MiddlewareFactory(brandAdPostHandler)])
  @SuccessResponse("201", "Ad created")
  public async uploadAd(
    @Request() req: Adx402Request,
    @Query() wallet: string,
    @UploadedFile() file: Express.Multer.File,
    @FormField() tags?: string, // comma-separated
    @FormField() targetUrl?: string,
  ): Adx402AsyncResponse<{ message: string; fileName: string }> {
    return this.asyncExecute(req, async () => {
      logger.info("🪙 Brand uploadAd request from wallet:", wallet);

      // 1️⃣ Basic validations
      if (!file) throw new Error("Missing file");
      if (!wallet) throw new Error("Missing wallet");
      // if (!file.mimetype.startsWith("image/")) {
      //   throw new Error("File must be an image");
      // }

      const parsedTags = (tags ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      let validated: z.infer<typeof payloadSchema>;
      try {
        validated = payloadSchema.parse({
          wallet,
          tags: parsedTags.length > 0 ? parsedTags : undefined,
          targetUrl,
        });
      } catch (zErr) {
        // If zod error, provide readable message
        if (zErr instanceof z.ZodError) {
          throw new Error(`Validation error`);
        }
        throw zErr;
      }

      // 3️⃣ Generate a unique path for file
      const fileExt = file.originalname.split(".").pop();
      const uniqueName = `${validated.wallet}-${crypto.randomUUID()}.${fileExt}`;

      // 4️⃣ Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("adx402-adbucket")
        .upload(uniqueName, file.buffer, {
          contentType: "image/png", // fallback for MVP
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Supabase upload error:", uploadError);
        throw new Error("Failed to upload image to storage");
      }

      // 5️⃣ Get the public URL (or signed URL)
      const {
        data: { publicUrl },
      } = supabase.storage.from("adx402-adbucket").getPublicUrl(uniqueName);

      // 6️⃣ Insert into ads table
      const newAd = {
        brandId: (await ensureBrand(validated.wallet)).id,
        imageUrl: publicUrl,
        targetUrl: validated.targetUrl || "",
        tags: validated.tags || [],
        aspectRatio: "16:9", // placeholder, compute later via sharp if needed
        creditBalance: 0,
        moderationStatus: "pending",
      };

      const [inserted] = await db.insert(ads).values(newAd).returning();

      logger.info(`✅ Ad ${inserted.id} created and pending moderation.`);

      return {
        message: "Ad successfully uploaded and pending moderation.",
        fileName: file.originalname,
        imageUrl: publicUrl,
      };
    });
  }
}
