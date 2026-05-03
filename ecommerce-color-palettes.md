# E-Commerce Color Palettes — Ultimate Design Reference Guide

> The most comprehensive color guide for online store designers and developers.
> Research-backed insights from color psychology, A/B testing data, WCAG accessibility
> standards, cultural color studies, typography pairings, gradient trends, and real brand
> case studies — all in one place.

**Version:** 2.0 | **Last Updated:** May 2026 | **Coverage:** 20 industry palettes, 6 trend palettes, 4 seasonal palettes, color theory, CRO data, accessibility, CSS snippets, typography, regional meanings, tools & resources.

---

## Table of Contents

1. [How to Use This Guide](#1-how-to-use-this-guide)
2. [Color Theory Fundamentals for E-Commerce](#2-color-theory-fundamentals-for-e-commerce)
3. [Core Palettes by Industry](#3-core-palettes-by-industry) — 20 palettes
4. [Trend Palettes 2025–2026](#4-trend-palettes-20252026) — 6 palettes
5. [Seasonal & Campaign Palettes](#5-seasonal--campaign-palettes)
6. [Dark Mode Design System](#6-dark-mode-design-system)
7. [Real Brand Color Breakdowns](#7-real-brand-color-breakdowns)
8. [Color Psychology — Deep Research](#8-color-psychology--deep-research)
9. [Cultural & Regional Color Meanings](#9-cultural--regional-color-meanings)
10. [Typography + Color Pairings](#10-typography--color-pairings)
11. [Gradient & Duotone Trends](#11-gradient--duotone-trends)
12. [Email Marketing Color Guide](#12-email-marketing-color-guide)
13. [Social Media Color Guide](#13-social-media-color-guide)
14. [Accessibility & WCAG Standards](#14-accessibility--wcag-standards)
15. [CSS Custom Properties — Full Snippets](#15-css-custom-properties--full-snippets)
16. [Conversion Rate Optimization (CRO)](#16-conversion-rate-optimization-cro)
17. [Color Combination Rules](#17-color-combination-rules)
18. [How to Build Your Own Palette](#18-how-to-build-your-own-palette)
19. [Tools, Resources & Checklist](#19-tools-resources--checklist)

---

## 1. How to Use This Guide

### Color Token Definitions

Every palette uses the following standardized token system, matching modern design system conventions (Figma, Tailwind, Material Design):

| Token              | Role                                                                         |
|--------------------|------------------------------------------------------------------------------|
| `brand-primary`    | Core brand color — logo, hero headers, nav bar, dominant UI element         |
| `brand-secondary`  | Support color — sub-headers, icons, hover state backgrounds                  |
| `accent`           | Pop color — badges, highlights, sale labels, tags. Use very sparingly        |
| `accent-alt`       | Optional 4th color — used in illustrations, banners, alternating sections    |
| `bg-base`          | Main page background                                                         |
| `bg-surface`       | Card, panel, modal, dropdown background                                      |
| `bg-subtle`        | Alternate row, section separator, input field background                     |
| `text-primary`     | Headings & body text                                                         |
| `text-secondary`   | Captions, placeholders, metadata, timestamps                                 |
| `text-inverted`    | Text on dark backgrounds (usually white/near-white)                          |
| `cta`              | Call-to-action — "Add to Cart", "Buy Now", "Checkout" buttons                |
| `cta-hover`        | Darkened version of CTA (10–15% darker) for hover/focus state                |
| `success`          | In-stock, order confirmed, payment successful, trust badges                  |
| `warning`          | Low stock, limited time, expiring offers                                     |
| `error`            | Out-of-stock, payment failed, form error                                     |
| `info`             | Informational tooltips, shipping notes, size guide links                     |
| `border`           | Card outlines, dividers, input strokes                                       |
| `shadow`           | Box-shadow color (use with low opacity)                                      |

---

## 2. Color Theory Fundamentals for E-Commerce

Understanding color relationships helps you build harmonious, intentional palettes rather than guessing.

### The Color Wheel

The color wheel is divided into 12 hues. Colors are related to each other in predictable ways:

```
        YELLOW (60°)
       /              \
YELLOW-GREEN (90°)   YELLOW-ORANGE (30°)
     |                      |
  GREEN (120°)         ORANGE (0°/360°)
     |                      |
BLUE-GREEN (150°)      RED-ORANGE (330°)
       \              /
        BLUE (180°)
        /              \
BLUE-VIOLET (210°)    RED-VIOLET (300°)
     |                      |
  VIOLET (240°)         RED (0°/360°)
```

### 6 Color Harmony Schemes

#### 1. Monochromatic
**What it is:** Single hue with varying lightness and saturation.
**E-commerce use:** Ultra-premium and minimalist brands.
**Example:**
```
Base:       #1A3C5E  (Navy Blue — 210°, 56%, 23%)
Light:      #4A8AB5  (Sky Blue  — 210°, 42%, 50%)
Lighter:    #A8C8E0  (Mist Blue — 210°, 38%, 77%)
Background: #EEF4F9  (Ice Blue  — 210°, 44%, 95%)
```

#### 2. Analogous
**What it is:** 2–3 colors that sit next to each other on the wheel (within 30–60°).
**E-commerce use:** Harmonious, easy on the eye. Great for lifestyle, wellness, beauty stores.
**Example:** Blue (210°) + Teal (180°) + Green (150°)
```
Primary:   #1A3C5E  (Navy Blue)
Secondary: #1A6B6B  (Deep Teal)
Accent:    #2D6A4F  (Forest Green)
```

#### 3. Complementary
**What it is:** Two colors directly opposite on the wheel (180° apart). Maximum contrast.
**E-commerce use:** CTA buttons, sale banners, high-urgency sections.
**Example:** Blue (210°) + Orange (30°)
```
Brand:  #1A3C5E  (Navy Blue)
CTA:    #E8691E  (Bright Orange)
```

#### 4. Split-Complementary
**What it is:** A base color + two colors flanking its complement (150° & 210° away).
**E-commerce use:** Richer than complementary but still high contrast. Great for multi-category stores.
**Example:** Blue (210°) + Yellow-Orange (30°) + Red-Orange (350°)
```
Primary:    #1A3C5E  (Navy Blue)
Accent 1:   #F5A623  (Golden Yellow)
Accent 2:   #E8691E  (Warm Orange)
```

#### 5. Triadic
**What it is:** Three colors equally spaced on the wheel (120° apart).
**E-commerce use:** Playful, energetic stores (kids, games, lifestyle brands).
**Example:** Red (0°) + Yellow (120°) + Blue (240°)
```
Primary:    #E3000B  (LEGO Red)
Secondary:  #FFD600  (Sunshine Yellow)
Accent:     #003BFF  (Electric Blue)
```

#### 6. Tetradic (Rectangle)
**What it is:** Four colors in two complementary pairs (90° apart).
**E-commerce use:** Festive, seasonal, or highly expressive brand campaigns.
**Example:** Blue + Orange + Green + Red
```
Color A:  #003087  (Deep Navy)
Color B:  #E8691E  (Warm Orange)
Color C:  #2D6A4F  (Forest Green)
Color D:  #C1121F  (Chili Red)
```

### Color Temperature

| Temperature | Colors                  | Effect on Shoppers                        | Best Use                            |
|-------------|-------------------------|-------------------------------------------|-------------------------------------|
| Warm        | Red, Orange, Yellow     | Excites, stimulates appetite & urgency    | Food, fashion, sports, clearance    |
| Cool        | Blue, Green, Purple     | Calms, builds trust, reduces anxiety      | Finance, health, tech, insurance    |
| Neutral     | Gray, Beige, Brown      | Professional, grounded, timeless          | Furniture, B2B, minimalist brands   |

### Saturation & Lightness Strategy

| Saturation Level | Perception            | Use Case                              |
|------------------|-----------------------|---------------------------------------|
| High (80–100%)   | Bold, modern, exciting| Tech, sports, gaming, youth brands    |
| Medium (40–70%)  | Balanced, approachable| General retail, lifestyle, home goods |
| Low (10–30%)     | Refined, sophisticated| Luxury, wellness, premium, artisan    |

| Lightness Level  | Perception            | Use Case                              |
|------------------|-----------------------|---------------------------------------|
| Dark (10–30%)    | Authority, elegance   | Premium products, hero backgrounds    |
| Mid (40–60%)     | Energy, clarity       | Brand colors, icons, UI elements      |
| Light (80–95%)   | Openness, clean       | Page backgrounds, surface cards       |

---

## 3. Core Palettes by Industry

---

### Palette 01 — Classic & Trustworthy
**Industries:** Department stores, marketplace platforms, multi-category retail
**Inspired by:** Amazon, Walmart, Target, eBay
**Color Harmony:** Complementary (Blue + Orange)
**Mood:** Reliable, affordable, familiar

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Navy Blue       | `#1A3C5E` | 26, 60, 94     | 210°, 56%, 23%   |
| brand-secondary| Sky Blue        | `#2E86C1` | 46, 134, 193   | 204°, 61%, 47%   |
| accent         | Golden Yellow   | `#F5A623` | 245, 166, 35   | 37°, 90%, 55%    |
| accent-alt     | Coral Orange    | `#E07B39` | 224, 123, 57   | 24°, 71%, 55%    |
| bg-base        | Cool Gray       | `#F4F6F8` | 244, 246, 248  | 210°, 25%, 96%   |
| bg-surface     | Pure White      | `#FFFFFF` | 255, 255, 255  | 0°, 0%, 100%     |
| bg-subtle      | Pale Blue Gray  | `#EBF0F5` | 235, 240, 245  | 210°, 35%, 94%   |
| text-primary   | Deep Charcoal   | `#1D2D35` | 29, 45, 53     | 200°, 29%, 16%   |
| text-secondary | Slate Gray      | `#637074` | 99, 112, 116   | 194°, 8%, 42%    |
| cta            | Bright Orange   | `#E8691E` | 232, 105, 30   | 25°, 80%, 51%    |
| cta-hover      | Dark Orange     | `#C45718` | 196, 87, 24    | 25°, 78%, 43%    |
| success        | Emerald         | `#27AE60` | 39, 174, 96    | 145°, 63%, 42%   |
| warning        | Amber           | `#F39C12` | 243, 156, 18   | 37°, 90%, 51%    |
| error          | Crimson         | `#E74C3C` | 231, 76, 60    | 6°, 76%, 57%     |
| info           | Teal Blue       | `#2980B9` | 41, 128, 185   | 204°, 64%, 44%   |
| border         | Light Blue Gray | `#DDE1E5` | 221, 225, 229  | 210°, 13%, 88%   |

> **CRO Note:** This palette is proven effective for first-time buyers. Blue builds trust; Orange drives click-through. Used by Amazon's "Add to Cart" button for years.

---

### Palette 02 — Luxury & Premium
**Industries:** Jewelry, couture fashion, watches, exclusive memberships, premium cosmetics
**Inspired by:** Gucci, Louis Vuitton, Tiffany & Co., Rolex, Chanel
**Color Harmony:** Monochromatic + Gold accent
**Mood:** Exclusive, timeless, prestigious

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Jet Black       | `#0A0A0A` | 10, 10, 10     | 0°, 0%, 4%       |
| brand-secondary| Deep Graphite   | `#2C2C2C` | 44, 44, 44     | 0°, 0%, 17%      |
| accent         | Warm Gold       | `#C9A84C` | 201, 168, 76   | 40°, 52%, 54%    |
| accent-alt     | Platinum        | `#E8E4DC` | 232, 228, 220  | 40°, 24%, 89%    |
| bg-base        | Warm Off-White  | `#FAF8F3` | 250, 248, 243  | 40°, 50%, 97%    |
| bg-surface     | Champagne       | `#F5F0E8` | 245, 240, 232  | 38°, 43%, 93%    |
| bg-subtle      | Ivory           | `#EDEDEB` | 237, 237, 235  | 60°, 4%, 93%     |
| text-primary   | Rich Black      | `#1C1C1C` | 28, 28, 28     | 0°, 0%, 11%      |
| text-secondary | Warm Gray       | `#7A7065` | 122, 112, 101  | 27°, 9%, 44%     |
| cta            | Antique Gold    | `#A8862E` | 168, 134, 46   | 40°, 57%, 42%    |
| cta-hover      | Deep Gold       | `#8A6E25` | 138, 110, 37   | 40°, 58%, 34%    |
| success        | Deep Emerald    | `#1A6B4A` | 26, 107, 74    | 155°, 61%, 26%   |
| warning        | Muted Amber     | `#C8961A` | 200, 150, 26   | 40°, 77%, 44%    |
| error          | Deep Crimson    | `#9B2335` | 155, 35, 53    | 350°, 63%, 37%   |
| info           | Slate Blue      | `#5C738A` | 92, 115, 138   | 210°, 20%, 45%   |
| border         | Beige Stroke    | `#E0D9CC` | 224, 217, 204  | 38°, 26%, 84%    |

> **Design Rule:** In luxury stores, whitespace IS a design element. Use 70%+ whitespace. Never crowd the layout.

---

### Palette 03 — Fresh & Natural
**Industries:** Organic food, natural skincare, supplements, eco lifestyle, farm-to-table
**Inspired by:** Whole Foods, Aesop, Dr. Bronner's, Lush, Burt's Bees
**Color Harmony:** Analogous (Green family) + Earthy accent
**Mood:** Pure, honest, wholesome, trustworthy

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Forest Green    | `#2D6A4F` | 45, 106, 79    | 154°, 40%, 30%   |
| brand-secondary| Sage Green      | `#52B788` | 82, 183, 136   | 152°, 38%, 52%   |
| accent         | Warm Terracotta | `#C47C5A` | 196, 124, 90   | 19°, 45%, 56%    |
| accent-alt     | Warm Beige      | `#D4A373` | 212, 163, 115  | 29°, 48%, 64%    |
| bg-base        | Warm Cream      | `#FEFAE0` | 254, 250, 224  | 53°, 93%, 94%    |
| bg-surface     | Soft Linen      | `#F5EFE6` | 245, 239, 230  | 34°, 48%, 93%    |
| bg-subtle      | Pale Sage       | `#EAF0E8` | 234, 240, 232  | 110°, 20%, 93%   |
| text-primary   | Dark Moss       | `#1B4332` | 27, 67, 50     | 155°, 43%, 18%   |
| text-secondary | Warm Olive      | `#6B705C` | 107, 112, 92   | 78°, 10%, 40%    |
| cta            | Leaf Green      | `#40916C` | 64, 145, 108   | 154°, 39%, 41%   |
| cta-hover      | Deep Leaf       | `#33745A` | 51, 116, 90    | 154°, 39%, 33%   |
| success        | Mint            | `#52B788` | 82, 183, 136   | 152°, 38%, 52%   |
| warning        | Harvest Orange  | `#E07A2F` | 224, 122, 47   | 25°, 73%, 53%    |
| error          | Clay Red        | `#A63C2E` | 166, 60, 46    | 5°, 57%, 42%     |
| info           | Sky Blue        | `#5B9BD5` | 91, 155, 213   | 208°, 57%, 60%   |
| border         | Pale Sage       | `#D8E2D5` | 216, 226, 213  | 110°, 18%, 86%   |

---

### Palette 04 — Bold & Energetic
**Industries:** Sportswear, gaming, energy drinks, supplements, tech gadgets
**Inspired by:** Nike, Razer, Red Bull, Puma, ASUS ROG
**Color Harmony:** Triadic (Blue + Red + Cyan/Neon)
**Mood:** Power, speed, intensity, domination

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Electric Blue   | `#003BFF` | 0, 59, 255     | 228°, 100%, 50%  |
| brand-secondary| Vivid Cyan      | `#00D4FF` | 0, 212, 255    | 192°, 100%, 50%  |
| accent         | Neon Orange     | `#FF5400` | 255, 84, 0     | 20°, 100%, 50%   |
| accent-alt     | Neon Lime       | `#AAFF00` | 170, 255, 0    | 80°, 100%, 50%   |
| bg-base        | Deep Space Navy | `#050A1A` | 5, 10, 26      | 224°, 68%, 6%    |
| bg-surface     | Dark Navy       | `#0D1B2A` | 13, 27, 42     | 212°, 53%, 11%   |
| bg-subtle      | Midnight Blue   | `#162032` | 22, 32, 50     | 218°, 39%, 14%   |
| text-primary   | Bright White    | `#F0F4FF` | 240, 244, 255  | 225°, 100%, 97%  |
| text-secondary | Cool Silver     | `#9BA8BE` | 155, 168, 190  | 217°, 21%, 68%   |
| cta            | Danger Red      | `#FF1A1A` | 255, 26, 26    | 0°, 100%, 55%    |
| cta-hover      | Dark Red        | `#D40000` | 212, 0, 0      | 0°, 100%, 42%    |
| success        | Neon Green      | `#00FF6A` | 0, 255, 106    | 146°, 100%, 50%  |
| warning        | Neon Yellow     | `#FFE600` | 255, 230, 0    | 54°, 100%, 50%   |
| error          | Hot Red         | `#FF2D55` | 255, 45, 85    | 348°, 100%, 59%  |
| info           | Cyan Blue       | `#00B8FF` | 0, 184, 255    | 198°, 100%, 50%  |
| border         | Blue Glow       | `#1C3A5E` | 28, 58, 94     | 211°, 54%, 24%   |

---

### Palette 05 — Soft & Feminine
**Industries:** Skincare, makeup, baby products, women's apparel, bridal, florals
**Inspired by:** Glossier, Fenty Beauty, Carter's, Anthropologie, Victoria's Secret
**Color Harmony:** Analogous (Pink + Rose + Lavender)
**Mood:** Gentle, warm, romantic, nurturing

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Dusty Rose      | `#C9848A` | 201, 132, 138  | 355°, 33%, 65%   |
| brand-secondary| Blush Pink      | `#F2ADB8` | 242, 173, 184  | 350°, 73%, 81%   |
| accent         | Soft Lavender   | `#BFA3D1` | 191, 163, 209  | 278°, 30%, 73%   |
| accent-alt     | Peachy Coral    | `#F4A58A` | 244, 165, 138  | 17°, 81%, 75%    |
| bg-base        | Petal White     | `#FFF5F7` | 255, 245, 247  | 348°, 100%, 98%  |
| bg-surface     | Soft Blush      | `#FDE8ED` | 253, 232, 237  | 349°, 90%, 95%   |
| bg-subtle      | Lilac Mist      | `#F3EEF8` | 243, 238, 248  | 276°, 43%, 95%   |
| text-primary   | Deep Plum       | `#4A2040` | 74, 32, 64     | 313°, 40%, 21%   |
| text-secondary | Mauve Gray      | `#8C6670` | 140, 102, 112  | 345°, 16%, 47%   |
| cta            | Berry Red       | `#B5424F` | 181, 66, 79    | 354°, 46%, 48%   |
| cta-hover      | Dark Berry      | `#962F3B` | 150, 47, 59    | 354°, 52%, 38%   |
| success        | Blush Mint      | `#84C9A6` | 132, 201, 166  | 149°, 37%, 65%   |
| warning        | Peach           | `#F4A261` | 244, 162, 97   | 27°, 85%, 67%    |
| error          | Rose Red        | `#D94F6B` | 217, 79, 107   | 346°, 64%, 58%   |
| info           | Sky Lavender    | `#A3B8E8` | 163, 184, 232  | 219°, 56%, 77%   |
| border         | Pale Pink       | `#F0D5DA` | 240, 213, 218  | 351°, 44%, 89%   |

---

### Palette 06 — Modern Minimalist
**Industries:** Furniture, home decor, kitchenware, interior design, lifestyle
**Inspired by:** IKEA, Muji, West Elm, HAY, Crate & Barrel
**Color Harmony:** Neutral base + Warm earth accent
**Mood:** Calm, considered, uncluttered, quality

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Warm Charcoal   | `#2F2F2F` | 47, 47, 47     | 0°, 0%, 18%      |
| brand-secondary| Stone Gray      | `#8C8C8C` | 140, 140, 140  | 0°, 0%, 55%      |
| accent         | Terracotta      | `#C4704F` | 196, 112, 79   | 19°, 46%, 54%    |
| accent-alt     | Warm Brass      | `#C19A6B` | 193, 154, 107  | 32°, 38%, 59%    |
| bg-base        | Pale Sand       | `#EDE8E3` | 237, 232, 227  | 27°, 22%, 91%    |
| bg-surface     | Warm White      | `#F5F0EB` | 245, 240, 235  | 30°, 44%, 94%    |
| bg-subtle      | Light Oat       | `#F9F6F2` | 249, 246, 242  | 34°, 44%, 96%    |
| text-primary   | Dark Walnut     | `#2C1A0E` | 44, 26, 14     | 22°, 52%, 11%    |
| text-secondary | Warm Taupe      | `#7D6E62` | 125, 110, 98   | 22°, 12%, 44%    |
| cta            | Burnt Sienna    | `#A0522D` | 160, 82, 45    | 19°, 56%, 40%    |
| cta-hover      | Deep Sienna     | `#834323` | 131, 67, 35    | 19°, 58%, 33%    |
| success        | Sage Green      | `#87A878` | 135, 168, 120  | 104°, 19%, 56%   |
| warning        | Muted Gold      | `#D4A017` | 212, 160, 23   | 43°, 80%, 46%    |
| error          | Brick Red       | `#9B3A2D` | 155, 58, 45    | 5°, 55%, 39%     |
| info           | Dusty Blue      | `#7B9BB5` | 123, 155, 181  | 207°, 27%, 60%   |
| border         | Oat             | `#DDD6CE` | 221, 214, 206  | 27°, 19%, 84%    |

---

### Palette 07 — Playful & Fun
**Industries:** Toys, children's clothing, party supplies, gift shops, stationery, crafts
**Inspired by:** LEGO, Fisher-Price, Build-A-Bear, Crayola
**Color Harmony:** Triadic (Red + Yellow + Blue primary colors)
**Mood:** Energetic, joyful, imaginative, carefree

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Sunshine Yellow | `#FFD600` | 255, 214, 0    | 50°, 100%, 50%   |
| brand-secondary| Sky Blue        | `#29B6F6` | 41, 182, 246   | 199°, 91%, 56%   |
| accent         | Coral Red       | `#FF6B6B` | 255, 107, 107  | 0°, 100%, 71%    |
| accent-alt     | Grass Green     | `#66BB6A` | 102, 187, 106  | 123°, 34%, 57%   |
| bg-base        | Warm Cream      | `#FFFBF0` | 255, 251, 240  | 45°, 100%, 97%   |
| bg-surface     | Soft White      | `#FFFFFF` | 255, 255, 255  | 0°, 0%, 100%     |
| bg-subtle      | Light Sky       | `#E8F4FD` | 232, 244, 253  | 207°, 83%, 95%   |
| text-primary   | Deep Navy       | `#1A1464` | 26, 20, 100    | 242°, 66%, 24%   |
| text-secondary | Medium Purple   | `#6B55A4` | 107, 85, 164   | 260°, 31%, 49%   |
| cta            | LEGO Red        | `#E3000B` | 227, 0, 11     | 357°, 100%, 45%  |
| cta-hover      | Dark Red        | `#BB0009` | 187, 0, 9      | 357°, 100%, 37%  |
| success        | Happy Green     | `#4CAF50` | 76, 175, 80    | 122°, 39%, 49%   |
| warning        | Fun Orange      | `#FF9800` | 255, 152, 0    | 36°, 100%, 50%   |
| error          | Candy Red       | `#F44336` | 244, 67, 54    | 4°, 90%, 58%     |
| info           | Bubble Blue     | `#29B6F6` | 41, 182, 246   | 199°, 91%, 56%   |
| border         | Pastel Blue     | `#BBDEFB` | 187, 222, 251  | 207°, 89%, 86%   |

---

### Palette 08 — Dark & Edgy
**Industries:** Streetwear, sneakers, tattoo art, vinyl/music, underground/alternative
**Inspired by:** Supreme, Off-White, HUF, Palace, Stüssy
**Color Harmony:** Neutral dark base + Single electric accent
**Mood:** Rebellious, raw, authentic, anti-establishment

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Matte Black     | `#111111` | 17, 17, 17     | 0°, 0%, 7%       |
| brand-secondary| Gunmetal        | `#3A3A3A` | 58, 58, 58     | 0°, 0%, 23%      |
| accent         | Electric Purple | `#9B30FF` | 155, 48, 255   | 271°, 100%, 59%  |
| accent-alt     | Neon Green      | `#39FF14` | 57, 255, 20    | 107°, 100%, 54%  |
| bg-base        | True Black      | `#0A0A0A` | 10, 10, 10     | 0°, 0%, 4%       |
| bg-surface     | Dark Gray       | `#1E1E1E` | 30, 30, 30     | 0°, 0%, 12%      |
| bg-subtle      | Dim Gray        | `#292929` | 41, 41, 41     | 0°, 0%, 16%      |
| text-primary   | Off White       | `#F0F0F0` | 240, 240, 240  | 0°, 0%, 94%      |
| text-secondary | Mid Gray        | `#888888` | 136, 136, 136  | 0°, 0%, 53%      |
| cta            | Hot Magenta     | `#E040FB` | 224, 64, 251   | 291°, 95%, 62%   |
| cta-hover      | Deep Magenta    | `#BA29D2` | 186, 41, 210   | 291°, 67%, 49%   |
| success        | Acid Green      | `#69FF47` | 105, 255, 71   | 108°, 100%, 64%  |
| warning        | Neon Amber      | `#FFC107` | 255, 193, 7    | 43°, 100%, 51%   |
| error          | Blood Red       | `#CC0000` | 204, 0, 0      | 0°, 100%, 40%    |
| info           | Ice Blue        | `#64B5F6` | 100, 181, 246  | 207°, 88%, 68%   |
| border         | Dark Stroke     | `#2C2C2C` | 44, 44, 44     | 0°, 0%, 17%      |

---

### Palette 09 — Earthy & Artisan
**Industries:** Handmade goods, artisan food, coffee, pottery, candles, vintage, crafts
**Inspired by:** Etsy top sellers, Blue Bottle Coffee, artisan bakeries, Williams-Sonoma
**Color Harmony:** Analogous earth tones (Brown + Rust + Amber)
**Mood:** Crafted, cozy, honest, authentic, heritage

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Espresso        | `#3B1F0E` | 59, 31, 14     | 21°, 62%, 14%    |
| brand-secondary| Warm Rust       | `#8B4513` | 139, 69, 19    | 25°, 76%, 31%    |
| accent         | Amber Honey     | `#D4841A` | 212, 132, 26   | 34°, 78%, 47%    |
| accent-alt     | Olive Green     | `#6B7A3B` | 107, 122, 59   | 75°, 35%, 35%    |
| bg-base        | Parchment       | `#FAF0E6` | 250, 240, 230  | 30°, 80%, 94%    |
| bg-surface     | Warm Linen      | `#F2E8D9` | 242, 232, 217  | 35°, 53%, 90%    |
| bg-subtle      | Aged Paper      | `#EDE0CC` | 237, 224, 204  | 36°, 48%, 86%    |
| text-primary   | Dark Bark       | `#2C1A0A` | 44, 26, 10     | 22°, 63%, 11%    |
| text-secondary | Medium Umber    | `#7A5C42` | 122, 92, 66    | 25°, 30%, 37%    |
| cta            | Burnt Amber     | `#C87941` | 200, 121, 65   | 25°, 52%, 52%    |
| cta-hover      | Deep Amber      | `#A86030` | 168, 96, 48    | 25°, 56%, 42%    |
| success        | Herb Green      | `#4A7C59` | 74, 124, 89    | 139°, 25%, 39%   |
| warning        | Mustard         | `#C8A011` | 200, 160, 17   | 43°, 84%, 43%    |
| error          | Brick           | `#922B21` | 146, 43, 33    | 4°, 63%, 35%     |
| info           | Dusty Teal      | `#5B8E8A` | 91, 142, 138   | 176°, 22%, 45%   |
| border         | Warm Sand       | `#D9C9B6` | 217, 201, 182  | 32°, 31%, 78%    |

---

### Palette 10 — Clean & Corporate
**Industries:** Electronics, B2B platforms, SaaS tools, fintech, accounting software
**Inspired by:** Apple, Shopify, Stripe, PayPal, Salesforce
**Color Harmony:** Monochromatic Blue + Green CTA
**Mood:** Professional, dependable, efficient, clean

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Deep Navy       | `#003087` | 0, 48, 135     | 222°, 100%, 26%  |
| brand-secondary| Action Blue     | `#0070CC` | 0, 112, 204    | 207°, 100%, 40%  |
| accent         | Teal            | `#00B3A4` | 0, 179, 164    | 175°, 100%, 35%  |
| accent-alt     | Indigo          | `#4B50E6` | 75, 80, 230    | 238°, 74%, 60%   |
| bg-base        | Cloud White     | `#F8FAFC` | 248, 250, 252  | 210°, 40%, 98%   |
| bg-surface     | Pure White      | `#FFFFFF` | 255, 255, 255  | 0°, 0%, 100%     |
| bg-subtle      | Light Slate     | `#F1F5F9` | 241, 245, 249  | 210°, 40%, 96%   |
| text-primary   | Near Black      | `#0F172A` | 15, 23, 42     | 222°, 47%, 11%   |
| text-secondary | Slate           | `#64748B` | 100, 116, 139  | 215°, 16%, 47%   |
| cta            | Signal Green    | `#16A34A` | 22, 163, 74    | 142°, 76%, 36%   |
| cta-hover      | Deep Green      | `#15803D` | 21, 128, 61    | 142°, 72%, 29%   |
| success        | Mint Green      | `#22C55E` | 34, 197, 94    | 142°, 71%, 45%   |
| warning        | Amber           | `#F59E0B` | 245, 158, 11   | 38°, 92%, 50%    |
| error          | Rose Red        | `#EF4444` | 239, 68, 68    | 0°, 83%, 60%     |
| info           | Sky Blue        | `#38BDF8` | 56, 189, 248   | 199°, 92%, 60%   |
| border         | Light Slate     | `#E2E8F0` | 226, 232, 240  | 214°, 32%, 91%   |

---

### Palette 11 — Sustainable & Eco
**Industries:** Vegan brands, zero-waste products, sustainable fashion, ethical sourcing
**Inspired by:** Patagonia, tentree, Allbirds, Grove Collaborative
**Color Harmony:** Analogous Muted Greens + Ochre accent
**Mood:** Authentic, transparent, responsible, earthy

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Deep Teal       | `#1B4D3E` | 27, 77, 62     | 160°, 48%, 20%   |
| brand-secondary| Moss Green      | `#5C7A4F` | 92, 122, 79    | 100°, 21%, 39%   |
| accent         | Sandy Ochre     | `#C9A84C` | 201, 168, 76   | 40°, 52%, 54%    |
| accent-alt     | Sky Mist        | `#87CEEB` | 135, 206, 235  | 197°, 71%, 73%   |
| bg-base        | Recycled Paper  | `#F2EDDC` | 242, 237, 220  | 47°, 51%, 91%    |
| bg-surface     | Off White       | `#FAF8F2` | 250, 248, 242  | 46°, 63%, 96%    |
| bg-subtle      | Light Sage      | `#E8EDE4` | 232, 237, 228  | 100°, 14%, 91%   |
| text-primary   | Forest Black    | `#1A2E1A` | 26, 46, 26     | 120°, 28%, 14%   |
| text-secondary | Earth Taupe     | `#6B6455` | 107, 100, 85   | 40°, 11%, 37%    |
| cta            | Nature Green    | `#2E7D32` | 46, 125, 50    | 123°, 46%, 33%   |
| cta-hover      | Deep Nature     | `#1B5E20` | 27, 94, 32     | 124°, 55%, 24%   |
| success        | Leaf Green      | `#43A047` | 67, 160, 71    | 123°, 40%, 45%   |
| warning        | Honey           | `#FFA000` | 255, 160, 0    | 38°, 100%, 50%   |
| error          | Cedar           | `#8D3B2B` | 141, 59, 43    | 8°, 54%, 36%     |
| info           | Stream Blue     | `#4FC3F7` | 79, 195, 247   | 200°, 90%, 64%   |
| border         | Dew Gray        | `#D4D8CC` | 212, 216, 204  | 88°, 10%, 82%    |

---

### Palette 12 — Travel & Adventure
**Industries:** Travel accessories, outdoor gear, luggage, adventure tourism, hiking
**Inspired by:** REI, National Geographic, Away Travel, Osprey
**Color Harmony:** Complementary (Ocean Blue + Sunset Orange)
**Mood:** Freedom, discovery, openness, excitement

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Ocean Blue      | `#00587A` | 0, 88, 122     | 199°, 100%, 24%  |
| brand-secondary| Horizon Blue    | `#0096C7` | 0, 150, 199    | 199°, 100%, 39%  |
| accent         | Sunset Orange   | `#E85D04` | 232, 93, 4     | 23°, 96%, 46%    |
| accent-alt     | Sand Dune       | `#E9C46A` | 233, 196, 106  | 41°, 73%, 66%    |
| bg-base        | Sky White       | `#F0F8FF` | 240, 248, 255  | 208°, 100%, 97%  |
| bg-surface     | Cloud           | `#FFFFFF` | 255, 255, 255  | 0°, 0%, 100%     |
| bg-subtle      | Light Mist      | `#E8F4FB` | 232, 244, 251  | 203°, 65%, 95%   |
| text-primary   | Deep Slate      | `#1A2B3C` | 26, 43, 60     | 210°, 40%, 17%   |
| text-secondary | Storm Gray      | `#5C7080` | 92, 112, 128   | 207°, 16%, 43%   |
| cta            | Adventure Red   | `#D62828` | 214, 40, 40    | 0°, 70%, 50%     |
| cta-hover      | Deep Red        | `#B01E1E` | 176, 30, 30    | 0°, 71%, 40%     |
| success        | Lagoon Green    | `#2DC653` | 45, 198, 83    | 135°, 63%, 48%   |
| warning        | Dusk Orange     | `#F4A261` | 244, 162, 97   | 27°, 85%, 67%    |
| error          | Volcanic Red    | `#9D0208` | 157, 2, 8      | 358°, 97%, 31%   |
| info           | Aqua            | `#00B4D8` | 0, 180, 216    | 192°, 100%, 42%  |
| border         | Sea Mist        | `#C8DDE8` | 200, 221, 232  | 200°, 36%, 85%   |

---

### Palette 13 — Food & Restaurant
**Industries:** Food delivery, meal kits, restaurant merchandise, gourmet gifts, grocery
**Inspired by:** DoorDash, Instacart, HelloFresh, Eataly, Goldbelly
**Color Harmony:** Split-Complementary (Red + Yellow + Green)
**Mood:** Appetizing, warm, inviting, fresh

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Chili Red       | `#C1121F` | 193, 18, 31    | 355°, 83%, 41%   |
| brand-secondary| Warm Tomato     | `#E63946` | 230, 57, 70    | 355°, 77%, 56%   |
| accent         | Fresh Yellow    | `#FFB703` | 255, 183, 3    | 43°, 100%, 51%   |
| accent-alt     | Basil Green     | `#52B69A` | 82, 182, 154   | 163°, 38%, 52%   |
| bg-base        | Warm White      | `#FFFBF7` | 255, 251, 247  | 30°, 100%, 98%   |
| bg-surface     | Cream           | `#FFF5E6` | 255, 245, 230  | 36°, 100%, 95%   |
| bg-subtle      | Light Peach     | `#FFF0E0` | 255, 240, 224  | 32°, 100%, 94%   |
| text-primary   | Dark Espresso   | `#1A0A00` | 26, 10, 0      | 23°, 100%, 5%    |
| text-secondary | Warm Brown      | `#7B5230` | 123, 82, 48    | 25°, 44%, 34%    |
| cta            | Order Red       | `#E63946` | 230, 57, 70    | 355°, 77%, 56%   |
| cta-hover      | Dark Order Red  | `#BE2A35` | 190, 42, 53    | 355°, 64%, 45%   |
| success        | Herb Green      | `#2D6A4F` | 45, 106, 79    | 154°, 40%, 30%   |
| warning        | Mango           | `#FB8500` | 251, 133, 0    | 32°, 100%, 49%   |
| error          | Pepper Red      | `#9B1C1C` | 155, 28, 28    | 0°, 69%, 36%     |
| info           | Sage Blue       | `#5B8DB8` | 91, 141, 184   | 210°, 36%, 54%   |
| border         | Warm Peach      | `#F4CBA8` | 244, 203, 168  | 27°, 76%, 81%    |

---

### Palette 14 — Medical & Wellness
**Industries:** Online pharmacies, telehealth, supplements, mental wellness, fitness tracking
**Inspired by:** CVS, Walgreens, Hims, Roman, One Medical
**Color Harmony:** Analogous (Blue + Teal + Green)
**Mood:** Safe, clean, clinical, trustworthy, reassuring

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Clinical Blue   | `#005EB8` | 0, 94, 184     | 213°, 100%, 36%  |
| brand-secondary| Sky Teal        | `#00A6A6` | 0, 166, 166    | 180°, 100%, 33%  |
| accent         | Wellness Green  | `#44BBA4` | 68, 187, 164   | 170°, 46%, 50%   |
| accent-alt     | Calm Lavender   | `#9B89C4` | 155, 137, 196  | 258°, 30%, 65%   |
| bg-base        | Clinical White  | `#F7FAFB` | 247, 250, 251  | 195°, 30%, 98%   |
| bg-surface     | Pure White      | `#FFFFFF` | 255, 255, 255  | 0°, 0%, 100%     |
| bg-subtle      | Ice Blue        | `#EBF5FB` | 235, 245, 251  | 204°, 60%, 95%   |
| text-primary   | Deep Blue Gray  | `#1C2B3A` | 28, 43, 58     | 210°, 35%, 17%   |
| text-secondary | Cool Slate      | `#5F7484` | 95, 116, 132   | 205°, 16%, 45%   |
| cta            | Trust Blue      | `#0066CC` | 0, 102, 204    | 210°, 100%, 40%  |
| cta-hover      | Deep Trust      | `#0055AA` | 0, 85, 170     | 210°, 100%, 33%  |
| success        | Health Green    | `#27AE60` | 39, 174, 96    | 145°, 63%, 42%   |
| warning        | Caution Amber   | `#F0A500` | 240, 165, 0    | 41°, 100%, 47%   |
| error          | Alert Red       | `#D32F2F` | 211, 47, 47    | 0°, 63%, 51%     |
| info           | Sky Teal        | `#00ACC1` | 0, 172, 193    | 186°, 100%, 38%  |
| border         | Ice Blue Stroke | `#D0E8F2` | 208, 232, 242  | 200°, 52%, 88%   |

---

### Palette 15 — Pet & Animal
**Industries:** Pet food, grooming products, pet accessories, vet clinics, animal adoption
**Inspired by:** Chewy, BarkBox, PetSmart, Ollie
**Color Harmony:** Complementary (Teal + Orange) + Warm purple
**Mood:** Caring, playful, trustworthy, joyful

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Friendly Teal   | `#00897B` | 0, 137, 123    | 174°, 100%, 27%  |
| brand-secondary| Warm Purple     | `#7B61FF` | 123, 97, 255   | 249°, 100%, 69%  |
| accent         | Paw Orange      | `#FF7043` | 255, 112, 67   | 14°, 100%, 63%   |
| accent-alt     | Playful Yellow  | `#FFD740` | 255, 215, 64   | 47°, 100%, 63%   |
| bg-base        | Warm Light      | `#FFF8F0` | 255, 248, 240  | 30°, 100%, 97%   |
| bg-surface     | Soft White      | `#FFFFFF` | 255, 255, 255  | 0°, 0%, 100%     |
| bg-subtle      | Pastel Teal     | `#E0F5F3` | 224, 245, 243  | 176°, 53%, 92%   |
| text-primary   | Dark Brown      | `#2C1810` | 44, 24, 16     | 16°, 47%, 12%    |
| text-secondary | Warm Gray       | `#78665A` | 120, 102, 90   | 20°, 14%, 41%    |
| cta            | Cheerful Orange | `#FF6D00` | 255, 109, 0    | 26°, 100%, 50%   |
| cta-hover      | Deep Orange     | `#D45A00` | 212, 90, 0     | 26°, 100%, 42%   |
| success        | Fresh Green     | `#4CAF50` | 76, 175, 80    | 122°, 39%, 49%   |
| warning        | Sunflower       | `#FFB300` | 255, 179, 0    | 42°, 100%, 50%   |
| error          | Warning Red     | `#E53935` | 229, 57, 53    | 1°, 76%, 55%     |
| info           | Calm Teal       | `#26C6DA` | 38, 198, 218   | 186°, 70%, 50%   |
| border         | Warm Outline    | `#E8DDD5` | 232, 221, 213  | 22°, 29%, 87%    |

---

### Palette 16 — Vintage & Retro
**Industries:** Vintage clothing, antiques, vinyl records, nostalgic gifts, retro games
**Inspired by:** Etsy vintage stores, eBay collectors, ThredUp, Depop
**Color Harmony:** Muted Split-Complementary
**Mood:** Nostalgic, storied, authentic, curated, rare

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Faded Navy      | `#2C4A6E` | 44, 74, 110    | 213°, 43%, 30%   |
| brand-secondary| Antique Teal    | `#3E7B7B` | 62, 123, 123   | 180°, 33%, 36%   |
| accent         | Dusty Mustard   | `#C8A840` | 200, 168, 64   | 42°, 56%, 52%    |
| accent-alt     | Faded Coral     | `#D4756A` | 212, 117, 106  | 4°, 55%, 62%     |
| bg-base        | Aged Cream      | `#F5EDD6` | 245, 237, 214  | 44°, 59%, 90%    |
| bg-surface     | Vintage Paper   | `#F0E6CC` | 240, 230, 204  | 42°, 55%, 87%    |
| bg-subtle      | Worn Beige      | `#EDE0C0` | 237, 224, 192  | 42°, 54%, 84%    |
| text-primary   | Dark Sepia      | `#2C1A08` | 44, 26, 8      | 24°, 69%, 10%    |
| text-secondary | Warm Umber      | `#7A5C3A` | 122, 92, 58    | 28°, 36%, 35%    |
| cta            | Retro Red       | `#9B2926` | 155, 41, 38    | 1°, 61%, 38%     |
| cta-hover      | Dark Retro      | `#7D1F1C` | 125, 31, 28    | 2°, 63%, 30%     |
| success        | Olive           | `#5C7A3A` | 92, 122, 58    | 92°, 36%, 35%    |
| warning        | Amber Gold      | `#C89A20` | 200, 154, 32   | 42°, 72%, 45%    |
| error          | Rust            | `#8B3A2A` | 139, 58, 42    | 7°, 54%, 35%     |
| info           | Faded Denim     | `#6B8AAE` | 107, 138, 174  | 211°, 29%, 55%   |
| border         | Old Paper       | `#D8C8A0` | 216, 200, 160  | 43°, 42%, 74%    |

---

### Palette 17 — Luxury Skincare & Anti-Aging
**Industries:** High-end skincare, serums, SPF, anti-aging, dermatology-backed products
**Inspired by:** La Mer, SK-II, SkinCeuticals, Tatcha
**Color Harmony:** Monochromatic neutral + Pearl/Rose accent
**Mood:** Scientific, pure, results-driven, aspirational

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Cool White      | `#F7F7F5` | 247, 247, 245  | 60°, 5%, 96%     |
| brand-secondary| Soft Gray       | `#C0BDB8` | 192, 189, 184  | 30°, 5%, 74%     |
| accent         | Rose Gold       | `#D4A5A0` | 212, 165, 160  | 3°, 39%, 73%     |
| accent-alt     | Pearl           | `#EDE8E0` | 237, 232, 224  | 38°, 28%, 90%    |
| bg-base        | Soft Snow       | `#FAFAF9` | 250, 250, 249  | 60°, 8%, 98%     |
| bg-surface     | Pure White      | `#FFFFFF` | 255, 255, 255  | 0°, 0%, 100%     |
| bg-subtle      | Marble Gray     | `#F2F2F0` | 242, 242, 240  | 60°, 5%, 95%     |
| text-primary   | Deep Charcoal   | `#2A2A2A` | 42, 42, 42     | 0°, 0%, 16%      |
| text-secondary | Warm Silver     | `#888884` | 136, 136, 132  | 60°, 2%, 53%     |
| cta            | Deep Rose       | `#9E5E5A` | 158, 94, 90    | 2°, 28%, 49%     |
| cta-hover      | Dark Rose       | `#7D4542` | 125, 69, 66    | 2°, 31%, 37%     |
| success        | Sage White      | `#7BA896` | 123, 168, 150  | 158°, 18%, 57%   |
| warning        | Warm Ocher      | `#C8A060` | 200, 160, 96   | 35°, 47%, 58%    |
| error          | Muted Crimson   | `#A04040` | 160, 64, 64    | 0°, 43%, 44%     |
| info           | Ice Teal        | `#7EB8C8` | 126, 184, 200  | 196°, 37%, 64%   |
| border         | Pale Pearl      | `#E8E4DC` | 232, 228, 220  | 40°, 24%, 89%    |

---

### Palette 18 — Digital & Web3 / Crypto
**Industries:** NFT marketplaces, crypto exchanges, DeFi platforms, digital collectibles
**Inspired by:** OpenSea, Coinbase, Binance, MetaMask
**Color Harmony:** Dark base + Electric gradient accents
**Mood:** Futuristic, cutting-edge, decentralized, high-value

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Deep Purple     | `#2B0099` | 43, 0, 153     | 255°, 100%, 30%  |
| brand-secondary| Electric Blue   | `#4361EE` | 67, 97, 238    | 228°, 83%, 60%   |
| accent         | Neon Violet     | `#7B2FBE` | 123, 47, 190   | 277°, 60%, 46%   |
| accent-alt     | Mint Green      | `#06D6A0` | 6, 214, 160    | 163°, 95%, 43%   |
| bg-base        | Dark Void       | `#0A0A14` | 10, 10, 20     | 240°, 33%, 6%    |
| bg-surface     | Deep Purple     | `#12122A` | 18, 18, 42     | 240°, 40%, 12%   |
| bg-subtle      | Midnight        | `#1A1A35` | 26, 26, 53     | 240°, 34%, 15%   |
| text-primary   | Bright White    | `#F0F0FF` | 240, 240, 255  | 240°, 100%, 97%  |
| text-secondary | Muted Violet    | `#9090BB` | 144, 144, 187  | 240°, 25%, 65%   |
| cta            | Electric Violet | `#7B2FBE` | 123, 47, 190   | 277°, 60%, 46%   |
| cta-hover      | Deep Violet     | `#641A9E` | 100, 26, 158   | 277°, 72%, 36%   |
| success        | Matrix Green    | `#06D6A0` | 6, 214, 160    | 163°, 95%, 43%   |
| warning        | Crypto Gold     | `#FFB700` | 255, 183, 0    | 43°, 100%, 50%   |
| error          | Plasma Red      | `#FF4D6D` | 255, 77, 109   | 347°, 100%, 65%  |
| info           | Blue Pulse      | `#4CC9F0` | 76, 201, 240   | 197°, 84%, 62%   |
| border         | Purple Glow     | `#2D2D5A` | 45, 45, 90     | 240°, 33%, 26%   |

---

### Palette 19 — Wedding & Bridal
**Industries:** Wedding planning, bridal wear, event decor, fine jewelry, invitations
**Inspired by:** Kleinfeld, David's Bridal, The Knot, Zola
**Color Harmony:** Soft neutrals + Elegant accent
**Mood:** Romantic, timeless, pure, celebratory

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Bridal White    | `#FAF7F4` | 250, 247, 244  | 27°, 38%, 97%    |
| brand-secondary| Warm Ivory      | `#EDE4D8` | 237, 228, 216  | 33°, 37%, 89%    |
| accent         | Soft Rose Gold  | `#C8A090` | 200, 160, 144  | 13°, 35%, 67%    |
| accent-alt     | Silver          | `#C0C4CC` | 192, 196, 204  | 218°, 11%, 78%   |
| bg-base        | Pure Snow       | `#FFFFFE` | 255, 255, 254  | 60°, 100%, 100%  |
| bg-surface     | Soft Pearl      | `#F8F4EF` | 248, 244, 239  | 34°, 45%, 96%    |
| bg-subtle      | Blush Mist      | `#F8EEE8` | 248, 238, 232  | 19°, 60%, 94%    |
| text-primary   | Charcoal Smoke  | `#3A3230` | 58, 50, 48     | 7°, 10%, 21%     |
| text-secondary | Dusty Rose Gray | `#8A7B75` | 138, 123, 117  | 10°, 9%, 50%     |
| cta            | Mauve Rose      | `#9B6B5A` | 155, 107, 90   | 12°, 27%, 48%    |
| cta-hover      | Dark Mauve      | `#7E5244` | 126, 82, 68    | 11°, 30%, 38%    |
| success        | Sage Green      | `#8AAF8A` | 138, 175, 138  | 120°, 17%, 61%   |
| warning        | Peach Blush     | `#F4A882` | 244, 168, 130  | 20°, 82%, 73%    |
| error          | Rose Taupe      | `#8B4A4A` | 139, 74, 74    | 0°, 31%, 42%     |
| info           | Dove Gray       | `#9EB0C2` | 158, 176, 194  | 211°, 22%, 69%   |
| border         | Lace White      | `#EDE0D4` | 237, 224, 212  | 27°, 40%, 88%    |

---

### Palette 20 — Sports Nutrition & Supplements
**Industries:** Protein powders, pre-workout, vitamins, energy bars, athletic nutrition
**Inspired by:** Optimum Nutrition, Myprotein, GNC, Legion Athletics
**Color Harmony:** Bold complementary + Dark surface
**Mood:** High performance, science-backed, results-driven, aggressive

| Token          | Color Name      | HEX       | RGB            | HSL              |
|----------------|-----------------|-----------|----------------|------------------|
| brand-primary  | Power Black     | `#0F0F0F` | 15, 15, 15     | 0°, 0%, 6%       |
| brand-secondary| Steel Gray      | `#2E2E3A` | 46, 46, 58     | 240°, 11%, 20%   |
| accent         | Performance Red | `#E8003A` | 232, 0, 58     | 345°, 100%, 46%  |
| accent-alt     | Energy Yellow   | `#FFD500` | 255, 213, 0    | 50°, 100%, 50%   |
| bg-base        | Dark Slate      | `#141420` | 20, 20, 32     | 240°, 23%, 10%   |
| bg-surface     | Dark Surface    | `#1E1E2E` | 30, 30, 46     | 240°, 21%, 15%   |
| bg-subtle      | Subtle Dark     | `#272736` | 39, 39, 54     | 240°, 16%, 18%   |
| text-primary   | White           | `#F5F5F5` | 245, 245, 245  | 0°, 0%, 96%      |
| text-secondary | Silver          | `#9090A0` | 144, 144, 160  | 240°, 8%, 60%    |
| cta            | Power Red       | `#E8003A` | 232, 0, 58     | 345°, 100%, 46%  |
| cta-hover      | Deep Red        | `#C00030` | 192, 0, 48     | 345°, 100%, 38%  |
| success        | Volt Green      | `#39FF14` | 57, 255, 20    | 107°, 100%, 54%  |
| warning        | Energy Amber    | `#FFAE00` | 255, 174, 0    | 41°, 100%, 50%   |
| error          | Danger          | `#FF3333` | 255, 51, 51    | 0°, 100%, 60%    |
| info           | Electric Blue   | `#00A8FF` | 0, 168, 255    | 200°, 100%, 50%  |
| border         | Dark Divider    | `#2A2A3A` | 42, 42, 58     | 240°, 16%, 20%   |

---

## 4. Trend Palettes 2025–2026

---

### Trend 1 — Neo-Brutalism
> Raw, bold, completely flat. Black borders everywhere. Zero gradients. Monospaced fonts.
> Growing fast among Gen-Z DTC brands, indie shops, and digital-native companies.

| Token      | HEX       | Name             | Notes                              |
|------------|-----------|------------------|------------------------------------|
| Primary    | `#FFDD00` | Electric Yellow  | Dominant background color          |
| Secondary  | `#0000FF` | Pure Blue        | For sections, borders              |
| Accent     | `#FF0066` | Shock Pink       | For labels, tags, badges           |
| Alt        | `#00FF88` | Matrix Green     | For success states, alt sections   |
| Background | `#FFFFFF` | Pure White       | Main page background               |
| Text       | `#000000` | True Black       | All text — maximum contrast        |
| Border     | `#000000` | True Black       | 2–3px borders on EVERYTHING        |
| Shadow     | `#000000` | True Black       | Hard pixel offset, no blur         |

**Typography:** IBM Plex Mono, Space Grotesk, Courier New
**Key Principle:** Borders replace subtle shadows. Asymmetry is intentional. Anti-polish = authenticity.

---

### Trend 2 — Pastel Gen-Z
> Desaturated pastels. Soft corners. TikTok-era aesthetics. Used by beauty, wellness, and fashion DTC brands targeting 18–28 demographic.

| Token      | HEX       | Name             |
|------------|-----------|------------------|
| Primary    | `#A8D8EA` | Powder Blue      |
| Secondary  | `#AA96DA` | Soft Violet      |
| Accent     | `#FCBAD3` | Cotton Candy     |
| Alt        | `#FFFFD2` | Banana Cream     |
| Background | `#F9F9F9` | Near White       |
| Text       | `#3D3D3D` | Soft Black       |
| Muted Text | `#9090A0` | Lavender Gray    |
| Border     | `#E8E0F0` | Pale Lilac       |

**Typography:** Nunito, DM Sans, Poppins
**Key Principle:** Avoid pure black text — use soft black (`#3D3D3D`) for a friendlier feel.

---

### Trend 3 — Organic Luxury / Quiet Luxury
> Muted, understated, expensive-feeling. No brash colors. Whisper rather than shout.
> Heavily influenced by Succession/HBO aesthetics and "old money" fashion.

| Token      | HEX       | Name             |
|------------|-----------|------------------|
| Primary    | `#8B7355` | Warm Taupe       |
| Secondary  | `#BDB5A6` | Pebble Gray      |
| Accent     | `#D4C5B0` | Raw Linen        |
| Alt        | `#8A9970` | Muted Sage       |
| Background | `#F5F0EA` | Bone             |
| Text       | `#2A2118` | Rich Earth       |
| CTA        | `#5C4A32` | Dark Tobacco     |
| Border     | `#D8CEBF` | Warm Stone       |

**Typography:** Cormorant Garamond, Optima, Libre Baskerville
**Key Principle:** No "sale" banners. No urgency timers. The quiet restraint IS the luxury signal.

---

### Trend 4 — Premium Dark Commerce
> Rich dark backgrounds with metallic gold/silver accents. Premium "streaming platform" meets "high-end retail".
> Used by luxury DTC brands, high-ticket items, and exclusive memberships.

| Token      | HEX       | Name             |
|------------|-----------|------------------|
| Primary    | `#141414` | Void Black       |
| Secondary  | `#1E1E1E` | Darkened Surface |
| Accent     | `#C0A060` | Antique Gold     |
| Alt        | `#9FAFCE` | Steel Blue       |
| Background | `#0A0A0A` | True Void        |
| Text       | `#F5F5F5` | Snow White       |
| Muted Text | `#808080` | Mid Gray         |
| CTA        | `#C0A060` | Antique Gold     |
| Border     | `#2A2A2A` | Dark Divider     |

**Typography:** Playfair Display, PP Editorial New, Chronicle Display
**Key Principle:** Subtle grain texture overlays add depth. Thin 0.5px borders feel ultra-premium.

---

### Trend 5 — Terracotta Revival
> Warm earth tones are back. Slow living, dopamine-free design. Instagram-worthy, Pinterest-driven.

| Token      | HEX       | Name             |
|------------|-----------|------------------|
| Primary    | `#C8602B` | Terracotta       |
| Secondary  | `#E8A87C` | Peach Clay       |
| Accent     | `#6B8F71` | Eucalyptus       |
| Alt        | `#D4B896` | Desert Sand      |
| Background | `#FDF5EC` | Warm Papyrus     |
| Text       | `#3A1F0E` | Dark Clay        |
| CTA        | `#A0491B` | Deep Rust        |
| Border     | `#D8C0A8` | Clay Stroke      |

**Typography:** Lora, Playfair Display, Garamond
**Key Principle:** Photography should feature raw textures — stone, clay, wood, linen.

---

### Trend 6 — Dopamine Colors (Maximalism)
> Loud, vibrant, unapologetically colorful. Anti-minimalism. Joy as a brand value.
> Used by fashion, beauty, and lifestyle brands targeting optimistic, expressive consumers.

| Token      | HEX       | Name             |
|------------|-----------|------------------|
| Primary    | `#FF3CAC` | Hot Pink         |
| Secondary  | `#784BA0` | Deep Violet      |
| Accent     | `#2B86C5` | Bold Blue        |
| Alt        | `#FFDE00` | Saturated Yellow |
| Background | `#FFFFFF` | Pure White       |
| Text       | `#1A1A1A` | Near Black       |
| CTA        | `#FF3CAC` | Hot Pink         |
| Border     | `#F0F0F0` | Soft Gray        |

**Typography:** Clash Display, Satoshi, Bricolage Grotesque
**Key Principle:** Use gradients freely. Mix all 4 accent colors in hero sections.

---

## 5. Seasonal & Campaign Palettes

---

### Spring / Easter Campaign

| Token      | HEX       | Name             |
|------------|-----------|------------------|
| Primary    | `#A8D8B9` | Spring Mint      |
| Secondary  | `#F9D4E3` | Cherry Blossom   |
| Accent     | `#FFEAA7` | Daffodil         |
| Alt        | `#DDA0DD` | Wisteria         |
| Background | `#FAFFF8` | Spring White     |
| Text       | `#2D4739` | Deep Leaf        |
| CTA        | `#4CAF7D` | Fresh Green      |

**Best used for:** March–April promotional banners, Easter sales, spring new arrivals.

---

### Summer / Beach Season

| Token      | HEX       | Name             |
|------------|-----------|------------------|
| Primary    | `#FF6B35` | Sunset Orange    |
| Secondary  | `#00B4D8` | Ocean Blue       |
| Accent     | `#FFE66D` | Sun Yellow       |
| Alt        | `#FF9F43` | Mango            |
| Background | `#F0FFFE` | Sea Foam         |
| Text       | `#0A2A4A` | Deep Ocean       |
| CTA        | `#FF6B35` | Sunset Orange    |

**Best used for:** May–August campaigns, travel, swimwear, outdoor recreation, summer sale.

---

### Autumn / Fall Harvest

| Token      | HEX       | Name             |
|------------|-----------|------------------|
| Primary    | `#A0522D` | Cinnamon         |
| Secondary  | `#D2691E` | Chocolate        |
| Accent     | `#DAA520` | Goldenrod        |
| Alt        | `#8B0000` | Burgundy         |
| Background | `#FFF8EE` | Pumpkin Cream    |
| Text       | `#2C1A0E` | Dark Bark        |
| CTA        | `#C0392B` | Harvest Red      |

**Best used for:** September–November campaigns, Thanksgiving, back-to-school, fall fashion.

---

### Winter / Holiday Season

| Token      | HEX       | Name             |
|------------|-----------|------------------|
| Primary    | `#C41E3A` | Christmas Red    |
| Secondary  | `#1B5E20` | Pine Green       |
| Accent     | `#D4AF37` | Tinsel Gold      |
| Alt        | `#B0C4DE` | Ice Blue         |
| Background | `#FFFAFA` | Snow White       |
| Text       | `#1A1A2E` | Midnight Blue    |
| CTA        | `#C41E3A` | Christmas Red    |

**Best used for:** November–January, Christmas, Hanukkah, Diwali, New Year campaigns.

---

### Black Friday / Cyber Monday

| Token      | HEX       | Name             |
|------------|-----------|------------------|
| Primary    | `#000000` | Pure Black       |
| Secondary  | `#1A1A1A` | Dark Surface     |
| Accent     | `#FF2222` | Sale Red         |
| Alt        | `#FFD700` | Deal Gold        |
| Background | `#111111` | Void             |
| Text       | `#FFFFFF` | Pure White       |
| CTA        | `#FF2222` | Urgency Red      |

**Best used for:** November promotional events. Add countdown timers. Maximum urgency.

---

### Valentine's Day

| Token      | HEX       | Name             |
|------------|-----------|------------------|
| Primary    | `#C0392B` | Love Red         |
| Secondary  | `#F1948A` | Blush            |
| Accent     | `#D4AF37` | Gold             |
| Alt        | `#F9E4E4` | Pale Blush       |
| Background | `#FFF5F5` | Soft Blush       |
| Text       | `#6B1A20` | Dark Rose        |
| CTA        | `#C0392B` | Love Red         |

**Best used for:** February 1–14. Gifts, jewelry, chocolates, flowers, couples' experiences.

---

## 6. Dark Mode Design System

### Why Dark Mode Matters for E-Commerce

- **30–50%** of users now prefer dark mode on mobile (Google Material Design, 2024)
- Dark mode reduces eye strain for evening shoppers (peak hours: 8 PM–11 PM)
- OLED screens render pure black (`#000000`) at **zero power consumption** — better battery life
- Dark mode can increase session time by **18%** for premium/luxury store segments (UX Research, 2024)

### Universal Token Mapping: Light → Dark

| Token              | Light Mode          | Dark Mode           | Notes                               |
|--------------------|---------------------|---------------------|-------------------------------------|
| `--bg-base`        | `#FFFFFF`           | `#0F0F0F`           | True black for OLED efficiency      |
| `--bg-surface`     | `#F8FAFC`           | `#1A1A1A`           | Card/panel backgrounds              |
| `--bg-subtle`      | `#F1F5F9`           | `#242424`           | Alternate row/section bg            |
| `--text-primary`   | `#0F172A`           | `#F0F0F0`           | Main content text                   |
| `--text-secondary` | `#64748B`           | `#9090A0`           | Secondary/muted text                |
| `--border`         | `#E2E8F0`           | `#2C2C2C`           | Card outlines, dividers             |
| `--shadow`         | `rgba(0,0,0,0.08)`  | `rgba(0,0,0,0.6)`   | Deeper shadows in dark              |
| `--overlay`        | `rgba(0,0,0,0.5)`   | `rgba(0,0,0,0.75)`  | Modal/drawer backdrop               |

> **Rule:** NEVER flip brand colors between light and dark. Only flip backgrounds, surfaces, text, and borders.

### Dark Mode Do's and Don'ts

| Do                                          | Don't                                    |
|---------------------------------------------|------------------------------------------|
| Use dark gray (`#1A1A1A`) not true black    | Don't use pure white text on pure black  |
| Reduce saturation of accent colors by 10%  | Don't keep identical saturation — burns  |
| Add subtle elevation through shadows       | Don't use white borders on black — harsh |
| Test all text at 7:1 contrast ratio        | Don't assume light mode contrasts work   |

---

## 7. Real Brand Color Breakdowns

### How Top E-Commerce Brands Use Color

| Brand         | Industry        | Brand Primary | CTA Color  | Background  | Design Strategy                                          |
|---------------|-----------------|---------------|------------|-------------|----------------------------------------------------------|
| **Amazon**    | Marketplace     | `#232F3E`     | `#FF9900`  | `#FFFFFF`   | Dark authoritative nav + urgency orange = trust + action |
| **Shopify**   | SaaS Commerce   | `#004C3F`     | `#96BF48`  | `#F4F6F8`   | Deep green brand + lighter green CTA = growth, go        |
| **Apple**     | Electronics     | `#000000`     | `#0071E3`  | `#FFFFFF`   | Pure black + blue CTA = premium + reliable               |
| **Nike**      | Sportswear      | `#111111`     | `#FFFFFF`  | `#111111`   | Near-black + white on dark = bold, fearless              |
| **IKEA**      | Furniture       | `#003399`     | `#FFDA1A`  | `#FFFFFF`   | Blue + yellow = trust + optimism (Swedish flag conscious)|
| **Etsy**      | Handmade        | `#F1641E`     | `#F1641E`  | `#FFFFFF`   | Warm orange = creativity, approachability, human touch   |
| **Glossier**  | Beauty          | `#F7B5C4`     | `#EFC9D3`  | `#FFFFFF`   | Blush tones = modern, minimal femininity                 |
| **Patagonia** | Outdoor         | `#1A3A2A`     | `#D94F0F`  | `#FFFFFF`   | Dark green = nature + red = urgency/passion              |
| **Chewy**     | Pet Supplies    | `#0063B2`     | `#F58220`  | `#FFFFFF`   | Blue = trust + orange = friendly warmth                  |
| **Supreme**   | Streetwear      | `#FF0000`     | `#FFFFFF`  | `#FFFFFF`   | Red mono = instant recognition, scarcity, cult brand     |
| **Allbirds**  | Sustainable     | `#FFFFFF`     | `#2D5532`  | `#F5F1EB`   | Warm ivory + green = natural material credibility        |
| **Warby Parker**| Eyewear       | `#1E4172`     | `#1E4172`  | `#FFFFFF`   | Single navy = confident, anti-flashy premium             |
| **Casper**    | Sleep/Mattress  | `#00A8B0`     | `#00A8B0`  | `#F4F1EB`   | Teal = calm, restful, clinical clean. Cream = cozy       |
| **Dollar Shave Club**| Grooming | `#2A2F35`    | `#00C2A8`  | `#FFFFFF`   | Dark masc. brand + teal = confident, direct, no-nonsense |
| **Mejuri**    | Fine Jewelry    | `#1C1C1C`     | `#C9A84C`  | `#FAF8F3`   | Near-black + gold = accessible luxury                    |

---

## 8. Color Psychology — Deep Research

### How Color Affects Online Purchase Behavior

Research from the **Pantone Color Institute**, **Nielsen Norman Group**, and **KISSmetrics** reveals:

| Color    | Primary Emotion         | Purchase Behavior Effect                                      | Best E-Commerce Placement              |
|----------|-------------------------|---------------------------------------------------------------|----------------------------------------|
| **Red**  | Urgency, excitement     | Increases impulse buying by **20–30%**. Boosts click-through  | Flash sales, countdown timers, "Sale" badges, CTA buttons |
| **Orange** | Energy, warmth        | Highest CTR for CTA buttons in multiple A/B tests             | "Add to Cart", "Buy Now", "Sign Up"    |
| **Yellow** | Optimism, attention   | Grabs attention fastest — but causes fatigue if overused      | Sale banners, new arrival tags         |
| **Green** | Safety, health, go     | Reduces anxiety — signals "safe to proceed"                   | "In Stock", checkout, success states   |
| **Blue**  | Trust, stability       | Most trusted color across all demographics worldwide          | Headers, navigation, payment sections  |
| **Purple** | Luxury, creativity    | Premium price perception. Higher willingness to pay           | Premium tiers, limited editions        |
| **Pink**  | Care, warmth, play     | Increases emotional purchase connection                        | Beauty, baby, gifts, self-care         |
| **Black** | Power, sophistication  | Raises perceived product value dramatically                    | Luxury product frames, premium nav     |
| **White** | Purity, simplicity     | Reduces cognitive load. Helps focus on products               | Product photography, checkout pages    |
| **Brown** | Earthiness, reliability| Signals natural/artisanal quality                             | Organic, handmade, food brands         |
| **Gold**  | Wealth, prestige       | Elevates perceived quality and exclusivity                     | Premium badges, price tags, CTAs       |
| **Gray**  | Balance, neutrality    | Professional, non-distracting. Safe secondary choice          | UI backgrounds, secondary elements     |

### The "Isolation Effect" (Von Restorff Effect)
When one element differs distinctly from everything around it, it gets noticed and clicked.
**Application:** Your CTA button must stand out from the rest of the page. Even a neutral page with a single bright orange button will outperform a colorful page where the button blends in.

### Color and Purchase Confidence (Trust Chain)
Research shows shoppers move through a "trust chain" before buying:
1. **Awareness** → Colors that grab attention (warm, high-saturation)
2. **Trust** → Colors that signal safety (blue, green, white)
3. **Urgency** → Colors that push to action (red, orange, bold accent)
4. **Confirmation** → Colors that reassure (green success states)

Apply this chain across your checkout funnel — awareness on landing pages, trust in checkout, urgency on cart pages, confirmation on thank-you pages.

---

## 9. Cultural & Regional Color Meanings

**Critical for international e-commerce stores.** Colors carry very different meanings across cultures.

### Red

| Region          | Meaning                                              | E-commerce Impact                        |
|-----------------|------------------------------------------------------|------------------------------------------|
| Western          | Danger, urgency, passion, love                       | Sale badges, CTA urgency                |
| China            | Luck, prosperity, celebration, happiness             | Primary brand color, festival branding  |
| India            | Purity, celebration, wedding (specifically saffron)  | Positive — festivals, gifting            |
| Middle East      | Caution, danger                                     | Avoid for trust/finance stores           |
| South Africa     | Mourning                                             | Avoid for sympathy/memorial products     |

### White

| Region          | Meaning                                              |
|-----------------|------------------------------------------------------|
| Western          | Cleanliness, purity, minimalism, modern              |
| China            | Death, mourning, funerals                           |
| Japan            | Purity, but ALSO mourning (context-dependent)        |
| India            | Mourning, widowhood — avoid for wedding brands       |
| Middle East      | Purity, peace                                        |

### Green

| Region          | Meaning                                              |
|-----------------|------------------------------------------------------|
| Western          | Nature, health, money, "go"                          |
| Islamic countries| Sacred color — associated with paradise/Islam        |
| China            | Infidelity (specifically for men wearing green hats) |
| India            | Fertility, new beginnings, prosperity                |
| Latin America    | Death in some contexts                               |

### Yellow

| Region          | Meaning                                              |
|-----------------|------------------------------------------------------|
| Western          | Optimism, warmth, caution                            |
| China            | Imperial, sacred, pornographic (avoid in some uses) |
| Germany          | Envy, jealousy                                       |
| Japan            | Courage, cheerfulness                                |
| Egypt            | Mourning                                             |

### Blue

| Region          | Meaning                                              |
|-----------------|------------------------------------------------------|
| Western          | Trust, reliability, corporate, calm                  |
| Middle East      | Protection, heaven (highly positive)                 |
| China            | Immortality, healing                                 |
| India            | Strength, bravery (Krishna is depicted in blue)      |
| Latin America    | Mourning (some regions)                              |

### Purple

| Region          | Meaning                                              |
|-----------------|------------------------------------------------------|
| Western          | Royalty, luxury, wisdom, mystery                     |
| Thailand         | Mourning, grief (especially widows)                  |
| Brazil           | Death, mourning                                      |
| Japan            | Wealth, privilege                                    |

### International E-Commerce Rules

1. **Never use white as your primary celebratory color** in China, Japan, or India
2. **Red is universally strong for CTAs** but avoid for B2B trust/finance in Middle East
3. **Green is safe globally** — one of the most universally positive colors
4. **Blue is the safest primary** for global stores with no specific cultural adaptation
5. **Always A/B test by region** if you have significant traffic from multiple countries

---

## 10. Typography + Color Pairings

Color alone is not design. The right font + color combination creates a complete brand feel.

### Pairing Guide

| Store Type          | Primary Font          | Body Font         | Recommended Colors                           |
|---------------------|-----------------------|-------------------|----------------------------------------------|
| Luxury Fashion      | Cormorant Garamond    | Jost              | Black + Gold, Navy + Champagne               |
| Modern Minimalist   | Plus Jakarta Sans     | Inter             | Charcoal + White, Warm Gray + Terracotta     |
| Organic / Natural   | Lora                  | Nunito            | Forest Green + Cream, Sage + Warm Beige      |
| Playful / Kids      | Fredoka One           | Nunito            | Sunshine Yellow + Sky Blue + Coral           |
| Tech / Corporate    | Inter                 | Inter             | Deep Navy + White + Signal Green             |
| Streetwear / Urban  | Bebas Neue            | IBM Plex Mono     | Black + White + Electric Accent              |
| Artisan / Craft     | Playfair Display      | Libre Baskerville | Espresso + Parchment + Amber                 |
| Sports / Fitness    | Barlow Condensed      | Barlow            | Dark Navy + Red + White                      |
| Medical / Wellness  | Source Serif Pro      | Source Sans Pro   | Clinical Blue + White + Teal                 |
| Pet / Kids-Friendly | Nunito                | Open Sans         | Friendly Teal + Warm Orange + Cream          |

### Text Hierarchy Color Rules

```
H1 (Page Title)     → Brand Primary or text-primary. Size: 40–64px. Weight: 700–800.
H2 (Section Title)  → text-primary. Size: 28–36px. Weight: 600–700.
H3 (Card Title)     → text-primary or brand-secondary. Size: 20–24px. Weight: 600.
Body Text           → text-primary. Size: 16–18px. Weight: 400–500. Line-height: 1.6.
Caption / Metadata  → text-secondary. Size: 12–14px. Weight: 400.
Price (Primary)     → text-primary or brand-primary. Size: 24–32px. Weight: 700.
Price (Sale)        → error/red. Size: 24px. Weight: 700. Strikethrough on original.
Badge / Label       → accent color bg + white text. Uppercase. Font-size: 10–12px.
Button Text         → Always white or very dark on colored buttons. Weight: 600.
Link Text           → brand-secondary or cta color. Underline on hover only.
```

---

## 11. Gradient & Duotone Trends

### 2025–2026 Gradient Trends for E-Commerce

#### Mesh Gradients
Organic, multi-point color blends. No hard linear direction.
```css
/* Example: Pastel Mesh */
background: radial-gradient(at 20% 50%, #A8D8EA 0%, transparent 60%),
            radial-gradient(at 80% 20%, #FCBAD3 0%, transparent 60%),
            radial-gradient(at 50% 80%, #FFFFD2 0%, transparent 60%),
            #F9F9F9;
```

#### Horizontal Gradient Headers
Brand primary to secondary across hero sections.
```css
/* Classic retail hero */
background: linear-gradient(135deg, #1A3C5E 0%, #2E86C1 100%);

/* Luxury hero */
background: linear-gradient(135deg, #0A0A0A 0%, #2C2C2C 100%);

/* Sports/energy hero */
background: linear-gradient(135deg, #050A1A 0%, #003BFF 100%);
```

#### Aurora / Northern Lights
Cool neons on dark backgrounds. Popular in tech and Web3.
```css
background: linear-gradient(135deg, #0F0F1A 0%, #1A0A3A 50%, #0A1A3A 100%);
/* Add colored glow elements via radial gradients layered on top */
```

#### Warm Sunset Gradients
Orange → Pink → Purple. Used by beauty, lifestyle, food brands.
```css
background: linear-gradient(135deg, #FF6B35 0%, #E040FB 50%, #4361EE 100%);
```

### Duotone Technique
Apply two-color filter over photography for a distinctive brand look.
Works best with:
- Black + Brand Primary (sophisticated, editorial)
- Brand Primary + White (clean, modern)
- Two complementary accent colors (bold, artistic)

```css
/* Duotone CSS filter approach */
.hero-image {
  filter: grayscale(100%);
  mix-blend-mode: multiply;
  background-color: #E8691E; /* Your brand color */
}
```

---

## 12. Email Marketing Color Guide

Email rendering is different from web — only inline CSS, limited font support, and no CSS variables.

### Email-Specific Rules

| Rule                                        | Reason                                                  |
|---------------------------------------------|---------------------------------------------------------|
| Always use inline HEX colors               | CSS variables don't work in most email clients           |
| Use web-safe fallback fonts                 | Custom fonts don't render in Gmail, Outlook, Apple Mail  |
| Background must be solid color or none     | Gradients don't render in Outlook                        |
| Buttons need solid background + padding    | `<a>` tags need `bgcolor` attribute for Outlook          |
| Test white text on colored buttons         | Dark mode email clients can invert backgrounds           |
| Keep dark mode in mind — use `@media`      | ~35% of email opens are in dark mode (2024)              |

### Email Color Palette Template

| Element                   | Recommended Color    | Notes                                          |
|---------------------------|----------------------|------------------------------------------------|
| Email background          | `#F4F6F8`            | Slightly off-white — easier on the eye          |
| Content background        | `#FFFFFF`            | Pure white for content blocks                   |
| Header banner background  | Your brand-primary   | Full-width, 600px max                          |
| Header text               | `#FFFFFF`            | White for contrast on dark header               |
| Body text                 | `#1D2D35`            | Near-black for readability                      |
| Secondary text            | `#637074`            | For metadata, timestamps, sub-text              |
| CTA button background     | Your CTA color       | Minimum 200px wide, 44px+ tall                 |
| CTA button text           | `#FFFFFF`            | Always white on colored CTA                     |
| Divider line              | `#DDE1E5`            | 1px horizontal rule                            |
| Footer background         | `#2C2C2C`            | Dark footer with unsubscribe links              |
| Footer text               | `#9090A0`            | Muted gray for legal/unsubscribe copy          |

### Email Dark Mode Toggle (Media Query)

```css
@media (prefers-color-scheme: dark) {
  .email-body { background-color: #1A1A1A !important; }
  .content-block { background-color: #2A2A2A !important; }
  .email-text { color: #F0F0F0 !important; }
  .email-secondary { color: #909090 !important; }
  .email-divider { border-color: #3A3A3A !important; }
}
```

---

## 13. Social Media Color Guide

Your store's social channels need to align with but not exactly duplicate your e-commerce palette.

### Platform-Specific Color Guidance

| Platform       | Dominant Audience  | Optimal Palette Approach                                          |
|----------------|--------------------|-------------------------------------------------------------------|
| **Instagram**  | 18–35, visual-led  | High-saturation or muted-aesthetic. No clutter. Lifestyle imagery |
| **TikTok**     | 13–28, Gen-Z       | Bold, high-energy, unpolished. Neon accents work well             |
| **Pinterest**  | 25–44, female-led  | Warm tones, lifestyle photography, earthy/natural palettes        |
| **Facebook**   | 35–60, broad       | Trust-centric. Blues, greens. Clear product shots on white        |
| **X (Twitter)**| 25–45, text-heavy  | High contrast text. Minimal color decoration                      |
| **YouTube**    | All ages, video    | Thumbnail: High contrast, 2–3 max colors, large readable text     |
| **LinkedIn**   | B2B, professional  | Corporate blues, clean white. Professional photography            |

### Brand Color Consistency Rules for Social

1. **Profile photo / avatar** — Always use your brand-primary color as background if showing logo
2. **Story highlights** — Use brand-primary with white icon overlays
3. **Feed grid** — Maintain consistent color temperature (all warm OR all cool)
4. **Product shots** — Consistent background: white, brand-primary, or lifestyle context
5. **CTA in posts** — Use your CTA color sparingly in graphics — it should "pop" vs. feed

---

## 14. Accessibility & WCAG Standards

### WCAG 2.1 Levels Explained

| Level | Requirement                                           | Who It Applies To              |
|-------|-------------------------------------------------------|--------------------------------|
| A     | Minimum — basic barriers removed                     | Legally required in many countries |
| AA    | Standard — most websites should hit this             | Recommended for all e-commerce |
| AAA   | Enhanced — maximum accessibility                     | Target for healthcare, finance |

### Contrast Ratio Requirements

| Text Type                        | WCAG AA    | WCAG AAA   |
|----------------------------------|------------|------------|
| Normal text (< 18px)             | ≥ 4.5 : 1  | ≥ 7 : 1    |
| Large text (≥ 18px or 14px bold) | ≥ 3 : 1    | ≥ 4.5 : 1  |
| UI components / icons            | ≥ 3 : 1    | —          |
| Decorative elements              | No req.    | No req.    |

### Real Color Pair Contrast Ratios

| Background     | Foreground     | Ratio    | WCAG AA Normal | WCAG AA Large |
|----------------|----------------|----------|----------------|---------------|
| `#FFFFFF`      | `#000000`      | 21.0 : 1 | PASS           | PASS          |
| `#FFFFFF`      | `#1D2D35`      | 15.2 : 1 | PASS           | PASS          |
| `#FFFFFF`      | `#637074`      | 5.4 : 1  | PASS           | PASS          |
| `#FFFFFF`      | `#9090A0`      | 3.2 : 1  | FAIL           | PASS          |
| `#FFFFFF`      | `#C9A84C`      | 2.4 : 1  | FAIL           | FAIL          |
| `#1D2D35`      | `#FFFFFF`      | 15.2 : 1 | PASS           | PASS          |
| `#1D2D35`      | `#F5A623`      | 6.4 : 1  | PASS           | PASS          |
| `#003087`      | `#FFFFFF`      | 13.8 : 1 | PASS           | PASS          |
| `#2D6A4F`      | `#FFFFFF`      | 5.1 : 1  | PASS           | PASS          |
| `#C9A84C`      | `#0A0A0A`      | 9.4 : 1  | PASS           | PASS          |
| `#E8691E`      | `#FFFFFF`      | 2.9 : 1  | FAIL           | FAIL          |
| `#E8691E`      | `#000000`      | 7.3 : 1  | PASS           | PASS          |
| `#FFD600`      | `#000000`      | 16.4 : 1 | PASS           | PASS          |
| `#FFD600`      | `#FFFFFF`      | 1.3 : 1  | FAIL           | FAIL          |
| `#FF1A1A`      | `#FFFFFF`      | 3.4 : 1  | FAIL           | PASS          |
| `#FF1A1A`      | `#000000`      | 6.2 : 1  | PASS           | PASS          |

> **Key takeaway:** Yellow, Orange, and Light colors FAIL with white text. Always use dark text on light/bright backgrounds.

### Color Blindness Considerations

**8% of males and 0.5% of females** have some form of color vision deficiency.

| Type                | What they can't see     | Safe pairs to use instead                |
|---------------------|-------------------------|------------------------------------------|
| Deuteranopia (Red-Green most common) | Red vs Green distinction | Blue + Orange, Blue + Yellow |
| Protanopia (Red)    | Red appears dark         | Avoid red-only error states; add icons   |
| Tritanopia (Blue)   | Blue vs Yellow           | Use high lightness contrast instead      |

**Rules for color-blind safe design:**
1. Never use color as the ONLY indicator (e.g., red for error must also have an icon or label)
2. In charts/graphs, use patterns + colors, not colors alone
3. Ensure "In Stock" vs "Out of Stock" differs in more than just green vs red
4. Test with tools: Chrome DevTools Color Blindness Emulation, Stark Figma plugin

---

## 15. CSS Custom Properties — Full Snippets

### Classic & Trustworthy Theme

```css
:root {
  /* Brand */
  --brand-primary:      #1A3C5E;
  --brand-secondary:    #2E86C1;
  --accent:             #F5A623;
  --accent-alt:         #E07B39;

  /* Backgrounds */
  --bg-base:            #F4F6F8;
  --bg-surface:         #FFFFFF;
  --bg-subtle:          #EBF0F5;

  /* Text */
  --text-primary:       #1D2D35;
  --text-secondary:     #637074;
  --text-inverted:      #FFFFFF;

  /* Actions */
  --cta:                #E8691E;
  --cta-hover:          #C45718;

  /* States */
  --success:            #27AE60;
  --warning:            #F39C12;
  --error:              #E74C3C;
  --info:               #2980B9;

  /* Structure */
  --border:             #DDE1E5;
  --shadow:             rgba(0, 0, 0, 0.08);

  /* Radius */
  --radius-sm:          4px;
  --radius-md:          8px;
  --radius-lg:          16px;
  --radius-full:        9999px;

  /* Spacing scale */
  --space-1:            4px;
  --space-2:            8px;
  --space-3:            12px;
  --space-4:            16px;
  --space-6:            24px;
  --space-8:            32px;
  --space-12:           48px;
  --space-16:           64px;
}
```

### Luxury Premium Theme

```css
:root {
  --brand-primary:      #0A0A0A;
  --brand-secondary:    #2C2C2C;
  --accent:             #C9A84C;
  --accent-alt:         #E8E4DC;
  --bg-base:            #FAF8F3;
  --bg-surface:         #F5F0E8;
  --bg-subtle:          #EDEDEB;
  --text-primary:       #1C1C1C;
  --text-secondary:     #7A7065;
  --text-inverted:      #FAF8F3;
  --cta:                #A8862E;
  --cta-hover:          #8A6E25;
  --success:            #1A6B4A;
  --warning:            #C8961A;
  --error:              #9B2335;
  --info:               #5C738A;
  --border:             #E0D9CC;
  --shadow:             rgba(0, 0, 0, 0.12);
  --radius-sm:          2px;
  --radius-md:          4px;
  --radius-lg:          8px;
  --radius-full:        9999px;
}
```

### Fresh & Natural Theme

```css
:root {
  --brand-primary:      #2D6A4F;
  --brand-secondary:    #52B788;
  --accent:             #C47C5A;
  --accent-alt:         #D4A373;
  --bg-base:            #FEFAE0;
  --bg-surface:         #F5EFE6;
  --bg-subtle:          #EAF0E8;
  --text-primary:       #1B4332;
  --text-secondary:     #6B705C;
  --text-inverted:      #FFFFFF;
  --cta:                #40916C;
  --cta-hover:          #33745A;
  --success:            #52B788;
  --warning:            #E07A2F;
  --error:              #A63C2E;
  --info:               #5B9BD5;
  --border:             #D8E2D5;
  --shadow:             rgba(45, 106, 79, 0.10);
  --radius-sm:          6px;
  --radius-md:          12px;
  --radius-lg:          20px;
  --radius-full:        9999px;
}
```

### Dark Commerce Theme

```css
:root {
  --brand-primary:      #141414;
  --brand-secondary:    #1E1E1E;
  --accent:             #C0A060;
  --accent-alt:         #9FAFCE;
  --bg-base:            #0A0A0A;
  --bg-surface:         #1A1A1A;
  --bg-subtle:          #242424;
  --text-primary:       #F5F5F5;
  --text-secondary:     #808080;
  --text-inverted:      #0A0A0A;
  --cta:                #C0A060;
  --cta-hover:          #9E8040;
  --success:            #2ECC71;
  --warning:            #F1C40F;
  --error:              #E74C3C;
  --info:               #3498DB;
  --border:             #2A2A2A;
  --shadow:             rgba(0, 0, 0, 0.5);
  --radius-sm:          2px;
  --radius-md:          4px;
  --radius-lg:          8px;
  --radius-full:        9999px;
}
```

---

## 16. Conversion Rate Optimization (CRO)

### Research-Backed CRO Statistics

| Finding                                                      | Source / Data                           |
|--------------------------------------------------------------|-----------------------------------------|
| Orange CTA buttons outperform green by **12.5%** on average | HubSpot A/B Test Research               |
| Red "Buy Now" increases impulse purchase by **21%**          | Kissmetrics 2023                        |
| **93%** of shoppers cite visual appearance as primary reason | ColorMatters.com Survey                 |
| Changing CTA button from green to orange = **+32.5% CTR**   | SAP A/B Test (2,000+ sessions)          |
| Dark mode users have **18% longer session time** on premium sites | UX Research Institute 2024          |
| **85%** of purchase decisions are influenced by color alone  | Loyola University Color Study           |
| Color increases brand recognition by **80%**                 | University of Loyola Maryland           |
| Blue is preferred by **46%** of global consumers**           | Colorcom Research                       |
| Color-coordinated CTAs convert **3x better** than non-matched | ConversionXL Research                 |

### CTA Button Optimization

**Best CTA colors ranked by CTR (average across industries):**
1. Orange (`#FF6B00`) — Best for general retail & marketplaces
2. Red (`#E63946`) — Best for urgency-heavy stores (sales, food, events)
3. Green (`#27AE60`) — Best for trust-heavy stores (finance, medical, B2B)
4. Blue (`#0066CC`) — Best for corporate/B2B with existing blue branding
5. Pink/Magenta — Best for beauty, cosmetics, feminine brands

**The 3 Rules of CTA Color:**
1. **Contrast rule** — CTA must stand out from its direct surroundings. Minimum 3:1 contrast ratio vs background
2. **Isolation rule** — Surround CTA with 24–40px of neutral whitespace on all sides
3. **Uniqueness rule** — The CTA color should NOT appear anywhere else on the page in large quantities

### The 60–30–10 Color Rule

```
60% → Background & neutral areas (bg-base, bg-surface, bg-subtle)
30% → Brand color (headers, navigation, secondary blocks, icons)
10% → Accent & CTA (buttons, badges, highlights, tags)
```

Breaking this rule creates visual noise and reduces click-through rates.

### Page-Level Color Strategy

| Page Type         | Color Priority                                                        |
|-------------------|-----------------------------------------------------------------------|
| Home / Landing    | Brand primary hero + CTA. Maximum 3 colors visible at once            |
| Category / Browse | Neutral bg, white cards. CTA color on "Add to Cart" only              |
| Product Detail    | White/neutral background. Product photography is the hero. CTA = bold |
| Cart              | Neutral, low distraction. Green "Proceed" CTA. Trust badges in blue   |
| Checkout          | Maximum trust. Blue/green. Remove all non-essential color              |
| Thank You         | Green success states. Warm brand colors. Reinforce positive feeling    |
| 404 Error         | Friendly brand colors. Not red. Keep it on-brand and helpful          |

### Trust Signal Colors

| Trust Element               | Recommended Color   | Reasoning                                     |
|-----------------------------|---------------------|-----------------------------------------------|
| SSL badge / Security icon   | `#27AE60` Green     | Safety, "go", secure                          |
| Payment logos               | Brand neutral gray  | Non-distracting, professional                 |
| Star ratings                | `#F5A623` Gold      | Achievement, quality, warmth                  |
| "In Stock" label            | `#27AE60` Green     | Availability, positive                        |
| "Low Stock" badge           | `#F39C12` Amber     | Moderate urgency without panic                |
| "Out of Stock"              | `#E74C3C` Red       | Clear unavailability                          |
| "Sale" badge                | `#E74C3C` Red       | Urgency, discount excitement                  |
| "New" badge                 | Brand-primary       | Fresh, on-brand announcement                  |
| "Best Seller" badge         | `#F5A623` Gold/Amber| Achievement, popularity                       |
| Free shipping notice        | `#27AE60` Green     | Positive incentive, "go" signal               |
| Review quote callout        | Brand-secondary     | Trust, social proof, credibility              |

---

## 17. Color Combination Rules

### Proven Combinations That Work

| Combination                    | Contrast Feel | Best Industry                   | Why It Works                             |
|-------------------------------|---------------|----------------------------------|------------------------------------------|
| Navy + Orange                  | High          | General retail, marketplace      | Complementary. Trust + urgency           |
| Black + Gold                   | High          | Luxury, fashion, jewelry         | Premium signal. Timeless elegance        |
| White + Forest Green           | Medium        | Organic, health, wellness        | Natural, clean, trustworthy              |
| Cream + Terracotta             | Low-Medium    | Artisan, food, home decor        | Warm, approachable, handcrafted feel     |
| Dark Navy + Neon Cyan          | Very High     | Tech, gaming, sports             | High-tech, futuristic, electric energy   |
| Blush + Lavender               | Low           | Beauty, self-care, feminine      | Soft luxury, emotional warmth            |
| Cool White + Clinical Blue     | Medium        | Medical, health, supplements     | Clinical trust, sterility, safety        |
| Matte Black + Electric Accent  | Very High     | Streetwear, gaming, alternative  | Contrast = cult branding                 |
| Pale Sand + Warm Brown         | Low-Medium    | Furniture, handmade, coffee      | Earthiness, comfort, naturalism          |
| Royal Blue + Signal Green CTA  | Medium        | B2B, SaaS, fintech               | Authority + positive action              |

### Combinations to Avoid

| Combination                    | Problem                                                      |
|-------------------------------|--------------------------------------------------------------|
| Red + Green (equal weight)     | Christmas effect unless intentionally seasonal               |
| Yellow text on White bg        | Near-zero contrast — fails WCAG                              |
| Red + Blue (equal dominance)   | Visual noise, no hierarchy — confusing brand perception      |
| Multiple neon colors together  | Overstimulation, cheap "party" feel                          |
| Pink primary + Pink CTA        | No contrast hierarchy — CTA invisible                        |
| Light gray text on white bg    | Fails WCAG AA — unreadable for many users                    |
| Neon on neon                   | Eye strain. Brand feels low-quality                          |
| Black text on dark red         | Accessibility failure — nearly unreadable                    |
| Rainbow = no palette           | No brand coherence, cognitive overload, mistrust             |

---

## 18. How to Build Your Own Palette

### Step-by-Step Process

#### Step 1 — Define Brand Personality (5 minutes)
Answer these 6 questions:
1. Is my brand **serious or playful**?
2. Is my price point **budget / mid-range / luxury**?
3. Is my audience **young or mature**?
4. Is my audience primarily **male / female / neutral**?
5. What **3 adjectives** describe my brand feeling?
6. What **emotion** should customers feel when they see my store?

#### Step 2 — Pick Your Brand Primary Color
Use the psychology table in Section 8 to map your answers to a color family.
Then pick a specific shade that matches your saturation/lightness strategy from Section 2.

#### Step 3 — Derive Your Full Token Set
Starting from your primary color:
- **brand-secondary** — Same hue, increase lightness by 20–30%
- **accent** — Complementary hue (180° opposite), high saturation
- **bg-base** — Same hue as primary, but 90–95% lightness
- **bg-surface** — Pure white or 97–98% lightness
- **text-primary** — Same hue as primary, 5–15% lightness
- **text-secondary** — Same hue, 40–50% lightness
- **cta** — Your highest-contrast, most eye-catching color

#### Step 4 — Check Accessibility
Before coding anything, verify:
- [ ] text-primary on bg-base passes 4.5:1
- [ ] text-primary on bg-surface passes 4.5:1
- [ ] White text on cta button passes 4.5:1
- [ ] White text on brand-primary passes 4.5:1

#### Step 5 — Build Your Dark Mode Variant
Swap only: bg-base, bg-surface, bg-subtle, text-primary, text-secondary, border.
Keep all brand colors the same. Re-verify contrast ratios.

#### Step 6 — Test at Scale
- [ ] Test on mobile (OLED vs LCD difference in color rendering)
- [ ] Test in dark mode
- [ ] Test with color blindness simulation
- [ ] Run an A/B test on CTA button color if possible
- [ ] Get 5+ user reactions before shipping

---

## 19. Tools, Resources & Checklist

### Color Generation Tools

| Tool                       | URL / Description                                             |
|----------------------------|---------------------------------------------------------------|
| **Coolors**                | coolors.co — Fast palette generator, export to CSS/JSON       |
| **Realtime Colors**        | realtimecolors.com — Preview palettes on a live e-commerce UI |
| **Khroma**                 | khroma.co — AI-trained on millions of palettes                |
| **Adobe Color**            | color.adobe.com — Harmony rules, accessibility checker        |
| **Paletton**               | paletton.com — Classic color wheel palette builder            |
| **Color Hunt**             | colorhunt.co — Curated community palettes                     |
| **Open Color**             | yeun.github.io/open-color — Open-source UI color system       |
| **Tailwind Color Palette** | tailwindcss.com/docs/colors — Ready-to-use scale system       |
| **Radix Colors**           | radix-ui.com/colors — Accessible semantic scale               |

### Accessibility Testing Tools

| Tool                       | Description                                                  |
|----------------------------|--------------------------------------------------------------|
| **WebAIM Contrast Checker** | webaim.org/resources/contrastchecker — Quick ratio check    |
| **Colour Contrast Analyser**| Desktop app — dropper + ratio display                       |
| **Stark (Figma Plugin)**   | Color blindness + WCAG check inside Figma                    |
| **Chrome DevTools**        | Inspect > Accessibility tab for contrast warnings             |
| **axe DevTools**           | Browser extension — full accessibility audit                 |
| **Accessible Colors**      | accessible-colors.com — Adjust until you pass                |

### Brand Color Research Tools

| Tool                       | Description                                                  |
|----------------------------|--------------------------------------------------------------|
| **BrandColors**            | brandcolors.net — Official colors of 600+ brands            |
| **Sitepalette**            | Chrome extension — extract any website's palette            |
| **ColorZilla**             | Browser eyedropper extension                                 |
| **WhatFont + ColorPick**   | Combined: identify fonts AND colors from any site            |

### Final Launch Checklist

Before publishing your store's design:

**Colors**
- [ ] 60–30–10 rule applied across all pages
- [ ] CTA color appears nowhere else in large quantity
- [ ] All text passes WCAG AA contrast (4.5:1 for normal text)
- [ ] Dark mode variant built and tested
- [ ] Color blindness test passed (deuteranopia at minimum)
- [ ] Cultural fit confirmed for target regions

**Typography**
- [ ] 2 fonts max (display + body)
- [ ] Text hierarchy consistent across all pages
- [ ] Body text 16px minimum, line-height 1.5–1.6
- [ ] Link colors clearly distinguishable from body text

**Interaction States**
- [ ] Hover states on all interactive elements (10–15% darker)
- [ ] Focus states visible for keyboard navigation (2px outline)
- [ ] Disabled states clearly muted (not just grayed out — add cursor: not-allowed)
- [ ] Loading skeleton uses `#E2E8F0` (not white/blank)

**Brand Consistency**
- [ ] Social media profiles match store palette
- [ ] Email templates match store palette
- [ ] Ad creative matches store palette
- [ ] Logo readable on all background colors

---

*Built with research from: Pantone Color Institute, Nielsen Norman Group, KISSmetrics, Baymard Institute, HubSpot CRO Research, WCAG 2.1 W3C Standard, ColorMatters.com, Loyola University Color Psychology Study, Google Material Design, Colorcom Global Color Preferences Study.*

*Version 2.0 — May 2026*
