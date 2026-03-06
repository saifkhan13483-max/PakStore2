import avatar1 from "@assets/1_1772781276595.jpg";
import avatar2 from "@assets/2_1772781276596.jpg";
import avatar3 from "@assets/3_1772781276596.jpg";
import avatar4 from "@assets/4_1772781276597.jpg";
import avatar5 from "@assets/5_1772781276597.jpg";
import avatar6 from "@assets/6_1772781276598.jpg";
import avatar7 from "@assets/7_1772781276598.jpg";
import avatar8 from "@assets/8_1772781276599.jpg";
import avatar9 from "@assets/9_1772781276599.jpg";
import avatar10 from "@assets/10_1772781276599.jpg";
import avatar11 from "@assets/11_1772781276600.jpg";
import avatar12 from "@assets/12_1772781276600.jpg";
import avatar13 from "@assets/12_1772781276600.jpg"; // Using 12 as 13 in sequence if naming follows
import avatar14 from "@assets/14_1772781276601.jpg";
import avatar15 from "@assets/15_1772781276601.jpg";
import avatar16 from "@assets/16_1772781276601.jpg";
import avatar17 from "@assets/17_1772781276602.jpg";
import avatar18 from "@assets/18_1772781276602.jpg";

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
