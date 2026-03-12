import { z } from "zod";
import { baseDocumentSchema } from "./schema";

export const announcementTypeEnum = z.enum(["info", "promo", "warning", "success"]);
export type AnnouncementType = z.infer<typeof announcementTypeEnum>;

export const announcementSchema = baseDocumentSchema.extend({
  message: z.string().min(1, "Message is required").max(300, "Message must be 300 characters or fewer"),
  is_active: z.boolean().default(true),
  display_order: z.number().int().min(0).default(0),
  type: announcementTypeEnum.default("info"),
  link_url: z.string().url("Must be a valid URL").nullable().optional(),
  link_text: z.string().max(60).nullable().optional(),
});

export type Announcement = z.infer<typeof announcementSchema>;

export const insertAnnouncementSchema = announcementSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
