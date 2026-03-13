import { useRef } from "react";
import { Link } from "wouter";
import { ChevronRight, Grid3X3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";
import type { Category, ParentCategory } from "@shared/schema";

interface MegaDropdownProps {
  isOpen: boolean;
  parentCategories: ParentCategory[];
  categories: Category[];
  hoveredParentId: string | null;
  onParentHover: (id: string) => void;
  onClose: () => void;
}

const PARENT_CATEGORY_EMOJIS: Record<string, string> = {
  default: "🛍️",
};

export function MegaDropdown({
  isOpen,
  parentCategories,
  categories,
  hoveredParentId,
  onParentHover,
  onClose,
}: MegaDropdownProps) {
  const activeParent =
    hoveredParentId
      ? parentCategories.find((p) => String(p.id) === hoveredParentId)
      : parentCategories[0];

  const activeSubCategories = categories.filter(
    (c) => String(c.parentCategoryId) === String(activeParent?.id)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute left-0 right-0 top-full bg-white shadow-2xl rounded-b-2xl border-t-2 border-green-500 overflow-hidden z-40"
          onMouseLeave={onClose}
        >
          <div className="flex">
            {/* Left panel: parent categories */}
            <div className="w-1/3 border-r border-gray-100 py-4">
              {parentCategories.map((parent) => {
                const isActive =
                  String(parent.id) === String(activeParent?.id);
                return (
                  <button
                    key={parent.id}
                    type="button"
                    onMouseEnter={() => onParentHover(String(parent.id))}
                    onClick={onClose}
                    className={cn(
                      "w-full flex items-center justify-between px-5 py-3 transition-colors text-left group",
                      isActive
                        ? "bg-green-50 text-green-800"
                        : "hover:bg-green-50 text-gray-700 hover:text-green-800"
                    )}
                    data-testid={`mega-dropdown-parent-${parent.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {PARENT_CATEGORY_EMOJIS[parent.slug] ??
                          PARENT_CATEGORY_EMOJIS.default}
                      </span>
                      <span className="text-sm font-medium">{parent.name}</span>
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-opacity",
                        isActive
                          ? "opacity-100 text-green-600"
                          : "opacity-0 group-hover:opacity-60"
                      )}
                    />
                  </button>
                );
              })}
            </div>

            {/* Right panel: sub-categories */}
            <div className="w-2/3 p-6">
              {activeSubCategories.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {activeSubCategories.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/collections/${sub.slug}`}
                      onClick={onClose}
                      data-testid={`mega-dropdown-sub-${sub.id}`}
                    >
                      <div className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-green-50 transition-colors cursor-pointer">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                          {sub.image ? (
                            <img
                              src={getOptimizedImageUrl(sub.image, {
                                width: 128,
                                height: 128,
                                crop: "fill",
                              })}
                              alt={sub.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <Grid3X3 className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-green-700 text-center line-clamp-2 transition-colors">
                          {sub.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[120px]">
                  <p className="text-sm text-gray-400">
                    No subcategories found
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="bg-green-50 py-3 text-center border-t border-green-100">
            <Link
              href="/categories"
              onClick={onClose}
              data-testid="mega-dropdown-view-all"
            >
              <span className="text-sm font-medium text-green-700 hover:text-green-900 transition-colors">
                View All Categories →
              </span>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
