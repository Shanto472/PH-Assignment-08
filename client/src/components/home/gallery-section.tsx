"use client";

import { useState } from "react";
import { FALLBACK_EVENT_IMAGE } from "@/lib/utils";

const GALLERY_ITEMS = [
  {
    title: "Winter Clothes Distribution – Mirpur 10",
    category: "Donation",
    image:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Blanket Drive – Mohammadpur Town Hall",
    category: "Community Care",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Urban Tree Plantation – Uttara Sector 11",
    category: "Plantation",
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Lakeside Plastic Cleanup – Dhanmondi",
    category: "Cleanup",
    image:
      "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Neighborhood Food Box Share – Banani",
    category: "Food Drive",
    image:
      "https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Weekend Youth Book Camp – Old Dhaka",
    category: "Education",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
  },
];

function GalleryTile({
  item,
}: {
  item: (typeof GALLERY_ITEMS)[number];
}) {
  const [src, setSrc] = useState(item.image);

  return (
    <figure className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted">
        <img
          src={src}
          alt={item.title}
          onError={() => setSrc(FALLBACK_EVENT_IMAGE)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <figcaption className="flex flex-1 flex-col justify-between p-4">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          {item.category}
        </span>
        <p className="mt-1 text-base font-bold text-foreground">{item.title}</p>
      </figcaption>
    </figure>
  );
}

export function GallerySection() {
  return (
    <section className="border-t border-border bg-surface-muted/40 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center space-y-3">
          <span className="inline-flex rounded-full bg-accent/15 px-3.5 py-1 text-xs font-bold tracking-wide text-accent uppercase">
            Moments in Action
          </span>
          <h2 className="section-heading">Community Service Gallery</h2>
          <p className="section-subtitle">
            Snapshots from volunteers showing up across neighborhoods to build
            cleaner parks, warmer winters, and stronger support networks.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GALLERY_ITEMS.map((item) => (
            <GalleryTile key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
