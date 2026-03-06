import defaultAvatar from "../client/src/assets/images/default-avatar.png";

// Fallback for missing seed avatars to unblock the build
const avatar1 = defaultAvatar;
const avatar2 = defaultAvatar;
const avatar3 = defaultAvatar;
const avatar4 = defaultAvatar;
const avatar5 = defaultAvatar;
const avatar6 = defaultAvatar;
const avatar7 = defaultAvatar;
const avatar8 = defaultAvatar;
const avatar9 = defaultAvatar;
const avatar10 = defaultAvatar;
const avatar11 = defaultAvatar;
const avatar12 = defaultAvatar;
const avatar13 = defaultAvatar;
const avatar14 = defaultAvatar;
const avatar15 = defaultAvatar;
const avatar16 = defaultAvatar;
const avatar17 = defaultAvatar;
const avatar18 = defaultAvatar;

export const SEED_AVATARS = [
  avatar1, avatar2, avatar3, avatar4, avatar5, avatar6,
  avatar7, avatar8, avatar9, avatar10, avatar11, avatar12,
  avatar13, avatar14, avatar15, avatar16, avatar17, avatar18
].map((url, i) => ({
  id: `avatar-${i}`,
  url,
  index: i
}));

export const getRandomAvatar = () => {
  const index = Math.floor(Math.random() * SEED_AVATARS.length);
  return SEED_AVATARS[index].url;
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
  photoURL: SEED_AVATARS[i % SEED_AVATARS.length].url
}));
