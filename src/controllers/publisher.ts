import {
  Body,
  Get,
  Post,
  Query,
  Request,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";
import { eq, and, gt, sql } from "drizzle-orm";
import type { Request as ExRequest } from "express";

import { db } from "../db/client";
import { ads, adSlots, publishers, impressions, clicks } from "../db/schema";
import type { Adx402AsyncResponse } from "../models/response";
import { Adx402Error } from "../models/response";
import type {
  AdResponse,
  TrackImpressionRequest,
  TrackClickRequest,
  CreatePublisherRequest,
  CreateAdSlotRequest,
  PublisherResponse,
  AdSlotResponse,
} from "../models/publisher";
import Adx402Controller from "../utils/response";

@Route("publisher")
@Tags("Publisher")
export class PublisherController extends Adx402Controller {
  // Get an ad for a specific slot
  @Get("/ad")
  @SuccessResponse("200", "Ad retrieved successfully")
  public async getAd(
    @Request() req: ExRequest,
    @Query() wallet: string,
    @Query() slot: string,
  ): Adx402AsyncResponse<AdResponse | null> {
    return this.asyncExecute(req, async () => {
      // Find the publisher by wallet address
      const publisher = await db.query.publishers.findFirst({
        where: eq(publishers.walletAddress, wallet),
      });

      if (!publisher) {
        throw new Adx402Error({
          status: 404,
          code: "PUBLISHER_NOT_FOUND",
          message: "Publisher not found for the provided wallet address",
        });
      }

      // Find the ad slot by slot ID and publisher
      const adSlot = await db.query.adSlots.findFirst({
        where: and(
          eq(adSlots.slotId, slot),
          eq(adSlots.publisherId, publisher.id)
        ),
      });

      if (!adSlot) {
        throw new Adx402Error({
          status: 404,
          code: "AD_SLOT_NOT_FOUND",
          message: "Ad slot not found",
        });
      }
      
      // Find an appropriate ad
      const whereConditions = [
        gt(ads.creditBalance, 0),
        eq(ads.moderationStatus, "approved"),
        sql`(${ads.startTime} IS NULL OR ${ads.startTime} <= NOW())`,
        sql`(${ads.endTime} IS NULL OR ${ads.endTime} >= NOW())`
      ];

      if (adSlot.aspectRatios && adSlot.aspectRatios.length > 0) {
        whereConditions.push(
          sql`${ads.aspectRatio} = ANY(${adSlot.aspectRatios})`
        );
      }

      if (adSlot.tags && adSlot.tags.length > 0) {
        whereConditions.push(
          sql`${ads.tags} && ${adSlot.tags}`
        );
      }

      const availableAds = await db
        .select()
        .from(ads)
        .where(and(...whereConditions))
        .orderBy(sql`${ads.creditBalance} DESC`)
        .limit(1);

      if (availableAds.length === 0) {
        return null;
      }

      const selectedAd = availableAds[0];

      return {
        id: selectedAd.id,
        imageUrl: selectedAd.imageUrl,
        targetUrl: selectedAd.targetUrl,
        aspectRatio: selectedAd.aspectRatio,
        brandId: selectedAd.brandId,
      };
    });
  }

  // Track an impression and subtract a credit from the ad
  @Post("/track-impression")
  @SuccessResponse("200", "Impression tracked successfully")
  public async trackImpression(
    @Request() req: ExRequest,
    @Body() body: TrackImpressionRequest,
  ): Adx402AsyncResponse<{ impressionId: string }> {
    return this.asyncExecute(req, async () => {
      // Verify the publisher exists
      const publisher = await db.query.publishers.findFirst({
        where: eq(publishers.walletAddress, body.wallet),
      });

      if (!publisher) {
        throw new Adx402Error({
          status: 404,
          code: "PUBLISHER_NOT_FOUND",
          message: "Publisher not found for the provided wallet address",
        });
      }

      // Verify the ad slot exists and belongs to the publisher
      const adSlot = await db.query.adSlots.findFirst({
        where: and(
          eq(adSlots.slotId, body.slotId),
          eq(adSlots.publisherId, publisher.id)
        ),
      });

      if (!adSlot) {
        throw new Adx402Error({
          status: 404,
          code: "AD_SLOT_NOT_FOUND",
          message: "Ad slot not found",
        });
      }

      // Verify the ad exists and has credits
      const ad = await db.query.ads.findFirst({
        where: eq(ads.id, body.adId),
      });

      if (!ad) {
        throw new Adx402Error({
          status: 404,
          code: "AD_NOT_FOUND",
          message: "Ad not found",
        });
      }

      if (!ad.creditBalance || ad.creditBalance <= 0) {
        throw new Adx402Error({
          status: 400,
          code: "INSUFFICIENT_CREDITS",
          message: "Ad has insufficient credits",
        });
      }

      // Use a transaction to ensure atomicity
      const result = await db.transaction(async (tx) => {
        // Create the impression record
        const [impression] = await tx
          .insert(impressions)
          .values({
            adId: body.adId,
            publisherId: publisher.id,
            slotId: adSlot.id,
            viewerFingerprint: body.viewerFingerprint || null,
            viewerIp: body.viewerIp || null,
          })
          .returning({ id: impressions.id });

        // Subtract one credit from the ad
        await tx
          .update(ads)
          .set({
            creditBalance: sql`${ads.creditBalance} - 1`,
          })
          .where(eq(ads.id, body.adId));

        return impression;
      });

      return {
        impressionId: result.id,
      };
    });
  }

  // Track a click on an ad
  @Post("/track-click")
  @SuccessResponse("200", "Click tracked successfully")
  public async trackClick(
    @Request() req: ExRequest,
    @Body() body: TrackClickRequest,
  ): Adx402AsyncResponse<{ clickId: string }> {
    return this.asyncExecute(req, async () => {
      // Verify the impression exists
      const impression = await db.query.impressions.findFirst({
        where: eq(impressions.id, body.impressionId),
      });

      if (!impression) {
        throw new Adx402Error({
          status: 404,
          code: "IMPRESSION_NOT_FOUND",
          message: "Impression not found",
        });
      }

      // Create the click record
      const [click] = await db
        .insert(clicks)
        .values({
          impressionId: body.impressionId,
        })
        .returning({ id: clicks.id });

      return {
        clickId: click.id,
      };
    });
  }

  // Create a new publisher record
  @Post("/create")
  @SuccessResponse("201", "Publisher created successfully")
  public async createPublisher(
    @Request() req: ExRequest,
    @Body() body: CreatePublisherRequest,
  ): Adx402AsyncResponse<PublisherResponse> {
    return this.asyncExecute(req, async () => {
      // Check if publisher with this wallet address already exists
      const existingPublisher = await db.query.publishers.findFirst({
        where: eq(publishers.walletAddress, body.walletAddress),
      });

      if (existingPublisher) {
        throw new Adx402Error({
          status: 409,
          code: "PUBLISHER_ALREADY_EXISTS",
          message: "Publisher with this wallet address already exists",
        });
      }

      // Check if publisher with this domain already exists
      const existingDomain = await db.query.publishers.findFirst({
        where: eq(publishers.domain, body.domain),
      });

      if (existingDomain) {
        throw new Adx402Error({
          status: 409,
          code: "DOMAIN_ALREADY_EXISTS",
          message: "Publisher with this domain already exists",
        });
      }

      // Create the publisher record
      const [publisher] = await db
        .insert(publishers)
        .values({
          walletAddress: body.walletAddress,
          domain: body.domain,
          tags: body.tags || null,
          verificationToken: null,
          isVerified: false,
          trafficScore: 0,
        })
        .returning({
          id: publishers.id,
          walletAddress: publishers.walletAddress,
          domain: publishers.domain,
          isVerified: publishers.isVerified,
          trafficScore: publishers.trafficScore,
          tags: publishers.tags,
          createdAt: publishers.createdAt,
        });

      return publisher;
    });
  }

  // Create a new ad slot for a publisher
  @Post("/create-slot")
  @SuccessResponse("201", "Ad slot created successfully")
  public async createAdSlot(
    @Request() req: ExRequest,
    @Body() body: CreateAdSlotRequest,
  ): Adx402AsyncResponse<AdSlotResponse> {
    return this.asyncExecute(req, async () => {
      // Find the publisher by wallet address
      const publisher = await db.query.publishers.findFirst({
        where: eq(publishers.walletAddress, body.wallet),
      });

      if (!publisher) {
        throw new Adx402Error({
          status: 404,
          code: "PUBLISHER_NOT_FOUND",
          message: "Publisher not found for the provided wallet address",
        });
      }

      // Check if ad slot with this slotId already exists for this publisher
      const existingSlot = await db.query.adSlots.findFirst({
        where: and(
          eq(adSlots.slotId, body.slotId),
          eq(adSlots.publisherId, publisher.id)
        ),
      });

      if (existingSlot) {
        throw new Adx402Error({
          status: 409,
          code: "AD_SLOT_ALREADY_EXISTS",
          message: "Ad slot with this slotId already exists for this publisher",
        });
      }

      // Check if publisher already has 3 ad slots
      const existingSlots = await db.query.adSlots.findMany({
        where: eq(adSlots.publisherId, publisher.id),
      });

      if (existingSlots.length >= 3) {
        throw new Adx402Error({
          status: 400,
          code: "AD_SLOT_LIMIT_EXCEEDED",
          message: "Publisher has reached the maximum limit of 3 ad slots",
        });
      }

      // Create the ad slot record
      const [adSlot] = await db
        .insert(adSlots)
        .values({
          publisherId: publisher.id,
          slotId: body.slotId,
          tags: body.tags || null,
          aspectRatios: body.aspectRatios || null,
        })
        .returning({
          id: adSlots.id,
          publisherId: adSlots.publisherId,
          slotId: adSlots.slotId,
          tags: adSlots.tags,
          aspectRatios: adSlots.aspectRatios,
          createdAt: adSlots.createdAt,
        });

      return adSlot;
    });
  }
}