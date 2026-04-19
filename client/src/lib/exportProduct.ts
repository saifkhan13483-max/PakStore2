import { type Product } from "@shared/schema";

const BRAND = "PAKCART";
const SITE_URL = "https://pakcart.store";
const SUPPORT_EMAIL = "support@pakcart.store";

function separator(char = "=", len = 80) {
  return char.repeat(len);
}

export function formatProductBlock(product: Product, index?: number): string {
  const lines: string[] = [];
  const label = index !== undefined ? `[${index}] ` : "";

  lines.push(separator());
  lines.push(`${label}${product.name.toUpperCase()}`);
  lines.push(separator("-"));
  lines.push("");

  lines.push(`  Price          : Rs. ${product.price.toLocaleString()}`);
  if (product.originalPrice) {
    const saving = product.originalPrice - product.price;
    const pct = Math.round((saving / product.originalPrice) * 100);
    lines.push(`  Original Price : Rs. ${product.originalPrice.toLocaleString()} (${pct}% off)`);
  }
  if (typeof product.wholesalePrice === "number" && product.wholesalePrice > 0) {
    lines.push(`  Wholesale Price: Rs. ${product.wholesalePrice.toLocaleString()}`);
  }
  lines.push(`  In Stock       : ${product.inStock ? "Yes" : "No"}`);
  lines.push("");

  if (product.description) {
    lines.push("  DESCRIPTION");
    lines.push("  " + separator("-", 40));
    lines.push(`  ${product.description}`);
    lines.push("");
  }

  if (product.longDescription) {
    lines.push("  FULL DESCRIPTION");
    lines.push("  " + separator("-", 40));
    product.longDescription.split("\n").forEach((l) => lines.push(`  ${l}`));
    lines.push("");
  }

  if (product.features && product.features.length > 0) {
    lines.push("  KEY FEATURES");
    lines.push("  " + separator("-", 40));
    product.features.forEach((f) => lines.push(`    • ${f}`));
    lines.push("");
  }

  if (product.specifications && Object.keys(product.specifications).length > 0) {
    lines.push("  SPECIFICATIONS");
    lines.push("  " + separator("-", 40));
    Object.entries(product.specifications).forEach(([k, v]) =>
      lines.push(`    ${k}: ${v}`)
    );
    lines.push("");
  }

  if (product.images && product.images.length > 0) {
    lines.push("  PRODUCT IMAGES");
    lines.push("  " + separator("-", 40));
    product.images.forEach((img, i) => lines.push(`    ${i + 1}. ${img}`));
    lines.push("");
  }

  lines.push("  PRODUCT PAGE");
  lines.push("  " + separator("-", 40));
  lines.push(`    ${SITE_URL}/products/${product.slug}`);
  lines.push("");

  return lines.join("\n");
}

export function buildCatalogTxt(products: Product[]): string {
  const now = new Date().toLocaleString("en-PK", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const header = [
    separator(),
    `${" ".repeat(20)}${BRAND} — DROPSHIPPER PRODUCT CATALOG`,
    `${" ".repeat(20)}${SITE_URL}  |  ${SUPPORT_EMAIL}`,
    separator(),
    "",
    `  Generated  : ${now}`,
    `  Products   : ${products.length}`,
    `  Note       : All prices are in Pakistani Rupees (PKR).`,
    `               Wholesale prices are available on request.`,
    "",
  ].join("\n");

  const body = products
    .map((p, i) => formatProductBlock(p, i + 1))
    .join("\n");

  const footer = [
    separator(),
    `  © ${new Date().getFullYear()} ${BRAND}. For dropshipper use only.`,
    `  Contact us at ${SUPPORT_EMAIL} for wholesale pricing and support.`,
    separator(),
  ].join("\n");

  return `${header}\n${body}\n${footer}`;
}

export function buildSingleTxt(product: Product): string {
  const now = new Date().toLocaleString("en-PK", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const header = [
    separator(),
    `${" ".repeat(20)}${BRAND} — PRODUCT DETAILS`,
    `${" ".repeat(20)}${SITE_URL}  |  ${SUPPORT_EMAIL}`,
    separator(),
    "",
    `  Generated : ${now}`,
    "",
  ].join("\n");

  const footer = [
    separator(),
    `  © ${new Date().getFullYear()} ${BRAND}. For dropshipper use only.`,
    `  Contact: ${SUPPORT_EMAIL}`,
    separator(),
  ].join("\n");

  return `${header}\n${formatProductBlock(product)}\n${footer}`;
}

export function downloadTxt(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
