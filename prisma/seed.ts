/**
 * Development sample catalogue. Products, prices and stock are illustrative
 * data for building and testing the store — replace before launch.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const TOP_SIZES = ["S", "M", "L", "XL", "XXL"];
const BOTTOM_SIZES = ["30", "32", "34", "36", "38"];

const img = (slug: string) => `/images/products/${slug}.jpg`;

type Seed = {
  slug: string;
  name: string;
  category: "t-shirts" | "shirts" | "jeans" | "trousers";
  price: number;
  compareAtPrice?: number;
  color: [name: string, hex: string];
  material: string;
  fit: string;
  description: string;
  details: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  collections: string[];
  /** Stock per size, in size order. */
  stock: number[];
};

const CARE_TOP = "Machine wash cold with similar colours. Do not tumble dry. Warm iron on reverse.";
const CARE_DENIM = "Wash inside out, cold, and sparingly. Line dry to preserve colour.";

const products: Seed[] = [
  {
    slug: "essential-cotton-heavyweight-tee",
    name: "Essential Cotton Heavyweight Tee",
    category: "t-shirts",
    price: 129_900,
    color: ["Sage", "#8a9a86"],
    material: "100% cotton jersey",
    fit: "Regular fit",
    description:
      "A dense, structured crewneck that keeps its shape through the day. Cut with a slightly dropped shoulder for an easy, modern line.",
    details: ["Ribbed crew neckline", "Dropped shoulder", "Straight hem"],
    isNew: true,
    collections: ["everyday-essentials", "weekend-comfort"],
    stock: [8, 14, 12, 6, 3],
  },
  {
    slug: "supima-relaxed-crewneck-tee",
    name: "Supima Relaxed Crewneck Tee",
    category: "t-shirts",
    price: 149_900,
    color: ["Black", "#1b1c1a"],
    material: "100% Supima cotton",
    fit: "Relaxed fit",
    description:
      "Smooth long-staple cotton with a soft hand and a relaxed body. An everyday layer that works under an overshirt or on its own.",
    details: ["Contrast-free tonal stitching", "Relaxed body", "Mid-weight jersey"],
    isBestSeller: true,
    collections: ["urban-streetwear"],
    stock: [5, 10, 10, 7, 2],
  },
  {
    slug: "textured-waffle-knit-polo",
    name: "Textured Waffle-Knit Polo",
    category: "t-shirts",
    price: 189_900,
    color: ["Forest Green", "#0a3525"],
    material: "Cotton waffle knit",
    fit: "Regular fit",
    description:
      "A breathable waffle-knit polo with a soft collar and a clean three-button placket. Smart enough for the office, easy enough for the weekend.",
    details: ["Three-button placket", "Soft knitted collar", "Ribbed cuffs"],
    isBestSeller: true,
    collections: ["weekend-comfort", "smart-casual"],
    stock: [4, 9, 8, 4, 0],
  },
  {
    slug: "relaxed-heavyweight-tee",
    name: "Relaxed Heavyweight Tee",
    category: "t-shirts",
    price: 119_900,
    compareAtPrice: 149_900,
    color: ["White", "#f4f3f0"],
    material: "100% cotton jersey",
    fit: "Relaxed fit",
    description:
      "A boxy white tee in a heavier jersey that won't turn sheer. The foundation of a minimal wardrobe.",
    details: ["Boxy relaxed body", "Reinforced neck tape", "Pre-washed for softness"],
    collections: ["everyday-essentials"],
    stock: [6, 12, 11, 5, 4],
  },
  {
    slug: "relaxed-fit-oxford-overshirt",
    name: "Relaxed Fit Oxford Overshirt",
    category: "shirts",
    price: 249_900,
    color: ["Ecru", "#e3ddd0"],
    material: "Cotton Oxford weave",
    fit: "Relaxed fit",
    description:
      "A weighty Oxford overshirt designed to be worn open over a tee or buttoned as a shirt. Chest pockets and a softly structured collar.",
    details: ["Two chest pockets", "Button-through front", "Curved hem"],
    isNew: true,
    collections: ["everyday-essentials", "smart-casual"],
    stock: [3, 7, 8, 5, 2],
  },
  {
    slug: "resort-collar-linen-shirt",
    name: "Resort Collar Linen Shirt",
    category: "shirts",
    price: 229_900,
    color: ["White", "#f4f3f0"],
    material: "Linen blend",
    fit: "Relaxed fit",
    description:
      "An open resort collar and short sleeves in an airy linen blend. Built for warm days and relaxed evenings.",
    details: ["Camp collar", "Short sleeves", "Straight hem for wearing untucked"],
    isBestSeller: true,
    collections: ["smart-casual"],
    stock: [4, 0, 6, 6, 3],
  },
  {
    slug: "cotton-poplin-relaxed-shirt",
    name: "Cotton Poplin Relaxed Shirt",
    category: "shirts",
    price: 199_900,
    color: ["Sky Blue", "#a9c3dc"],
    material: "Cotton poplin",
    fit: "Relaxed fit",
    description:
      "Crisp, lightweight poplin in a relaxed silhouette. A clean button-down that moves easily between desk and dinner.",
    details: ["Button-down collar", "Single chest pocket", "Back box pleat"],
    isNew: true,
    collections: ["everyday-essentials"],
    stock: [5, 8, 9, 4, 1],
  },
  {
    slug: "chambray-utility-shirt",
    name: "Chambray Utility Shirt",
    category: "shirts",
    price: 219_900,
    compareAtPrice: 259_900,
    color: ["Chambray Blue", "#6f8fae"],
    material: "Cotton chambray",
    fit: "Regular fit",
    description:
      "Soft chambray with utility-inspired details and a subtle micro print. Wear it buttoned up or layered open.",
    details: ["Point collar", "Button cuffs", "Tonal buttons"],
    collections: ["smart-casual"],
    stock: [2, 5, 6, 3, 0],
  },
  {
    slug: "japanese-denim-straight-fit",
    name: "Japanese Denim Straight Fit",
    category: "jeans",
    price: 349_900,
    color: ["Raw Indigo", "#1f2a44"],
    material: "Selvedge denim",
    fit: "Straight fit",
    description:
      "Rigid selvedge denim in a timeless straight leg. Designed to soften and fade with your wear.",
    details: ["Five-pocket construction", "Button fly", "Selvedge outseam"],
    isBestSeller: true,
    collections: ["urban-streetwear"],
    stock: [3, 6, 7, 4, 2],
  },
  {
    slug: "slim-tapered-jeans",
    name: "Slim Tapered Jeans",
    category: "jeans",
    price: 279_900,
    color: ["Washed Black", "#2b2b2b"],
    material: "Stretch cotton denim",
    fit: "Slim tapered fit",
    description:
      "A slim thigh that tapers to a clean ankle, with a touch of stretch for all-day comfort.",
    details: ["Five-pocket construction", "Zip fly", "Comfort stretch"],
    isNew: true,
    collections: ["urban-streetwear"],
    stock: [6, 9, 9, 5, 2],
  },
  {
    slug: "relaxed-rinse-wash-jeans",
    name: "Relaxed Rinse Wash Jeans",
    category: "jeans",
    price: 299_900,
    color: ["Rinse Indigo", "#2c3e5c"],
    material: "100% cotton denim",
    fit: "Relaxed fit",
    description:
      "A roomier leg in a deep rinse wash. Easy through the hip and thigh with a straight finish.",
    details: ["Five-pocket construction", "Button fly", "Relaxed seat and thigh"],
    collections: ["weekend-comfort"],
    stock: [4, 7, 6, 3, 1],
  },
  {
    slug: "light-wash-straight-jeans",
    name: "Light Wash Straight Jeans",
    category: "jeans",
    price: 259_900,
    compareAtPrice: 319_900,
    color: ["Light Wash", "#9fb3c8"],
    material: "100% cotton denim",
    fit: "Straight fit",
    description:
      "A light, lived-in wash on a classic straight leg — the easy counterpoint to darker denim.",
    details: ["Five-pocket construction", "Zip fly", "Vintage-inspired wash"],
    collections: ["urban-streetwear"],
    stock: [5, 8, 0, 4, 2],
  },
  {
    slug: "everyday-straight-fit-chinos",
    name: "Everyday Straight-Fit Chinos",
    category: "trousers",
    price: 289_900,
    compareAtPrice: 349_900,
    color: ["Khaki", "#c2ad86"],
    material: "Cotton twill",
    fit: "Straight fit",
    description:
      "Clean, versatile chinos in a mid-weight twill. Sharp enough to pair with a blazer, relaxed enough for every day.",
    details: ["Slant front pockets", "Welt back pockets", "Zip fly with button closure"],
    isNew: true,
    collections: ["everyday-essentials"],
    stock: [5, 9, 10, 6, 3],
  },
  {
    slug: "pleated-straight-leg-trousers",
    name: "Pleated Straight-Leg Trousers",
    category: "trousers",
    price: 319_900,
    color: ["Charcoal", "#3a3b3c"],
    material: "Wool-blend suiting",
    fit: "Straight fit",
    description:
      "Single front pleats and a straight, fluid leg. Tailored trousers that drape cleanly with a blazer or a knit.",
    details: ["Single front pleats", "Extended waistband tab", "Side adjusters"],
    isBestSeller: true,
    collections: ["smart-casual"],
    stock: [2, 4, 4, 3, 1],
  },
  {
    slug: "cotton-twill-joggers",
    name: "Cotton Twill Joggers",
    category: "trousers",
    price: 199_900,
    color: ["Tan", "#b39a72"],
    material: "Cotton twill",
    fit: "Tapered fit",
    description:
      "Tailored joggers with an elasticated waist and cuffed hem — the comfort of loungewear with a neater line.",
    details: ["Elasticated drawstring waist", "Ribbed ankle cuffs", "Side seam pockets"],
    collections: ["weekend-comfort", "urban-streetwear"],
    stock: [7, 10, 9, 6, 0],
  },
  {
    slug: "relaxed-drawstring-trousers",
    name: "Relaxed Drawstring Trousers",
    category: "trousers",
    price: 249_900,
    color: ["Navy", "#23304a"],
    material: "Brushed cotton",
    fit: "Relaxed fit",
    description:
      "Soft brushed-cotton trousers with a drawstring waist and a relaxed straight leg, made for unhurried weekends.",
    details: ["Drawstring waist", "Side pockets", "Relaxed straight leg"],
    isNew: true,
    collections: ["weekend-comfort"],
    stock: [4, 8, 8, 5, 2],
  },
];

const categories = [
  { slug: "t-shirts", name: "T-Shirts", image: img("essential-cotton-heavyweight-tee"), description: "Heavyweight tees, polos and everyday crewnecks." },
  { slug: "shirts", name: "Shirts", image: "/images/categories/shirts.jpg", description: "Oxford, poplin, linen and chambray shirts." },
  { slug: "jeans", name: "Jeans", image: img("japanese-denim-straight-fit"), description: "Straight, slim and relaxed denim." },
  { slug: "trousers", name: "Trousers", image: img("everyday-straight-fit-chinos"), description: "Chinos, pleated trousers and joggers." },
];

const collections = [
  { slug: "everyday-essentials", name: "Everyday Essentials", image: img("relaxed-fit-oxford-overshirt"), description: "Clean neutrals, breathable cottons, and functional silhouettes tailored for daily reliability." },
  { slug: "urban-streetwear", name: "Urban Streetwear", image: img("light-wash-straight-jeans"), description: "Relaxed shapes, washed textures, and easy layers for the city." },
  { slug: "smart-casual", name: "Smart Casual", image: img("pleated-straight-leg-trousers"), description: "Effortless tailoring, unlined collars, and crisp breathable fabrics." },
  { slug: "weekend-comfort", name: "Weekend Comfort", image: img("relaxed-drawstring-trousers"), description: "Soft textures, easy waists, and relaxed staples for slower days." },
];

async function main() {
  // Rebuild the catalogue from scratch; customer data is left alone.
  await db.variant.deleteMany();
  await db.productImage.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.collection.deleteMany();

  for (const [i, c] of categories.entries()) {
    await db.category.create({ data: { ...c, sortOrder: i } });
  }
  for (const [i, c] of collections.entries()) {
    await db.collection.create({ data: { ...c, sortOrder: i } });
  }

  // Stagger createdAt so "newest" sorting is deterministic.
  const now = Date.now();
  for (const [i, p] of products.entries()) {
    const sizes = p.category === "jeans" || p.category === "trousers" ? BOTTOM_SIZES : TOP_SIZES;
    const [colorName, colorHex] = p.color;
    await db.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        details: p.details,
        material: p.material,
        fit: p.fit,
        care: p.category === "jeans" ? CARE_DENIM : CARE_TOP,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        isNew: p.isNew ?? false,
        isBestSeller: p.isBestSeller ?? false,
        createdAt: new Date(now - (products.length - i) * 86_400_000),
        category: { connect: { slug: p.category } },
        collections: { connect: p.collections.map((slug) => ({ slug })) },
        images: { create: [{ url: img(p.slug), alt: `${p.name} in ${colorName}`, sortOrder: 0 }] },
        variants: {
          create: sizes.map((size, sizeOrder) => ({
            sku: `${p.slug}-${colorName}-${size}`.toUpperCase().replace(/[^A-Z0-9]+/g, "-"),
            size,
            sizeOrder,
            colorName,
            colorHex,
            stock: p.stock[sizeOrder] ?? 0,
          })),
        },
      },
    });
  }

  // Sample coupon for testing the discount flow in development.
  await db.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", type: "PERCENT", value: 10, minSubtotal: 0, maxDiscount: 50_000 },
  });

  console.log(`Seeded ${categories.length} categories, ${collections.length} collections, ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
