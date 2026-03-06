// Sprite sheet contains 18 avatars in a 3x6 grid (3 rows, 6 columns)
// Image: @assets/image_1772779678802.png
// Each avatar is roughly 1/6th width and 1/3rd height

export const SEED_AVATAR_SPRITE = "@assets/image_1772779678802.png";

export const SEED_AVATARS = Array.from({ length: 18 }).map((_, i) => ({
  id: `avatar-${i}`,
  row: Math.floor(i / 6),
  col: i % 6,
  // We'll use these indices to calculate background position in the UI
  index: i
}));

export const getRandomAvatar = () => {
  const index = Math.floor(Math.random() * SEED_AVATARS.length);
  return `sprite:${index}`;
};

export const SEED_PROFILES = [
  { name: "Ahmed Khan", email: "ahmed.khan@example.pk" },
  { name: "Sara Malik", email: "sara.malik@example.pk" },
  { name: "Zainab Bibi", email: "zainab.bibi@example.pk" },
  { name: "Omer Sheikh", email: "omer.sheikh@example.pk" },
  { name: "Fatima Ali", email: "fatima.ali@example.pk" },
  { name: "Bilal Hassan", email: "bilal.hassan@example.pk" },
].map((p, i) => ({
  ...p,
  photoURL: `sprite:${i % SEED_AVATARS.length}`
}));
