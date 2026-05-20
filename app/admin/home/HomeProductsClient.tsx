"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Package, Tag, Trash2 } from "lucide-react";
import { removeHomepageProduct, updateHomepageProduct } from "./actions";

type ProductItem = {
  id: string;
  name: string;
  featured: boolean;
  featuredOrder: number;
  inStock: boolean;
  stockCount: number;
  description: string | null;
  brand: { name: string | null } | null;
  images: { url: string }[];
};

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        "relative h-8 w-[54px] rounded-full transition",
        checked ? "bg-emerald-700" : "bg-neutral-300",
      ].join(" ")}
      aria-pressed={checked}
      aria-label="Show on homepage"
    >
      <span
        className={[
          "absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-all",
          checked ? "left-[26px]" : "left-1",
        ].join(" ")}
      />
    </button>
  );
}

function MetaLine({
  icon: Icon,
  text,
  className = "",
}: {
  icon: React.ComponentType<{ className?: string }>
  text: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 text-[13px] ${className}`}
    >
      <Icon className="h-4 w-4 text-neutral-400" />
      <span>{text}</span>
    </div>
  )
}

function SortableProductRow({
  product,
  displayOrder,
}: {
  product: ProductItem;
  displayOrder: number;
}) {
  const router = useRouter();
  const [featured, setFeatured] = useState(product.featured);
  const [order, setOrder] = useState(String(displayOrder));

  useEffect(() => setFeatured(product.featured), [product.featured]);
  useEffect(() => setOrder(String(displayOrder)), [displayOrder]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : 1,
  };

  const imageUrl = product.images[0]?.url || "/bags.png";

  return (
    <form
      ref={setNodeRef}
      style={style}
      action={updateHomepageProduct}
      className="border-t border-neutral-200 bg-white first:border-t-0"
    >
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="featured" value={featured ? "on" : ""} />

      <div className="grid min-h-[190px] grid-cols-1 lg:grid-cols-[44px_140px_minmax(0,1fr)_170px_170px_170px]">
        <div className="flex items-center justify-center px-5 py-5 ml-2">
          <button
            type="button"
            aria-label="Drag to reorder"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-7 w-7" />
          </button>
        </div>

        <div className="flex items-center justify-center border-r border-neutral-100 bg-white px-4 py-5">
          <div className="relative h-[120px] w-[120px] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-contain p-3"
              sizes="120px"
            />
          </div>
        </div>

        <div className="flex items-center border-r border-neutral-100 px-5 py-5">
          <div className="grid w-full grid-cols-[210px_minmax(0,1fr)] gap-5">
            <div className="min-w-0">
              <h2 className="truncate text-[18px] font-semibold text-neutral-950">
                {product.name}
              </h2>

              <div className="mt-3 space-y-2">
                <MetaLine icon={Tag} text={product.brand?.name || "No brand"} />
                <MetaLine
                  icon={Package}
                  text={
                    product.inStock
                      ? `In stock (${product.stockCount})`
                      : "Out of stock"
                  }
                  className={
                    product.inStock
                      ? "text-emerald-600"
                      : "text-red-500"
                  }
                />
              </div>
            </div>

            <div className="min-w-0">
              <p className="line-clamp-3 text-[12px] leading-5 text-neutral-500">
                {product.description || "No description added."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-start border-r border-neutral-100 px-5 py-5">
          <div className="flex flex-col items-start gap-3">
            <ToggleSwitch checked={featured} onChange={setFeatured} />
            <span className="text-[13px] text-neutral-500">
              Show on homepage
            </span>
          </div>
        </div>

        <div className="flex items-center border-r border-neutral-100 px-5 py-5">
          <input
            name="featuredOrder"
            type="number"
            value={order}
            onChange={(e) => setOrder(e.currentTarget.value)}
            className="h-12 w-[112px] rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-neutral-900"
          />
        </div>

        <div className="flex items-center gap-3 px-5 py-5">
          <button
            type="submit"
            formAction={removeHomepageProduct}
            className="flex h-12 w-14 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50"
            aria-label="Remove from homepage"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <button
            type="submit"
            className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-emerald-700 px-6 text-xs font-medium text-white transition hover:bg-emerald-800"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
}

export default function HomeProductsClient({
  products,
}: {
  products: ProductItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(products);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setItems(products);
  }, [products]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ids = useMemo(() => items.map((item) => item.id), [items]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
      ...item,
      featuredOrder: index + 1,
    }));

    setItems(next);

    await fetch("/api/admin/home/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: next.map((item) => ({
          id: item.id,
          featuredOrder: item.featuredOrder,
        })),
      }),
    });

    router.refresh();
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
        <div className="grid grid-cols-[44px_140px_minmax(0,1fr)_170px_170px_170px] border-b border-neutral-200 bg-neutral-50 text-[13px] font-medium text-neutral-500">
          <div />
          <div className="col-span-2 px-5 py-4">Product</div>
          <div className="px-5 py-4">Status</div>
          <div className="px-5 py-4">Homepage Order</div>
          <div className="px-5 py-4">Actions</div>
        </div>

        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-neutral-500">
            No products found.
          </div>
        ) : (
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="divide-y divide-neutral-200">
              {items.map((product, index) => (
                <SortableProductRow
                  key={product.id}
                  product={product}
                  displayOrder={index + 1}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>

      {activeId ? (
        <div className="sr-only" aria-live="polite">
          Dragging product {activeId}
        </div>
      ) : null}
    </DndContext>
  );
}
