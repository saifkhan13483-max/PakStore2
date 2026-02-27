import { z } from "zod";
import { baseDocumentSchema, firestoreTimestampSchema } from "./schema";

export const heroSlideSchema = baseDocumentSchema.extend({
  image: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  buttonText: z.string().min(1),
  buttonLink: z.string().min(1),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

export type HeroSlide = z.infer<typeof heroSlideSchema>;
export const insertHeroSlideSchema = heroSlideSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type InsertHeroSlide = z.infer<typeof insertHeroSlideSchema>;
