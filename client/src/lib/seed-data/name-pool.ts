/**
 * Pakistani name pool for realistic seeded reviews.
 * Contains 80+ diverse names reflecting Punjabi, Sindhi, Pathan,
 * Balochi, and Urdu-speaking demographics. Each entry carries a
 * gender tag so avatars can be matched consistently.
 */

export interface SeedName {
  name: string;
  gender: "male" | "female";
}

export const NAME_POOL: SeedName[] = [
  { name: "Ahmed Khan", gender: "male" },
  { name: "Hassan Ali", gender: "male" },
  { name: "Bilal Malik", gender: "male" },
  { name: "Usman Sheikh", gender: "male" },
  { name: "Faisal Raza", gender: "male" },
  { name: "Zain ul Abideen", gender: "male" },
  { name: "Hamza Javed", gender: "male" },
  { name: "Omar Farooq", gender: "male" },
  { name: "Saad Qureshi", gender: "male" },
  { name: "Arslan Butt", gender: "male" },
  { name: "Tariq Mehmood", gender: "male" },
  { name: "Adnan Siddiqui", gender: "male" },
  { name: "Kamran Ashraf", gender: "male" },
  { name: "Nawaz Baloch", gender: "male" },
  { name: "Imran Rajput", gender: "male" },
  { name: "Junaid Ansar", gender: "male" },
  { name: "Waseem Akram", gender: "male" },
  { name: "Asif Raza", gender: "male" },
  { name: "M. Usman", gender: "male" },
  { name: "Ali R.", gender: "male" },
  { name: "Kashif Hussain", gender: "male" },
  { name: "Rizwan Ghani", gender: "male" },
  { name: "Shoaib Akhtar", gender: "male" },
  { name: "Aamir Latif", gender: "male" },
  { name: "Danish Haseeb", gender: "male" },
  { name: "Nabeel Mirza", gender: "male" },
  { name: "Sohail Zafar", gender: "male" },
  { name: "Fahad Nawaz", gender: "male" },
  { name: "Khurram Shafiq", gender: "male" },
  { name: "Waqar Younis", gender: "male" },
  { name: "Raza Gillani", gender: "male" },
  { name: "Talha Yousuf", gender: "male" },
  { name: "Rehan Aslam", gender: "male" },
  { name: "Noman Sabri", gender: "male" },
  { name: "Mudassar Nazar", gender: "male" },
  { name: "Zeeshan Haider", gender: "male" },
  { name: "Attiq ur Rehman", gender: "male" },
  { name: "Asim Azhar", gender: "male" },
  { name: "Salman Arif", gender: "male" },
  { name: "Babar Azam", gender: "male" },
  { name: "Ayesha Noor", gender: "female" },
  { name: "Fatima Zahra", gender: "female" },
  { name: "Hira Mustafa", gender: "female" },
  { name: "Sana Bukhari", gender: "female" },
  { name: "Maryam Iqbal", gender: "female" },
  { name: "Zainab Malik", gender: "female" },
  { name: "Sara Ali", gender: "female" },
  { name: "Mariam Tariq", gender: "female" },
  { name: "Nadia Rehman", gender: "female" },
  { name: "Rabia Imran", gender: "female" },
  { name: "Sadia Karim", gender: "female" },
  { name: "Bushra Ansari", gender: "female" },
  { name: "Amna S.", gender: "female" },
  { name: "Dr. Amna Saleem", gender: "female" },
  { name: "Mehwish Hayat", gender: "female" },
  { name: "Saima Chaudhry", gender: "female" },
  { name: "Naila Kiani", gender: "female" },
  { name: "Sumera Baig", gender: "female" },
  { name: "Kiran Aftab", gender: "female" },
  { name: "Uzma Gillani", gender: "female" },
  { name: "Lubna Shah", gender: "female" },
  { name: "Tahira Naqvi", gender: "female" },
  { name: "Rukhsana Parveen", gender: "female" },
  { name: "Shaista Lodhi", gender: "female" },
  { name: "Huma Aamir", gender: "female" },
  { name: "Noor ul Ain", gender: "female" },
  { name: "Iqra Aziz", gender: "female" },
  { name: "Dua Malik", gender: "female" },
  { name: "Madiha Waqas", gender: "female" },
  { name: "Zara Baloch", gender: "female" },
  { name: "Rimsha Tariq", gender: "female" },
  { name: "Aiman Khan", gender: "female" },
  { name: "Bismah Farooq", gender: "female" },
  { name: "Nimra Qasim", gender: "female" },
  { name: "Tooba Siddiqui", gender: "female" },
  { name: "Ambreen Fatima", gender: "female" },
  { name: "Palwasha Yusuf", gender: "female" },
  { name: "Gulnaz Shaheen", gender: "female" },
  { name: "Nasreen Akhtar", gender: "female" },
  { name: "Fariha Pervez", gender: "female" },
  { name: "Areeba Habib", gender: "female" },
];

/**
 * Returns a randomly selected name entry from the pool.
 */
export function getRandomName(): SeedName {
  return NAME_POOL[Math.floor(Math.random() * NAME_POOL.length)];
}

/**
 * Builds a DiceBear Avataaars avatar URL seeded by the reviewer's name
 * so the same name always gets the same avatar.
 */
export function getDiceBearUrl(name: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
}
