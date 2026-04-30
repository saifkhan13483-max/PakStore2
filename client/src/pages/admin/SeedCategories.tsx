import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { categoryFirestoreService } from "@/services/categoryFirestoreService";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const PARENT_CATEGORIES = [
  { name: "Fashion & Accessories", slug: "fashion-accessories", description: "Bags, watches, shoes, jewelry & more" },
  { name: "Home & Decor", slug: "home-decor", description: "Bedsheets and home essentials" },
];

const SUB_CATEGORIES = [
  { name: "Watches", slug: "watches", parentSlug: "fashion-accessories", image: "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772789699/ChatGPT_Image_Mar_6_2026_12_57_08_PM_1_r0e1a4.png" },
  { name: "Bags & Wallets", slug: "bags-wallets", parentSlug: "fashion-accessories", image: "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772789701/ChatGPT_Image_Mar_6_2026_02_15_28_PM_1_t8uwak.png" },
  { name: "Bags", slug: "bags", parentSlug: "fashion-accessories", image: "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772789701/ChatGPT_Image_Mar_6_2026_02_15_28_PM_1_t8uwak.png" },
  { name: "Jewelry", slug: "jewelry", parentSlug: "fashion-accessories", image: "" },
  { name: "Stitched Dresses", slug: "stitched-dresses", parentSlug: "fashion-accessories", image: "" },
  { name: "Slippers", slug: "slippers", parentSlug: "fashion-accessories", image: "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772789698/ChatGPT_Image_Mar_6_2026_02_15_30_PM_1_glrglb.png" },
  { name: "Shoes", slug: "shoes", parentSlug: "fashion-accessories", image: "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772789706/ChatGPT_Image_Mar_6_2026_12_57_07_PM_1_ghqfjt.png" },
  { name: "Eid Special Collection", slug: "eid-special-collection", parentSlug: "fashion-accessories", image: "https://res.cloudinary.com/dftvtsjcg/image/upload/v1772792215/ChatGPT_Image_Mar_6_2026_03_12_34_PM_1_wdck6p.png" },
  { name: "Customizable Items", slug: "customizable-items", parentSlug: "fashion-accessories", image: "" },
  { name: "Bedsheets", slug: "bedsheets", parentSlug: "home-decor", image: "" },
];

type LogEntry = { kind: "ok" | "skip" | "err"; message: string };

export default function SeedCategories() {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const append = (entry: LogEntry) => setLogs((prev) => [...prev, entry]);

  const seed = async () => {
    setRunning(true);
    setLogs([]);

    try {
      const existingParents = await categoryFirestoreService.getAllParentCategories();
      const parentBySlug = new Map<string, string>();
      existingParents.forEach((p: any) => {
        if (p.slug) parentBySlug.set(p.slug, p.id);
      });

      for (const parent of PARENT_CATEGORIES) {
        if (parentBySlug.has(parent.slug)) {
          append({ kind: "skip", message: `Parent already exists: ${parent.name}` });
          continue;
        }
        try {
          const created = await categoryFirestoreService.createParentCategory({
            name: parent.name,
            slug: parent.slug,
            description: parent.description,
            image: "",
          });
          parentBySlug.set(parent.slug, created.id);
          append({ kind: "ok", message: `Created parent: ${parent.name}` });
        } catch (e: any) {
          append({ kind: "err", message: `Parent ${parent.name} failed: ${e.message}` });
        }
      }

      const existingCats = await categoryFirestoreService.getAllCategories();
      const existingCatSlugs = new Set(existingCats.map((c: any) => c.slug).filter(Boolean));

      for (const sub of SUB_CATEGORIES) {
        if (existingCatSlugs.has(sub.slug)) {
          append({ kind: "skip", message: `Category already exists: ${sub.name}` });
          continue;
        }
        const parentId = parentBySlug.get(sub.parentSlug);
        if (!parentId) {
          append({ kind: "err", message: `Missing parent for ${sub.name}` });
          continue;
        }
        try {
          await categoryFirestoreService.createCategory({
            name: sub.name,
            slug: sub.slug,
            description: `Premium ${sub.name} collection`,
            image: sub.image,
            parentCategoryId: parentId,
          });
          append({ kind: "ok", message: `Created category: ${sub.name}` });
        } catch (e: any) {
          append({ kind: "err", message: `Category ${sub.name} failed: ${e.message}` });
        }
      }

      toast({
        title: "Done",
        description: "Category seed finished. Check the log below.",
      });
    } catch (e: any) {
      append({ kind: "err", message: `Fatal error: ${e.message}` });
      toast({
        title: "Seed failed",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle data-testid="heading-seed-categories">Recreate Categories</CardTitle>
          <CardDescription>
            One-time tool to recreate the standard parent categories and sub-categories
            (Watches, Bags &amp; Wallets, Jewelry, Stitched Dresses, Slippers, Shoes, Eid
            Special Collection, Bedsheets, etc.). Existing items with the same slug are
            skipped, so it is safe to run more than once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={seed}
            disabled={running}
            size="lg"
            data-testid="button-seed-categories"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Seeding...
              </>
            ) : (
              "Seed Categories Now"
            )}
          </Button>

          {logs.length > 0 && (
            <div
              className="border rounded-md p-4 bg-muted/30 max-h-96 overflow-y-auto space-y-1 text-sm"
              data-testid="log-seed-categories"
            >
              {logs.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2"
                  data-testid={`log-entry-${i}`}
                >
                  {entry.kind === "ok" && (
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  )}
                  {entry.kind === "skip" && (
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  {entry.kind === "err" && (
                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  )}
                  <span
                    className={
                      entry.kind === "err"
                        ? "text-destructive"
                        : entry.kind === "skip"
                        ? "text-muted-foreground"
                        : ""
                    }
                  >
                    {entry.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
