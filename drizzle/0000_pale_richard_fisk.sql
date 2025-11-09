-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "ad_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag" text NOT NULL,
	CONSTRAINT "ad_tags_tag_key" UNIQUE("tag")
);
--> statement-breakpoint
CREATE TABLE "impressions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ad_id" uuid,
	"publisher_id" uuid,
	"slot_id" uuid,
	"viewer_fingerprint" text,
	"viewer_ip" "inet",
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "aspect_ratios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aspect_ratio" text NOT NULL,
	CONSTRAINT "aspect_ratios_aspect_ratio_key" UNIQUE("aspect_ratio")
);
--> statement-breakpoint
CREATE TABLE "clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"impression_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "publishers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" text NOT NULL,
	"domain" text NOT NULL,
	"verification_token" text,
	"is_verified" boolean DEFAULT false,
	"traffic_score" integer DEFAULT 0,
	"tags" text[],
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "publishers_wallet_address_key" UNIQUE("wallet_address"),
	CONSTRAINT "publishers_domain_key" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "ad_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publisher_id" uuid,
	"slot_id" text NOT NULL,
	"tags" text[],
	"aspect_ratios" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "settlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publisher_id" uuid,
	"start_period" date NOT NULL,
	"end_period" date NOT NULL,
	"impressions_count" integer,
	"clicks_count" integer,
	"reward_amount" numeric(20, 8),
	"tx_signature" text,
	"settled_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" text NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "brands_wallet_address_key" UNIQUE("wallet_address"),
	CONSTRAINT "brands_status_check" CHECK (status = ANY (ARRAY['active'::text, 'flagged'::text, 'banned'::text]))
);
--> statement-breakpoint
CREATE TABLE "ads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid,
	"image_url" text NOT NULL,
	"target_url" text NOT NULL,
	"tags" text[],
	"aspect_ratio" text,
	"credit_balance" integer DEFAULT 0,
	"start_time" timestamp,
	"end_time" timestamp,
	"moderation_status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "ads_moderation_status_check" CHECK (moderation_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))
);
--> statement-breakpoint
ALTER TABLE "impressions" ADD CONSTRAINT "impressions_ad_id_fkey" FOREIGN KEY ("ad_id") REFERENCES "public"."ads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impressions" ADD CONSTRAINT "impressions_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "public"."publishers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impressions" ADD CONSTRAINT "impressions_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "public"."ad_slots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_impression_id_fkey" FOREIGN KEY ("impression_id") REFERENCES "public"."impressions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_slots" ADD CONSTRAINT "ad_slots_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "public"."publishers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "public"."publishers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
*/