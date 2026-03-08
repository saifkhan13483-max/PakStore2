// Color palette for avatar backgrounds - consistent across the app
const AVATAR_COLORS = [
  "rgb(147, 51, 234)",    // Purple
  "rgb(239, 68, 68)",     // Red
  "rgb(59, 130, 246)",    // Blue
  "rgb(16, 185, 129)",    // Green
  "rgb(245, 158, 11)",    // Amber
  "rgb(168, 85, 247)",    // Violet
  "rgb(236, 72, 153)",    // Pink
  "rgb(34, 197, 94)",     // Emerald
];

// Generate a consistent color for a given name
export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}
