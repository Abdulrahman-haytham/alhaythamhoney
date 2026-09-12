import "server-only";
import { db } from "@/lib/db";

export async function getProducts() {
  return db.product.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({ where: { slug } });
}
