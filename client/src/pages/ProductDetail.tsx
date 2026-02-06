import { useRoute } from "wouter";
import { products } from "@/data/products";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const product = products.find((p) => p.slug === params?.slug);

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p className="mt-4">{product.description}</p>
    </div>
  );
}
