import { z } from "zod";
import { baseDocumentSchema } from "./schema";

export const homepageSlideSchema = baseDocumentSchema.extend({
  image_url: z.string().min(1),
  image_webp_url: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  display_order: z.number().int().default(0),
});

export type HomepageSlide = z.infer<typeof homepageSlideSchema>;
export const insertHomepageSlideSchema = homepageSlideSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type InsertHomepageSlide = z.infer<typeof insertHomepageSlideSchema>;
