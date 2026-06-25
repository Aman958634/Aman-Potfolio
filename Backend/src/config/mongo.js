// MongoDB support removed — project now uses MySQL for admin and content storage.
// This file is kept as a placeholder to avoid import errors; it no longer connects to MongoDB.
export const connectMongo = async () => {
  console.warn('connectMongo: MongoDB support removed. No action taken.');
};
