"use client";

import { useEffect, useState } from "react";
import ImageUploadField from "@/components/ImageUploadField";
import GalleryUploadField from "@/components/GalleryUploadField";
import {
  deleteAgentPackage,
  getAgentPackages,
  saveAgentPackageForm,
} from "@/lib/agent-api";
import { hasPermission } from "@/lib/auth";
import type { Package } from "@/types";

export type PackageCategory = "trekking" | "tour" | "adventure";

const CATEGORY_LABELS: Record<PackageCategory, string> = {
  trekking: "Trekking",
  tour: "Tour",
  adventure: "Adventure",
};

function appendCheckbox(formData: FormData, form: HTMLFormElement, name: string) {
  const input = form.elements.namedItem(name) as HTMLInputElement | null;
  formData.set(name, input?.checked ? "1" : "0");
}

function PackageForm({
  initial,
  slug,
  submitLabel,
  categoryOptions,
  onCancel,
  onSaved,
}: {
  initial: Partial<Package>;
  slug?: string;
  submitLabel: string;
  categoryOptions: PackageCategory[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const lockedCategory = categoryOptions.length === 1 ? categoryOptions[0] : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    appendCheckbox(formData, form, "is_active");
    appendCheckbox(formData, form, "is_featured");
    appendCheckbox(formData, form, "is_season_pick");

    try {
      await saveAgentPackageForm(initial.id ?? null, formData);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save package.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="panel-card mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
      {slug ? (
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">URL Slug</label>
          <input value={slug} disabled className="panel-input bg-surface-muted" />
        </div>
      ) : null}

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Title *</label>
        <input name="title" required defaultValue={initial.title || ""} className="panel-input" />
      </div>

      {lockedCategory ? (
        <input type="hidden" name="category" value={lockedCategory} />
      ) : (
        <div>
          <label className="mb-1 block text-sm font-medium">Category *</label>
          <select
            name="category"
            required
            defaultValue={initial.category || categoryOptions[0]}
            className="panel-input"
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Country</label>
        <input name="country" defaultValue={initial.country || "Nepal"} className="panel-input" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Region</label>
        <input name="region" defaultValue={initial.region || ""} placeholder="Annapurna Region" className="panel-input" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Duration (days) *</label>
        <input name="duration_days" type="number" min={1} required defaultValue={initial.duration_days || 1} className="panel-input" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Price</label>
        <input name="price" type="number" step="0.01" min={0} defaultValue={initial.price ?? ""} className="panel-input" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Price Label</label>
        <input name="price_label" defaultValue={initial.price_label || "USD"} className="panel-input" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Rating (1-5)</label>
        <input name="rating" type="number" min={1} max={5} defaultValue={initial.rating ?? 5} className="panel-input" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Difficulty</label>
        <input name="difficulty" defaultValue={initial.difficulty || ""} placeholder="Strenuous, Moderate, Easy..." className="panel-input" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Difficulty Score (1-5)</label>
        <input name="difficulty_score" type="number" min={1} max={5} defaultValue={initial.difficulty_score ?? ""} className="panel-input" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Group Size Min</label>
        <input name="group_size_min" type="number" min={1} defaultValue={initial.group_size_min ?? ""} className="panel-input" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Group Size Max</label>
        <input name="group_size_max" type="number" min={1} defaultValue={initial.group_size_max ?? ""} className="panel-input" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Max Altitude (m)</label>
        <input name="max_altitude" type="number" min={0} defaultValue={initial.max_altitude ?? ""} className="panel-input" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Sort Order</label>
        <input name="sort_order" type="number" min={0} defaultValue={initial.sort_order ?? 0} className="panel-input" />
      </div>

      <div className="md:col-span-2">
        <ImageUploadField label="Main Image" previewUrl={initial.image} allowRemove={!!initial.id} />
      </div>

      <div className="md:col-span-2">
        <GalleryUploadField images={initial.gallery_images} />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Short Description</label>
        <textarea name="short_description" rows={2} defaultValue={initial.short_description || ""} className="panel-input" />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Full Description</label>
        <textarea name="description" rows={5} defaultValue={initial.description || ""} className="panel-input" />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Itinerary</label>
        <textarea
          name="itinerary"
          rows={6}
          defaultValue={initial.itinerary || ""}
          placeholder="Day-by-day itinerary. Use blank lines between sections."
          className="panel-input"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Availability / Pricing Details</label>
        <textarea
          name="availability_pricing"
          rows={5}
          defaultValue={initial.availability_pricing || ""}
          placeholder="Season availability, inclusions, pricing notes..."
          className="panel-input"
        />
      </div>

      <div className="flex flex-wrap gap-6 md:col-span-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={initial.is_active ?? true} />
          Active on website
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_featured" defaultChecked={initial.is_featured ?? false} />
          Best selling section (homepage)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_season_pick" defaultChecked={initial.is_season_pick ?? false} />
          Trip of the season (homepage)
        </label>
      </div>
      <p className="text-xs text-muted md:col-span-2">
        The first four active packages by sort order appear in the homepage featured grid. Use sort order to control placement.
      </p>

      {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}

      <div className="flex flex-wrap gap-3 md:col-span-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? "Saving..." : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-muted">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AgentPackagesPanel({
  title,
  description,
  categories,
  defaultCategory,
  addLabel = "Add Package",
}: {
  title: string;
  description: string;
  categories: PackageCategory[];
  defaultCategory: PackageCategory;
  addLabel?: string;
}) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [mode, setMode] = useState<"none" | "create" | "edit">("none");
  const [editing, setEditing] = useState<Package | null>(null);
  const canEdit = hasPermission("packages.update");
  const canDelete = hasPermission("packages.delete");
  const canCreate = hasPermission("packages.create");
  const showCategoryColumn = categories.length > 1;

  async function load() {
    const categoryFilter = categories.length === 1 ? categories[0] : undefined;
    const items = await getAgentPackages(categoryFilter);
    setPackages(
      categories.length === 1 ? items : items.filter((pkg) => categories.includes((pkg.category || "") as PackageCategory))
    );
  }

  useEffect(() => {
    load().catch(() => {});
  }, [categories.join(",")]);

  function closeForm() {
    setMode("none");
    setEditing(null);
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="panel-title mb-2">{title}</h1>
          <p className="text-sm text-muted">{description}</p>
        </div>
        {canCreate ? (
          <button
            type="button"
            onClick={() => (mode === "create" ? closeForm() : (setEditing(null), setMode("create")))}
            className="btn-primary"
          >
            {mode === "create" ? "Cancel" : addLabel}
          </button>
        ) : null}
      </div>

      {mode === "create" ? (
        <PackageForm
          initial={{ category: defaultCategory, duration_days: 1, price_label: "USD", rating: 5, is_active: true }}
          categoryOptions={categories}
          submitLabel={addLabel}
          onCancel={closeForm}
          onSaved={() => {
            closeForm();
            load();
          }}
        />
      ) : null}

      {mode === "edit" && editing ? (
        <PackageForm
          initial={editing}
          slug={editing.slug}
          categoryOptions={categories}
          submitLabel="Save Changes"
          onCancel={closeForm}
          onSaved={() => {
            closeForm();
            load();
          }}
        />
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        {packages.length === 0 ? (
          <p className="p-6 text-sm text-muted">No packages found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                <th className="p-4 text-left font-semibold">Title</th>
                {showCategoryColumn ? <th className="p-4 text-left font-semibold">Category</th> : null}
                <th className="p-4 text-left font-semibold">Duration</th>
                <th className="p-4 text-left font-semibold">Price</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium">{pkg.title}</td>
                  {showCategoryColumn ? <td className="p-4 capitalize">{pkg.category}</td> : null}
                  <td className="p-4">{pkg.duration_days} days</td>
                  <td className="p-4">{pkg.price ? `${pkg.price_label} ${pkg.price}` : "—"}</td>
                  <td className="p-4">
                    <span className={pkg.is_active ? "text-green-600" : "text-muted"}>
                      {pkg.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {canEdit ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(pkg);
                            setMode("edit");
                          }}
                          className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-surface-muted"
                        >
                          Edit
                        </button>
                      ) : null}
                      {canDelete ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete "${pkg.title}"?`)) {
                              deleteAgentPackage(pkg.id).then(load);
                            }
                          }}
                          className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
