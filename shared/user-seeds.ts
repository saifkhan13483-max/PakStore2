export const SEED_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zainab",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Omar",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bilal",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayesha",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Hamza",
];

export const getRandomAvatar = () => {
  return SEED_AVATARS[Math.floor(Math.random() * SEED_AVATARS.length)];
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
  photoURL: SEED_AVATARS[i % SEED_AVATARS.length]
}));
