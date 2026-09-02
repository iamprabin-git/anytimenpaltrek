"use client";

import { useEffect, useState } from "react";
import ImageUploadField from "@/components/ImageUploadField";
import {
  deleteAdminDestination,
  deleteAdminHeroSlide,
  getAdminDestinations,
  getAdminHeroSlides,
  saveAdminDestinationForm,
  saveAdminHeroSlideForm,
} from "@/lib/admin-api";
import type { Destination, HeroSlide } from "@/types";

type Tab = "hero" | "destinations";

function appendCheckbox(formData: FormData, form: HTMLFormElement, name: string) {
  const input = form.elements.namedItem(name) as HTMLInputElement | null;
  formData.set(name, input?.checked ? "1" : "0");
}

export default function AdminHomeContentPage() {
  const [tab, setTab] = useState<Tab>("hero");
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadAll() {
    const [slides, places] = await Promise.all([getAdminHeroSlides(), getAdminDestinations()]);
    setHeroSlides(slides);
    setDestinations(places);
  }

  useEffect(() => {
    loadAll().catch(() => {});
  }, []);

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "hero", label: "Hero Slider" },
    { id: "destinations", label: "Destinations" },
  ];

  return (
    <div>
      <h1 className="panel-title mb-2">Home Content</h1>
      <p className="mb-6 text-sm text-muted">
        Manage homepage hero slides and destination cards shown on the public site.
      </p>

      {message ? <p className="mb-4 text-green-600">{message}</p> : null}
      {error ? <p className="mb-4 text-red-600">{error}</p> : null}

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === item.id ? "bg-primary text-white" : "bg-surface border border-border"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "hero" ? (
        <HeroSlidesPanel
          slides={heroSlides}
          onSaved={() => {
            setMessage("Hero slide saved.");
            setError("");
            loadAll().catch(() => {});
          }}
          onError={(value) => {
            setError(value);
            setMessage("");
          }}
        />
      ) : null}

      {tab === "destinations" ? (
        <DestinationsPanel
          destinations={destinations}
          onSaved={() => {
            setMessage("Destination saved.");
            setError("");
            loadAll().catch(() => {});
          }}
          onError={(value) => {
            setError(value);
            setMessage("");
          }}
        />
      ) : null}
    </div>
  );
}

function HeroSlidesPanel({
  slides,
  onSaved,
  onError,
}: {
  slides: HeroSlide[];
  onSaved: () => void;
  onError: (message: string) => void;
}) {
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [creating, setCreating] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, id: number | null) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    appendCheckbox(formData, form, "is_active");

    try {
      await saveAdminHeroSlideForm(id, formData);
      setEditing(null);
      setCreating(false);
      onSaved();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not save hero slide.");
    }
  }

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => setCreating((value) => !value)} className="btn-primary">
        {creating ? "Cancel" : "Add Hero Slide"}
      </button>

      {creating ? (
        <form onSubmit={(e) => handleSubmit(e, null)} encType="multipart/form-data" className="panel-card grid grid-cols-1 gap-4 md:grid-cols-2">
          <HeroSlideFields />
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary">Create Slide</button>
          </div>
        </form>
      ) : null}

      {slides.map((slide) => (
        <div key={slide.id} className="panel-card space-y-4">
          {editing?.id === slide.id ? (
            <form onSubmit={(e) => handleSubmit(e, slide.id)} encType="multipart/form-data" className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <HeroSlideFields slide={slide} />
              <div className="flex gap-3 md:col-span-2">
                <button type="submit" className="btn-primary">Save Slide</button>
                <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-border px-4 py-2 text-sm">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{slide.title}</h3>
                <p className="text-sm text-muted">{slide.subtitle}</p>
                <p className="mt-1 text-xs text-muted">Order: {slide.sort_order ?? 0} · {slide.is_active ? "Active" : "Hidden"}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditing(slide)} className="text-sm font-semibold text-primary">
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteAdminHeroSlide(slide.id).then(onSaved).catch((err) => onError(err instanceof Error ? err.message : "Delete failed."))}
                  className="text-sm text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function HeroSlideFields({ slide }: { slide?: HeroSlide }) {
  return (
    <>
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input name="title" required defaultValue={slide?.title || ""} className="panel-input" />
      </div>
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Subtitle</label>
        <input name="subtitle" defaultValue={slide?.subtitle || ""} className="panel-input" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">CTA text</label>
        <input name="cta_text" defaultValue={slide?.cta_text || ""} className="panel-input" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">CTA link</label>
        <input name="cta_link" defaultValue={slide?.cta_link || ""} className="panel-input" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Sort order</label>
        <input name="sort_order" type="number" min={0} defaultValue={slide?.sort_order ?? 0} className="panel-input" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={slide?.is_active ?? true} />
        Active
      </label>
      <div className="md:col-span-2">
        <ImageUploadField
          label="Slide image"
          name="image_file"
          removeName="remove_image"
          previewUrl={slide?.image}
          allowRemove
        />
      </div>
    </>
  );
}

function DestinationsPanel({
  destinations,
  onSaved,
  onError,
}: {
  destinations: Destination[];
  onSaved: () => void;
  onError: (message: string) => void;
}) {
  const [editing, setEditing] = useState<Destination | null>(null);
  const [creating, setCreating] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, id: number | null) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await saveAdminDestinationForm(id, formData);
      setEditing(null);
      setCreating(false);
      onSaved();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not save destination.");
    }
  }

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => setCreating((value) => !value)} className="btn-primary">
        {creating ? "Cancel" : "Add Destination"}
      </button>

      {creating ? (
        <form onSubmit={(e) => handleSubmit(e, null)} encType="multipart/form-data" className="panel-card grid grid-cols-1 gap-4 md:grid-cols-2">
          <DestinationFields />
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary">Create Destination</button>
          </div>
        </form>
      ) : null}

      {destinations.map((destination) => (
        <div key={destination.id} className="panel-card space-y-4">
          {editing?.id === destination.id ? (
            <form onSubmit={(e) => handleSubmit(e, destination.id)} encType="multipart/form-data" className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DestinationFields destination={destination} />
              <div className="flex gap-3 md:col-span-2">
                <button type="submit" className="btn-primary">Save Destination</button>
                <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-border px-4 py-2 text-sm">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{destination.name}</h3>
                <p className="text-sm text-muted">{destination.description}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditing(destination)} className="text-sm font-semibold text-primary">
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteAdminDestination(destination.id).then(onSaved).catch((err) => onError(err instanceof Error ? err.message : "Delete failed."))}
                  className="text-sm text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function DestinationFields({ destination }: { destination?: Destination }) {
  return (
    <>
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Name</label>
        <input name="name" required defaultValue={destination?.name || ""} className="panel-input" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Temperature °C</label>
        <input name="temperature_c" type="number" defaultValue={destination?.temperature_c ?? ""} className="panel-input" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Temperature °F</label>
        <input name="temperature_f" type="number" defaultValue={destination?.temperature_f ?? ""} className="panel-input" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Sort order</label>
        <input name="sort_order" type="number" min={0} defaultValue={destination?.sort_order ?? 0} className="panel-input" />
      </div>
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea name="description" rows={3} defaultValue={destination?.description || ""} className="panel-input" />
      </div>
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Attractions (one per line)</label>
        <textarea
          name="attractions_text"
          rows={4}
          defaultValue={(destination?.attractions || []).join("\n")}
          className="panel-input"
        />
      </div>
      <div className="md:col-span-2">
        <ImageUploadField label="Destination image" name="image_file" removeName="remove_image" previewUrl={destination?.image} allowRemove />
      </div>
    </>
  );
}
