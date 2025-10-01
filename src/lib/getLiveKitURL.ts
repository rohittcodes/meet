export function getLiveKitURL(baseURL: string, region?: string): string | undefined {
  if (!region) {
    return baseURL;
  }
  
  // Handle different region formats
  if (region.includes('.')) {
    return `wss://${region}`;
  }
  
  // Default to base URL if region format is not recognized
  return baseURL;
}
