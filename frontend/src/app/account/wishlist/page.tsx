"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MediaImage from "@/components/MediaImage";
import { getWishlist, removeFromWishlist, type WishlistItem } from "@/lib/user-api";
import { hasMediaSrc } from "@/lib/media";

function categoryPath(category: string) {
  if (category === "trekking") return "trekking";
  if (category === "tour") return "tours";
  return "adventure";
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    getWishlist().then(setItems).catch(() => {});
  }, []);

  async function handleRemove(id: number) {
    setLoadingId(id);
    try {
      await removeFromWishlist(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch {
      // ignore
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">My Wishlist</h2>
      <p className="text-muted text-sm mb-6">Packages you saved for later.</p>

      {items.length === 0 ? (
        <p className="text-muted">Your wishlist is empty. Browse our packages and save your favorites.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => {
            const image = item.package.image_url || item.package.image;
            const path = categoryPath(item.package.category);

            return (
              <div key={item.id} className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
                <Link href={`/${path}/${item.package.slug}`} className="group block">
                  <div className="relative h-44 overflow-hidden">
                    {hasMediaSrc(image) ? (
                      <MediaImage src={image} alt={item.package.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : null}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{item.package.title}</h3>
                    <p className="mt-1 text-sm capitalize text-muted">{item.package.category}</p>
                    {item.package.price ? (
                      <p className="mt-2 font-semibold text-primary">
                        {item.package.price_label} {item.package.price}
                      </p>
                    ) : null}
                  </div>
                </Link>
                <div className="border-t border-border px-5 py-3">
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    disabled={loadingId === item.id}
                    className="text-sm text-red-600 hover:underline disabled:opacity-50"
                  >
                    {loadingId === item.id ? "Removing..." : "Remove from wishlist"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
