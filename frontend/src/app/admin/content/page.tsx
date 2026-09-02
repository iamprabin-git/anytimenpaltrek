"use client";

import { useEffect, useState } from "react";
import { getAdminSiteContent, updateAdminFooterForm, updateAdminPageSectionsForm, updateAdminSiteContent } from "@/lib/admin-api";
import ImageUploadField from "@/components/ImageUploadField";
import GalleryUploadField from "@/components/GalleryUploadField";
import { SOCIAL_PLATFORMS } from "@/components/SocialNetworkIcon";
import { LOCALES, type LocaleCode } from "@/lib/i18n/locales";
import {
  companyInfoPageSlugs,
  getCompanyInfoSections,
  mergeCompanyInfoSections,
  pageSectionHref,
  slugifyPageSection,
} from "@/lib/site-content";
import type { AffiliationBadge, FooterPartnerBadge, LegalDocument, NavLink, PageSection, SiteContentMap, SitePageContent, TeamMember, TeamMemberSocialLink } from "@/types/site-content";

type Tab = "header" | "footer" | "company_info" | "home" | "pages" | "page_sections" | "seo";
type SaveableSection = "header" | "footer" | "home" | "pages" | "seo";

const pageKeys: Array<keyof SiteContentMap["pages"]> = [
  "contact",
  "trekking",
  "tours",
  "adventure",
  "blog",
  "reviews_write",
];

function NavLinksEditor({
  links,
  onChange,
}: {
  links: NavLink[];
  onChange: (links: NavLink[]) => void;
}) {
  return (
    <div className="space-y-3">
      {links.map((link, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
          <input
            value={link.label}
            onChange={(e) => {
              const next = [...links];
              next[index] = { ...link, label: e.target.value };
              onChange(next);
            }}
            placeholder="Label"
            className="panel-input"
          />
          <input
            value={link.href}
            onChange={(e) => {
              const next = [...links];
              next[index] = { ...link, href: e.target.value };
              onChange(next);
            }}
            placeholder="/path"
            className="panel-input"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={link.visible !== false}
              onChange={(e) => {
                const next = [...links];
                next[index] = { ...link, visible: e.target.checked };
                onChange(next);
              }}
            />
            Visible
          </label>
          <button
            type="button"
            onClick={() => onChange(links.filter((_, i) => i !== index))}
            className="text-red-600 text-sm"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...links, { label: "New Link", href: "/", visible: true }])}
        className="text-primary text-sm font-semibold"
      >
        + Add link
      </button>
    </div>
  );
}

function createEmptyPageSection(companyPage = false): PageSection {
  const slug = companyPage ? "new-company-page" : "new-page";
  return {
    id: `section-${Date.now()}`,
    slug,
    nav_label: companyPage ? "New Company Page" : "New Page",
    visible: true,
    show_in_header: false,
    show_in_footer: !companyPage,
    show_in_company_menu: companyPage,
    layout: "content",
    meta_title: companyPage ? "New Company Page" : "New Page",
    meta_description: "",
    hero_title: companyPage ? "New Company Page" : "New Page",
    hero_subtitle: "",
    heading: "",
    paragraphs: [],
    list_title: "",
    list_items: [],
    features: [],
    team_members: [],
    legal_documents: [],
  };
}

function sectionPublicPath(section: PageSection, menuItems: NavLink[]): string {
  const matched = menuItems.find((item) => {
    if (item.href.startsWith("/pages/")) {
      return item.href === pageSectionHref(section.slug);
    }
    return item.href === `/${section.slug}`;
  });

  return matched?.href || pageSectionHref(section.slug);
}

function sectionFieldKey(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_") || "section";
}

function memberFieldKey(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_") || "member";
}

function createEmptyTeamMember(): TeamMember {
  const id = `member-${Date.now()}`;
  return {
    id,
    slug: id,
    name: "New Team Member",
    role: "Role / Title",
    tagline: "Years of experience",
    visible: true,
    email: "",
    phone: "",
    whatsapp: "",
    biography: "",
    social_links: [],
  };
}

function TeamMembersEditor({
  members,
  sectionId,
  sectionSlug,
  onChange,
}: {
  members: TeamMember[];
  sectionId: string;
  sectionSlug: string;
  onChange: (members: TeamMember[]) => void;
}) {
  const sectionKey = sectionFieldKey(sectionId);

  function updateMember(index: number, next: TeamMember) {
    const items = [...members];
    items[index] = next;
    onChange(items);
  }

  function updateSocialLink(memberIndex: number, linkIndex: number, next: TeamMemberSocialLink) {
    const member = members[memberIndex];
    const links = [...(member.social_links || [])];
    links[linkIndex] = next;
    updateMember(memberIndex, { ...member, social_links: links });
  }

  return (
    <div className="space-y-4 rounded-lg border border-dashed border-border p-4">
      <div>
        <h4 className="font-semibold">Team members</h4>
        <p className="text-xs text-muted">Cards appear in a four-column grid on desktop, matching the Our Team page design.</p>
      </div>

      {members.map((member, memberIndex) => (
        <div key={member.id} className="space-y-3 rounded-lg border border-border bg-surface-muted/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h5 className="font-medium">{member.name || "Team member"}</h5>
            <button
              type="button"
              onClick={() => onChange(members.filter((_, i) => i !== memberIndex))}
              className="text-sm text-red-600"
            >
              Remove member
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField
              label="Name"
              value={member.name}
              onChange={(value) => updateMember(memberIndex, { ...member, name: value })}
            />
            <TextField
              label="Profile URL slug"
              value={member.slug || member.id}
              onChange={(value) =>
                updateMember(memberIndex, {
                  ...member,
                  slug: slugifyPageSection(value || member.name),
                })
              }
            />
            <TextField
              label="Role / title"
              value={member.role}
              onChange={(value) => updateMember(memberIndex, { ...member, role: value })}
            />
            <TextField
              label="Experience / tagline"
              value={member.tagline}
              onChange={(value) => updateMember(memberIndex, { ...member, tagline: value })}
            />
          </div>

          <p className="text-xs text-muted">
            Profile page: /pages/{sectionSlug}/{member.slug || member.id}
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <TextField
              label="Email"
              value={member.email || ""}
              onChange={(value) => updateMember(memberIndex, { ...member, email: value })}
            />
            <TextField
              label="Phone"
              value={member.phone || ""}
              onChange={(value) => updateMember(memberIndex, { ...member, phone: value })}
            />
            <TextField
              label="WhatsApp"
              value={member.whatsapp || ""}
              onChange={(value) => updateMember(memberIndex, { ...member, whatsapp: value })}
            />
          </div>

          <TextField
            label="Biography (one paragraph per line)"
            value={member.biography || ""}
            onChange={(value) => updateMember(memberIndex, { ...member, biography: value })}
            rows={6}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={member.visible !== false}
              onChange={(e) => updateMember(memberIndex, { ...member, visible: e.target.checked })}
            />
            Visible on page
          </label>

          <ImageUploadField
            label="Profile photo"
            hint="Portrait photo shown at the top of the card."
            name={`team_photo_file_${sectionKey}_${memberFieldKey(member.id)}`}
            removeName={`remove_team_photo_${sectionKey}_${memberFieldKey(member.id)}`}
            previewUrl={member.photo}
            allowRemove
          />

          <div className="space-y-2">
            <p className="text-sm font-medium">Social media links</p>
            {(member.social_links || []).map((link, linkIndex) => (
              <div key={linkIndex} className="grid grid-cols-1 gap-2 md:grid-cols-[180px_1fr_auto] md:items-center">
                <select
                  value={link.platform}
                  onChange={(e) =>
                    updateSocialLink(memberIndex, linkIndex, {
                      ...link,
                      platform: e.target.value,
                      label: SOCIAL_PLATFORMS.find((item) => item.value === e.target.value)?.label,
                    })
                  }
                  className="panel-input"
                >
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
                <input
                  value={link.href}
                  onChange={(e) => updateSocialLink(memberIndex, linkIndex, { ...link, href: e.target.value })}
                  placeholder="https://..."
                  className="panel-input"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateMember(memberIndex, {
                      ...member,
                      social_links: (member.social_links || []).filter((_, i) => i !== linkIndex),
                    })
                  }
                  className="text-sm text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                updateMember(memberIndex, {
                  ...member,
                  social_links: [
                    ...(member.social_links || []),
                    { platform: "facebook", label: "Facebook", href: "" },
                  ],
                })
              }
              className="text-sm font-semibold text-primary"
            >
              + Add social link
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...members, createEmptyTeamMember()])}
        className="text-sm font-semibold text-primary"
      >
        + Add team member
      </button>
    </div>
  );
}

function createEmptyPartnerBadge(): FooterPartnerBadge {
  const id = `partner-${Date.now()}`;
  return {
    id,
    label: "New Platform",
    href: "",
    visible: true,
  };
}

function PartnerBadgesEditor({
  badges,
  onChange,
}: {
  badges: FooterPartnerBadge[];
  onChange: (badges: FooterPartnerBadge[]) => void;
}) {
  function updateBadge(index: number, next: FooterPartnerBadge) {
    const items = [...badges];
    items[index] = next;
    onChange(items);
  }

  return (
    <div className="space-y-4 rounded-lg border border-dashed border-border p-4">
      <div>
        <h4 className="font-semibold">Footer booking platforms</h4>
        <p className="text-xs text-muted">
          TripAdvisor, Booking.com, Google, and other review or booking sites shown in the footer.
        </p>
      </div>

      {badges.map((badge, index) => (
        <div key={badge.id} className="space-y-3 rounded-lg border border-border bg-surface-muted/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h5 className="font-medium">{badge.label || "Platform badge"}</h5>
            <button
              type="button"
              onClick={() => onChange(badges.filter((_, i) => i !== index))}
              className="text-sm text-red-600"
            >
              Remove platform
            </button>
          </div>

          <TextField
            label="Platform name"
            value={badge.label}
            onChange={(value) => updateBadge(index, { ...badge, label: value })}
          />
          <TextField
            label="Profile or listing URL"
            value={badge.href || ""}
            onChange={(value) => updateBadge(index, { ...badge, href: value })}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={badge.visible !== false}
              onChange={(e) => updateBadge(index, { ...badge, visible: e.target.checked })}
            />
            Visible in footer
          </label>

          <ImageUploadField
            label="Logo image (optional)"
            hint="Upload a logo to replace the default styled label."
            name={`partner_image_file_${memberFieldKey(badge.id)}`}
            removeName={`remove_partner_image_${memberFieldKey(badge.id)}`}
            previewUrl={badge.image}
            allowRemove
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...badges, createEmptyPartnerBadge()])}
        className="text-sm font-semibold text-primary"
      >
        + Add platform
      </button>
    </div>
  );
}

function createEmptyAffiliationBadge(): AffiliationBadge {
  const id = `affiliation-${Date.now()}`;
  return {
    id,
    label: "New Affiliation",
    description: "",
    visible: true,
  };
}

function AffiliationBadgesEditor({
  badges,
  onChange,
}: {
  badges: AffiliationBadge[];
  onChange: (badges: AffiliationBadge[]) => void;
}) {
  function updateBadge(index: number, next: AffiliationBadge) {
    const items = [...badges];
    items[index] = next;
    onChange(items);
  }

  return (
    <div className="space-y-4 rounded-lg border border-dashed border-border p-4">
      <div>
        <h4 className="font-semibold">Homepage affiliation logos</h4>
        <p className="text-xs text-muted">
          Shown on the homepage in a white banner above the footer. Upload logo images and add the registration text.
        </p>
      </div>

      {badges.map((badge, index) => (
        <div key={badge.id} className="space-y-3 rounded-lg border border-border bg-surface-muted/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h5 className="font-medium">{badge.label || "Affiliation badge"}</h5>
            <button
              type="button"
              onClick={() => onChange(badges.filter((_, i) => i !== index))}
              className="text-sm text-red-600"
            >
              Remove badge
            </button>
          </div>

          <TextField
            label="Short label"
            value={badge.label}
            onChange={(value) => updateBadge(index, { ...badge, label: value })}
          />
          <TextField
            label="Description (shown next to logo)"
            value={badge.description || ""}
            onChange={(value) => updateBadge(index, { ...badge, description: value })}
            rows={2}
          />
          <TextField
            label="Optional link"
            value={badge.href || ""}
            onChange={(value) => updateBadge(index, { ...badge, href: value })}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={badge.visible !== false}
              onChange={(e) => updateBadge(index, { ...badge, visible: e.target.checked })}
            />
            Visible on homepage
          </label>

          <ImageUploadField
            label="Logo image"
            hint="Upload the association or certification logo."
            name={`affiliation_image_file_${memberFieldKey(badge.id)}`}
            removeName={`remove_affiliation_image_${memberFieldKey(badge.id)}`}
            previewUrl={badge.image}
            allowRemove
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...badges, createEmptyAffiliationBadge()])}
        className="text-sm font-semibold text-primary"
      >
        + Add affiliation badge
      </button>
    </div>
  );
}

function createEmptyLegalDocument(): LegalDocument {
  return {
    id: `legal-${Date.now()}`,
    title: "New Legal Document",
    visible: true,
  };
}

function LegalDocumentsEditor({
  documents,
  sectionId,
  onChange,
}: {
  documents: LegalDocument[];
  sectionId: string;
  onChange: (documents: LegalDocument[]) => void;
}) {
  const sectionKey = sectionFieldKey(sectionId);

  function updateDocument(index: number, next: LegalDocument) {
    const items = [...documents];
    items[index] = next;
    onChange(items);
  }

  return (
    <div className="space-y-4 rounded-lg border border-dashed border-border p-4">
      <div>
        <h4 className="font-semibold">Legal documents</h4>
        <p className="text-xs text-muted">
          Upload certificate or license scans. Each card shows a green title above a white document preview.
        </p>
      </div>

      {documents.map((document, documentIndex) => (
        <div key={document.id} className="space-y-3 rounded-lg border border-border bg-surface-muted/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h5 className="font-medium">{document.title || "Legal document"}</h5>
            <button
              type="button"
              onClick={() => onChange(documents.filter((_, i) => i !== documentIndex))}
              className="text-sm text-red-600"
            >
              Remove document
            </button>
          </div>

          <TextField
            label="Document title"
            value={document.title}
            onChange={(value) => updateDocument(documentIndex, { ...document, title: value })}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={document.visible !== false}
              onChange={(e) => updateDocument(documentIndex, { ...document, visible: e.target.checked })}
            />
            Visible on page
          </label>

          <ImageUploadField
            label="Document image"
            hint="Upload a scan or photo of the certificate, license, or registration document."
            name={`legal_doc_file_${sectionKey}_${memberFieldKey(document.id)}`}
            removeName={`remove_legal_doc_${sectionKey}_${memberFieldKey(document.id)}`}
            previewUrl={document.image}
            allowRemove
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...documents, createEmptyLegalDocument()])}
        className="text-sm font-semibold text-primary"
      >
        + Add legal document
      </button>
    </div>
  );
}

function PageSectionsEditor({
  sections,
  onChange,
  menuItems = [],
  addLabel = "+ Add page section",
  companyPages = false,
}: {
  sections: PageSection[];
  onChange: (sections: PageSection[]) => void;
  menuItems?: NavLink[];
  addLabel?: string;
  companyPages?: boolean;
}) {
  function updateSection(index: number, next: PageSection) {
    const items = [...sections];
    items[index] = next;
    onChange(items);
  }

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div key={section.id} className="rounded-xl border border-border p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">{section.nav_label || "Untitled page"}</h3>
              <p className="text-xs text-muted">Public URL: {sectionPublicPath(section, menuItems)}</p>
            </div>
            <button
              type="button"
              onClick={() => onChange(sections.filter((_, i) => i !== index))}
              className="text-sm text-red-600"
            >
              Delete page
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField
              label="Navigation label"
              value={section.nav_label}
              onChange={(value) => updateSection(index, { ...section, nav_label: value })}
            />
            <TextField
              label="URL slug"
              value={section.slug}
              onChange={(value) =>
                updateSection(index, {
                  ...section,
                  slug: slugifyPageSection(value),
                  id: section.id || slugifyPageSection(value),
                })
              }
            />
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={section.visible !== false}
                onChange={(e) => updateSection(index, { ...section, visible: e.target.checked })}
              />
              Published
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(section.show_in_header)}
                onChange={(e) => updateSection(index, { ...section, show_in_header: e.target.checked })}
              />
              Show in header
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(section.show_in_footer)}
                onChange={(e) => updateSection(index, { ...section, show_in_footer: e.target.checked })}
              />
              Show in footer
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(section.show_in_company_menu)}
                onChange={(e) => updateSection(index, { ...section, show_in_company_menu: e.target.checked })}
              />
              Show in company menu
            </label>
          </div>

          <TextField label="Meta title" value={section.meta_title} onChange={(value) => updateSection(index, { ...section, meta_title: value })} />
          <TextField label="Meta description" value={section.meta_description} onChange={(value) => updateSection(index, { ...section, meta_description: value })} rows={2} />
          <ImageUploadField
            label="Main Image"
            hint="Upload the primary image from your computer (PNG, JPG, WEBP, or GIF)."
            name={`main_image_file_${sectionFieldKey(section.id)}`}
            removeName={`remove_main_image_${sectionFieldKey(section.id)}`}
            previewUrl={section.main_image}
            allowRemove
          />
          <GalleryUploadField
            fieldKey={sectionFieldKey(section.id)}
            images={section.gallery_images}
          />
          <TextField label="Hero title" value={section.hero_title} onChange={(value) => updateSection(index, { ...section, hero_title: value })} />
          <TextField label="Hero subtitle" value={section.hero_subtitle} onChange={(value) => updateSection(index, { ...section, hero_subtitle: value })} rows={2} />
          <div>
            <label className="mb-1 block text-sm font-medium">Page layout</label>
            <select
              value={section.layout || "content"}
              onChange={(e) =>
                updateSection(index, {
                  ...section,
                  layout: e.target.value as PageSection["layout"],
                })
              }
              className="panel-input max-w-xs"
            >
              <option value="content">Content (heading, paragraphs, list)</option>
              <option value="about">About page (professional)</option>
              <option value="vision">Vision page (professional)</option>
              <option value="mission">Mission page (professional)</option>
              <option value="features">Feature cards</option>
              <option value="team">Team member cards</option>
              <option value="legal">Legal documents grid</option>
            </select>
          </div>
          {(section.layout || "content") === "team" ? (
            <>
              <TextField label="Intro heading" value={section.heading || ""} onChange={(value) => updateSection(index, { ...section, heading: value })} />
              <TextField
                label="Intro paragraphs (one per line)"
                value={(section.paragraphs || []).join("\n")}
                onChange={(value) => updateSection(index, { ...section, paragraphs: value.split("\n").filter(Boolean) })}
                rows={3}
              />
              <TeamMembersEditor
                members={section.team_members || []}
                sectionId={section.id}
                sectionSlug={section.slug}
                onChange={(team_members) => updateSection(index, { ...section, team_members })}
              />
            </>
          ) : (section.layout || "content") === "legal" ? (
            <>
              <TextField label="Intro heading" value={section.heading || ""} onChange={(value) => updateSection(index, { ...section, heading: value })} />
              <TextField
                label="Intro paragraphs (one per line)"
                value={(section.paragraphs || []).join("\n")}
                onChange={(value) => updateSection(index, { ...section, paragraphs: value.split("\n").filter(Boolean) })}
                rows={3}
              />
              <LegalDocumentsEditor
                documents={section.legal_documents || []}
                sectionId={section.id}
                onChange={(legal_documents) => updateSection(index, { ...section, legal_documents })}
              />
            </>
          ) : (section.layout || "content") === "about" ||
            section.layout === "vision" ||
            section.layout === "mission" ? (
            <>
              <TextField label="Story heading" value={section.heading || ""} onChange={(value) => updateSection(index, { ...section, heading: value })} />
              <TextField
                label="Story paragraphs (one per line)"
                value={(section.paragraphs || []).join("\n")}
                onChange={(value) => updateSection(index, { ...section, paragraphs: value.split("\n").filter(Boolean) })}
                rows={5}
              />
              <TextField
                label="Value cards (title|description per line)"
                value={(section.features || []).map((feature) => `${feature.title}|${feature.description}`).join("\n")}
                onChange={(value) =>
                  updateSection(index, {
                    ...section,
                    features: value
                      .split("\n")
                      .filter(Boolean)
                      .map((line) => {
                        const [title, ...rest] = line.split("|");
                        return { title: title.trim(), description: rest.join("|").trim() };
                      }),
                  })
                }
                rows={6}
              />
              <TextField label="Why choose us title" value={section.list_title || ""} onChange={(value) => updateSection(index, { ...section, list_title: value })} />
              <TextField
                label="Why choose us points (one per line)"
                value={(section.list_items || []).join("\n")}
                onChange={(value) => updateSection(index, { ...section, list_items: value.split("\n").filter(Boolean) })}
                rows={5}
              />
            </>
          ) : (section.layout || "content") === "content" ? (
            <>
              <TextField label="Body heading" value={section.heading || ""} onChange={(value) => updateSection(index, { ...section, heading: value })} />
              <TextField
                label="Paragraphs (one per line)"
                value={(section.paragraphs || []).join("\n")}
                onChange={(value) => updateSection(index, { ...section, paragraphs: value.split("\n").filter(Boolean) })}
                rows={4}
              />
              <TextField label="List title" value={section.list_title || ""} onChange={(value) => updateSection(index, { ...section, list_title: value })} />
              <TextField
                label="List items (one per line)"
                value={(section.list_items || []).join("\n")}
                onChange={(value) => updateSection(index, { ...section, list_items: value.split("\n").filter(Boolean) })}
                rows={4}
              />
            </>
          ) : (
            <TextField
              label="Features (title|description per line)"
              value={(section.features || []).map((feature) => `${feature.title}|${feature.description}`).join("\n")}
              onChange={(value) =>
                updateSection(index, {
                  ...section,
                  features: value
                    .split("\n")
                    .filter(Boolean)
                    .map((line) => {
                      const [title, ...rest] = line.split("|");
                      return { title: title.trim(), description: rest.join("|").trim() };
                    }),
                })
              }
              rows={8}
            />
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...sections, createEmptyPageSection(companyPages)])}
        className="text-sm font-semibold text-primary"
      >
        {addLabel}
      </button>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  rows = 1,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {rows > 1 ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="panel-input" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="panel-input" />
      )}
    </div>
  );
}

export default function AdminContentPage() {
  const [editLocale, setEditLocale] = useState<LocaleCode>("en");
  const [tab, setTab] = useState<Tab>("header");
  const [content, setContent] = useState<SiteContentMap | null>(null);
  const [pageKey, setPageKey] = useState<keyof SiteContentMap["pages"]>("contact");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminSiteContent(editLocale)
      .then((data) =>
        setContent({
          ...data.content,
          page_sections: data.content.page_sections || { items: [] },
        })
      )
      .catch(() => {});
  }, [editLocale]);

  async function savePageSections(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("locale", editLocale);
      formData.set("content", JSON.stringify({ items: content.page_sections.items }));
      const result = await updateAdminPageSectionsForm(formData);
      setContent({
        ...result.content,
        page_sections: result.content.page_sections || { items: [] },
      });
      setMessage("Page sections content saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save page sections.");
    } finally {
      setSaving(false);
    }
  }

  async function saveSection(section: SaveableSection) {
    if (!content) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await updateAdminSiteContent({ [section]: content[section] }, editLocale);
      setContent(result.content);
      setMessage(`${section.charAt(0).toUpperCase()}${section.slice(1)} content saved.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save content.");
    } finally {
      setSaving(false);
    }
  }

  async function saveFooter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("locale", editLocale);
      formData.set("content", JSON.stringify(content.footer));
      const result = await updateAdminFooterForm(formData);
      setContent(result.content);
      setMessage("Footer content saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save footer content.");
    } finally {
      setSaving(false);
    }
  }

  if (!content) return <p className="text-muted">Loading site content...</p>;

  const page = content.pages[pageKey];

  function updatePage(next: SitePageContent) {
    setContent({
      ...content!,
      pages: {
        ...content!.pages,
        [pageKey]: next,
      },
    });
  }

  async function saveCompanyInfo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content) return;
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const headerResult = await updateAdminSiteContent({ header: content.header }, editLocale);
      const form = e.currentTarget;
      const formData = new FormData(form);
      formData.set("locale", editLocale);
      formData.set("content", JSON.stringify({ items: content.page_sections.items }));
      const sectionsResult = await updateAdminPageSectionsForm(formData);
      setContent({
        ...headerResult.content,
        page_sections: sectionsResult.content.page_sections || { items: [] },
      });
      setMessage("Company info content saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save company info content.");
    } finally {
      setSaving(false);
    }
  }

  const companyMenuItems = content.header.company_menu?.items || [];
  const companySections = getCompanyInfoSections(content);
  const companySlugs = companyInfoPageSlugs(content);
  const generalPageSections = content.page_sections.items.filter(
    (section) => !companySlugs.has(section.slug) && !section.show_in_company_menu
  );

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "header", label: "Header" },
    { id: "company_info", label: "Company Info" },
    { id: "footer", label: "Footer" },
    { id: "page_sections", label: "Page Sections" },
    { id: "home", label: "Homepage" },
    { id: "pages", label: "Pages" },
    { id: "seo", label: "SEO" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Site Content</h1>
      <p className="text-muted mb-6">
        Edit header, company info, footer, custom page sections, homepage sections, page copy, and SEO text.
      </p>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium">Editing language</label>
        <select
          value={editLocale}
          onChange={(e) => setEditLocale(e.target.value as LocaleCode)}
          className="panel-input max-w-xs"
        >
          {Object.entries(LOCALES).map(([code, label]) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
        {editLocale !== "en" ? (
          <span className="text-xs text-muted">Empty fields fall back to English on the website.</span>
        ) : null}
      </div>

      {message ? <p className="text-green-600 mb-4">{message}</p> : null}
      {error ? <p className="text-red-600 mb-4">{error}</p> : null}

      <div className="flex flex-wrap gap-2 mb-6">
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

      <div className="panel-card max-w-5xl space-y-4">
        {tab === "header" ? (
          <>
            <TextField
              label="Login button label"
              value={content.header.login_label}
              onChange={(value) => setContent({ ...content, header: { ...content.header, login_label: value } })}
            />
            <TextField
              label="Account button label"
              value={content.header.account_label}
              onChange={(value) => setContent({ ...content, header: { ...content.header, account_label: value } })}
            />
            <div>
              <label className="mb-2 block text-sm font-medium">Navigation links</label>
              <p className="mb-2 text-xs text-muted">Page sections with &quot;Show in header&quot; are added automatically.</p>
              <NavLinksEditor
                links={content.header.nav}
                onChange={(nav) => setContent({ ...content, header: { ...content.header, nav } })}
              />
            </div>
            <button type="button" disabled={saving} onClick={() => saveSection("header")} className="btn-primary disabled:opacity-50">
              Save Header
            </button>
          </>
        ) : null}

        {tab === "company_info" ? (
          <form onSubmit={saveCompanyInfo} encType="multipart/form-data" className="space-y-6">
            <p className="text-sm text-muted">
              Manage the Company Info dropdown and every company page shown inside it. Use legal documents for certificates, feature cards for Why Us, or content layout for Vision and Mission.
            </p>

            <div className="rounded-lg border border-border p-4 space-y-3">
              <h3 className="font-semibold">Company Info dropdown</h3>
              <TextField
                label="Dropdown label"
                value={content.header.company_menu?.label || "Company Info"}
                onChange={(value) =>
                  setContent({
                    ...content,
                    header: {
                      ...content.header,
                      company_menu: {
                        label: value,
                        visible: content.header.company_menu?.visible !== false,
                        items: content.header.company_menu?.items || [],
                      },
                    },
                  })
                }
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={content.header.company_menu?.visible !== false}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      header: {
                        ...content.header,
                        company_menu: {
                          label: content.header.company_menu?.label || "Company Info",
                          visible: e.target.checked,
                          items: content.header.company_menu?.items || [],
                        },
                      },
                    })
                  }
                />
                Show company dropdown in header
              </label>
              <NavLinksEditor
                links={content.header.company_menu?.items || []}
                onChange={(items) =>
                  setContent({
                    ...content,
                    header: {
                      ...content.header,
                      company_menu: {
                        label: content.header.company_menu?.label || "Company Info",
                        visible: content.header.company_menu?.visible !== false,
                        items,
                      },
                    },
                  })
                }
              />
              <p className="text-xs text-muted">
                Link examples: `/about`, `/why-us`, `/pages/our-team`. Placeholders like {"{reviews_count}"} work in page text.
              </p>
            </div>

            <PageSectionsEditor
              sections={companySections}
              menuItems={companyMenuItems}
              companyPages
              addLabel="+ Add company page"
              onChange={(updatedCompanySections) =>
                setContent({
                  ...content,
                  page_sections: {
                    items: mergeCompanyInfoSections(content.page_sections.items, updatedCompanySections),
                  },
                })
              }
            />

            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              Save Company Info
            </button>
          </form>
        ) : null}

        {tab === "footer" ? (
          <form onSubmit={saveFooter} encType="multipart/form-data" className="space-y-4">
            <TextField label="Quick links title" value={content.footer.quick_links_title} onChange={(value) => setContent({ ...content, footer: { ...content.footer, quick_links_title: value } })} />
            <TextField label="Activity title" value={content.footer.activity_title} onChange={(value) => setContent({ ...content, footer: { ...content.footer, activity_title: value } })} />
            <TextField label="Company about text" value={content.footer.about_text || ""} onChange={(value) => setContent({ ...content, footer: { ...content.footer, about_text: value } })} rows={3} />
            <TextField label="Booking platforms title" value={content.footer.partner_title || ""} onChange={(value) => setContent({ ...content, footer: { ...content.footer, partner_title: value } })} />
            <TextField label="Social media title" value={content.footer.social_title || ""} onChange={(value) => setContent({ ...content, footer: { ...content.footer, social_title: value } })} />
            <TextField label="Payment method title" value={content.footer.payment_title || ""} onChange={(value) => setContent({ ...content, footer: { ...content.footer, payment_title: value } })} />
            <TextField label="Newsletter placeholder" value={content.footer.newsletter_placeholder || ""} onChange={(value) => setContent({ ...content, footer: { ...content.footer, newsletter_placeholder: value } })} />
            <TextField label="Subscribe button label" value={content.footer.subscribe_label || ""} onChange={(value) => setContent({ ...content, footer: { ...content.footer, subscribe_label: value } })} />
            <TextField label="Designed by text" value={content.footer.designed_by || ""} onChange={(value) => setContent({ ...content, footer: { ...content.footer, designed_by: value } })} />
            <TextField label="Designed by link" value={content.footer.designed_by_link || ""} onChange={(value) => setContent({ ...content, footer: { ...content.footer, designed_by_link: value } })} />
            <TextField label="Copyright template" value={content.footer.copyright} onChange={(value) => setContent({ ...content, footer: { ...content.footer, copyright: value } })} rows={2} />
            <div>
              <label className="mb-2 block text-sm font-medium">Quick links</label>
              <p className="mb-2 text-xs text-muted">Page sections with &quot;Show in footer&quot; are added automatically.</p>
              <NavLinksEditor links={content.footer.quick_links} onChange={(quick_links) => setContent({ ...content, footer: { ...content.footer, quick_links } })} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Activity links</label>
              <NavLinksEditor links={content.footer.activity_links} onChange={(activity_links) => setContent({ ...content, footer: { ...content.footer, activity_links } })} />
            </div>
            <AffiliationBadgesEditor
              badges={(content.footer.affiliation_badges || []).map((badge, index) => ({
                id: badge.id || `affiliation-${index}`,
                label: badge.label,
                description: badge.description || "",
                image: badge.image,
                href: badge.href,
                visible: badge.visible,
              }))}
              onChange={(affiliation_badges) => setContent({ ...content, footer: { ...content.footer, affiliation_badges } })}
            />
            <PartnerBadgesEditor
              badges={(content.footer.partner_badges || []).map((badge, index) => ({
                id: badge.id || `partner-${index}`,
                label: badge.label,
                href: badge.href,
                image: badge.image,
                visible: badge.visible,
              }))}
              onChange={(partner_badges) => setContent({ ...content, footer: { ...content.footer, partner_badges } })}
            />
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              Save Footer
            </button>
          </form>
        ) : null}

        {tab === "page_sections" ? (
          <form onSubmit={savePageSections} encType="multipart/form-data" className="space-y-4">
            <p className="text-sm text-muted">
              Create custom pages such as Privacy Policy or Terms. Company Info pages are managed in the Company Info tab.
            </p>
            <PageSectionsEditor
              sections={generalPageSections}
              onChange={(updatedGeneral) => {
                const companyOnly = content.page_sections.items.filter(
                  (section) => companySlugs.has(section.slug) || section.show_in_company_menu
                );
                setContent({
                  ...content,
                  page_sections: { items: [...companyOnly, ...updatedGeneral] },
                });
              }}
            />
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              Save Page Sections
            </button>
          </form>
        ) : null}

        {tab === "home" ? (
          <>
            {(["featured", "destinations", "best_selling", "season", "blog"] as const).map((sectionKey) => (
              <div key={sectionKey} className="rounded-lg border border-border p-4 space-y-3">
                <h3 className="font-semibold capitalize">{sectionKey.replace("_", " ")}</h3>
                <TextField label="Title" value={content.home[sectionKey].title} onChange={(value) => setContent({ ...content, home: { ...content.home, [sectionKey]: { ...content.home[sectionKey], title: value } } })} />
                <TextField label="Subtitle" value={content.home[sectionKey].subtitle || ""} onChange={(value) => setContent({ ...content, home: { ...content.home, [sectionKey]: { ...content.home[sectionKey], subtitle: value } } })} />
                {"cta_text" in content.home[sectionKey] ? (
                  <>
                    <TextField label="CTA text" value={content.home[sectionKey].cta_text || ""} onChange={(value) => setContent({ ...content, home: { ...content.home, [sectionKey]: { ...content.home[sectionKey], cta_text: value } } })} />
                    <TextField label="CTA link" value={content.home[sectionKey].cta_link || ""} onChange={(value) => setContent({ ...content, home: { ...content.home, [sectionKey]: { ...content.home[sectionKey], cta_link: value } } })} />
                  </>
                ) : null}
              </div>
            ))}

            <div className="rounded-lg border border-border p-4 space-y-3">
              <h3 className="font-semibold">About section</h3>
              <TextField label="Title" value={content.home.about.title} onChange={(value) => setContent({ ...content, home: { ...content.home, about: { ...content.home.about, title: value } } })} />
              <TextField label="Paragraphs (one per line)" value={content.home.about.paragraphs.join("\n")} onChange={(value) => setContent({ ...content, home: { ...content.home, about: { ...content.home.about, paragraphs: value.split("\n").filter(Boolean) } } })} rows={4} />
              <TextField label="Bullets (one per line)" value={content.home.about.bullets.join("\n")} onChange={(value) => setContent({ ...content, home: { ...content.home, about: { ...content.home.about, bullets: value.split("\n").filter(Boolean) } } })} rows={4} />
              <TextField label="Stat label" value={content.home.about.stat_label} onChange={(value) => setContent({ ...content, home: { ...content.home, about: { ...content.home.about, stat_label: value } } })} />
              <p className="text-xs text-muted">
                Review count, happy travellers, packages, destinations, and years of experience are calculated automatically from live data.
              </p>
            </div>

            <div className="rounded-lg border border-border p-4 space-y-3">
              <h3 className="font-semibold">Reviews section</h3>
              <TextField label="Title" value={content.home.reviews.title} onChange={(value) => setContent({ ...content, home: { ...content.home, reviews: { ...content.home.reviews, title: value } } })} />
              <TextField label="Reviews label" value={content.home.reviews.reviews_label} onChange={(value) => setContent({ ...content, home: { ...content.home, reviews: { ...content.home.reviews, reviews_label: value } } })} />
              <TextField label="Travellers label" value={content.home.reviews.travellers_label} onChange={(value) => setContent({ ...content, home: { ...content.home, reviews: { ...content.home.reviews, travellers_label: value } } })} />
              <p className="text-xs text-muted">Counts update automatically when reviews are approved and bookings are confirmed.</p>
            </div>

            <button type="button" disabled={saving} onClick={() => saveSection("home")} className="btn-primary disabled:opacity-50">
              Save Homepage
            </button>
          </>
        ) : null}

        {tab === "pages" ? (
          <>
            <p className="text-sm text-muted">
              Edit listing and utility page copy here. Company Info pages such as About Us and Why Us are managed in the Company Info tab.
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium">Page</label>
              <select value={pageKey} onChange={(e) => setPageKey(e.target.value as keyof SiteContentMap["pages"])} className="panel-input max-w-xs">
                {pageKeys.map((key) => (
                  <option key={key} value={key}>{key.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <TextField label="Meta title" value={page.meta_title} onChange={(value) => updatePage({ ...page, meta_title: value })} />
            <TextField label="Meta description" value={page.meta_description} onChange={(value) => updatePage({ ...page, meta_description: value })} rows={2} />
            <TextField label="Hero title" value={page.hero_title} onChange={(value) => updatePage({ ...page, hero_title: value })} />
            <TextField label="Hero subtitle" value={page.hero_subtitle} onChange={(value) => updatePage({ ...page, hero_subtitle: value })} rows={2} />
            {page.heading !== undefined ? <TextField label="Body heading" value={page.heading || ""} onChange={(value) => updatePage({ ...page, heading: value })} /> : null}
            {page.paragraphs ? <TextField label="Paragraphs (one per line)" value={page.paragraphs.join("\n")} onChange={(value) => updatePage({ ...page, paragraphs: value.split("\n").filter(Boolean) })} rows={5} /> : null}
            {page.list_items ? <TextField label="List items (one per line)" value={page.list_items.join("\n")} onChange={(value) => updatePage({ ...page, list_items: value.split("\n").filter(Boolean) })} rows={5} /> : null}
            {page.features ? (
              <>
                <TextField
                  label="Features (title|description per line)"
                  value={page.features.map((f) => `${f.title}|${f.description}`).join("\n")}
                  onChange={(value) =>
                    updatePage({
                      ...page,
                      features: value
                        .split("\n")
                        .filter(Boolean)
                        .map((line) => {
                          const [title, ...rest] = line.split("|");
                          return { title: title.trim(), description: rest.join("|").trim() };
                        }),
                    })
                  }
                  rows={8}
                />
                <p className="text-xs text-muted">
                  Use placeholders like {"{reviews_count}"}, {"{happy_travellers}"}, {"{packages_count}"}, or {"{years_experience}"} for live counts.
                </p>
              </>
            ) : null}
            {page.sidebar_title !== undefined ? <TextField label="Sidebar title" value={page.sidebar_title || ""} onChange={(value) => updatePage({ ...page, sidebar_title: value })} /> : null}
            {page.form_title !== undefined ? <TextField label="Form title" value={page.form_title || ""} onChange={(value) => updatePage({ ...page, form_title: value })} /> : null}
            {page.hours_text !== undefined ? <TextField label="Office hours text" value={page.hours_text || ""} onChange={(value) => updatePage({ ...page, hours_text: value })} /> : null}
            <button type="button" disabled={saving} onClick={() => saveSection("pages")} className="btn-primary disabled:opacity-50">
              Save Pages
            </button>
          </>
        ) : null}

        {tab === "seo" ? (
          <>
            <TextField label="Site name" value={content.seo.site_name} onChange={(value) => setContent({ ...content, seo: { ...content.seo, site_name: value } })} />
            <TextField label="Title template" value={content.seo.title_template} onChange={(value) => setContent({ ...content, seo: { ...content.seo, title_template: value } })} />
            <TextField label="Default description" value={content.seo.default_description} onChange={(value) => setContent({ ...content, seo: { ...content.seo, default_description: value } })} rows={3} />
            <TextField label="Site URL" value={content.seo.site_url || ""} onChange={(value) => setContent({ ...content, seo: { ...content.seo, site_url: value } })} />
            <TextField label="Default social image URL" value={content.seo.default_og_image || ""} onChange={(value) => setContent({ ...content, seo: { ...content.seo, default_og_image: value } })} />
            <TextField label="Keywords (comma separated)" value={content.seo.keywords || ""} onChange={(value) => setContent({ ...content, seo: { ...content.seo, keywords: value } })} rows={2} />
            <button type="button" disabled={saving} onClick={() => saveSection("seo")} className="btn-primary disabled:opacity-50">
              Save SEO
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
