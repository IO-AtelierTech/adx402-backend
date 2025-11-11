export interface AdResponse {
  id: string;
  imageUrl: string;
  targetUrl: string;
  aspectRatio: string | null;
  brandId: string | null;
}

export interface TrackImpressionRequest {
  adId: string;
  slotId: string;
  wallet: string;
  viewerFingerprint?: string;
  viewerIp?: string;
}

export interface TrackClickRequest {
  impressionId: string;
}

export interface CreatePublisherRequest {
  walletAddress: string;
  domain: string;
  tags?: string[];
}

export interface CreateAdSlotRequest {
  wallet: string;
  slotId: string;
  tags?: string[];
  aspectRatios?: string[];
}

export interface PublisherResponse {
  id: string;
  walletAddress: string;
  domain: string;
  isVerified: boolean | null;
  trafficScore: number | null;
  tags: string[] | null;
  createdAt: string | null;
}

export interface AdSlotResponse {
  id: string;
  publisherId: string | null;
  slotId: string;
  tags: string[] | null;
  aspectRatios: string[] | null;
  createdAt: string | null;
}
