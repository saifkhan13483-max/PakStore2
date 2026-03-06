const avatar1 = "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772783000/1_vxmtih.jpg";
const avatar2 = "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772783006/2_vscjq0.jpg";
const avatar3 = "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772782998/3_wlpd9g.jpg";
const avatar4 = "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772783003/4_zfjcul.jpg";
const avatar5 = "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772782999/5_t6lqpu.jpg";
const avatar6 = "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772783000/6_buh7v5.jpg";
const avatar7 = "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772783001/7_yxeamm.jpg";
const avatar8 = "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772783019/8_jcbrb1.jpg";
const avatar9 = "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772783010/9_afptej.jpg";
const avatar10 = "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772783009/10_qjukal.jpg";
const avatar11 = "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772783004/11_pdirqv.jpg";
const avatar12 = "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772783009/12_g02kgl.jpg";
const avatar13 = "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772783011/13_pymumw.jpg";
const avatar14 = "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772783022/14_yjhevb.jpg";
const avatar15 = "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772783013/15_n19tdw.jpg";
const avatar16 = "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772783018/16_zzbo4b.jpg";
const avatar17 = "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772783016/17_h7lu5c.jpg";
const avatar18 = "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772783016/18_xma5eq.jpg";

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
