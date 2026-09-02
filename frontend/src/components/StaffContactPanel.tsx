import type { ReactNode } from "react";
import SocialMediaLinks from "@/components/SocialMediaLinks";
import type { CompanyContactChannels } from "@/lib/company-contact";
import { mailtoUrl, telUrl, viberUrl, whatsappUrl } from "@/lib/company-contact";

function ContactAction({
  href,
  label,
  tone = "default",
}: {
  href: string | null;
  label: string;
  tone?: "default" | "whatsapp" | "viber";
}) {
  if (!href) return null;

  const classes =
    tone === "whatsapp"
      ? "border-green-200 bg-green-50 text-green-800 hover:bg-green-100"
      : tone === "viber"
        ? "border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100"
        : "border-border bg-surface-muted hover:bg-surface";

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={`inline-flex rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${classes}`}
    >
      {label}
    </a>
  );
}

function ChannelCard({
  title,
  value,
  actions,
}: {
  title: string;
  value: string;
  actions: ReactNode;
}) {
  if (!value) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
      <p className="mt-2 font-medium text-foreground">{value}</p>
      <div className="mt-3 flex flex-wrap gap-2">{actions}</div>
    </div>
  );
}

export default function StaffContactPanel({ contact }: { contact: CompanyContactChannels }) {
  const whatsappMessage = `Hello ${contact.companyName}, I need help with my booking.`;

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold mb-1">Company Contact</h3>
        <p className="text-sm text-muted mb-4">{contact.supportHours}</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ChannelCard
            title="Phone"
            value={contact.phone}
            actions={<ContactAction href={telUrl(contact.phone)} label="Call" />}
          />
          <ChannelCard
            title="Email"
            value={contact.email}
            actions={<ContactAction href={mailtoUrl(contact.email, "Support request")} label="Email" />}
          />
          <ChannelCard
            title="WhatsApp"
            value={contact.whatsapp}
            actions={
              <ContactAction
                href={whatsappUrl(contact.whatsapp, whatsappMessage)}
                label="Chat on WhatsApp"
                tone="whatsapp"
              />
            }
          />
          <ChannelCard
            title="Viber"
            value={contact.viber}
            actions={<ContactAction href={viberUrl(contact.viber)} label="Chat on Viber" tone="viber" />}
          />
          <ChannelCard title="Office Address" value={contact.address} actions={null} />
          {contact.website ? (
            <ChannelCard
              title="Website"
              value={contact.website}
              actions={
                <ContactAction
                  href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`}
                  label="Visit Website"
                />
              }
            />
          ) : null}
        </div>
      </section>

      {contact.socialLinks.length > 0 ? (
        <section>
          <h3 className="text-lg font-semibold mb-4">Social Media</h3>
          <SocialMediaLinks links={contact.socialLinks} />
        </section>
      ) : null}

      <section>
        <h3 className="text-lg font-semibold mb-4">Staff Contacts</h3>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                <th className="p-3 text-left font-semibold">Name</th>
                <th className="p-3 text-left font-semibold">Role</th>
                <th className="p-3 text-left font-semibold">Phone</th>
                <th className="p-3 text-left font-semibold">Email</th>
                <th className="p-3 text-left font-semibold">WhatsApp</th>
                <th className="p-3 text-left font-semibold">Viber</th>
                <th className="p-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contact.staffContacts.map((staff) => (
                <tr key={`${staff.name}-${staff.role || "staff"}`} className="border-b border-border align-top last:border-0">
                  <td className="p-3 font-medium">{staff.name}</td>
                  <td className="p-3">{staff.role || "—"}</td>
                  <td className="p-3">{staff.phone || "—"}</td>
                  <td className="p-3">{staff.email || "—"}</td>
                  <td className="p-3">{staff.whatsapp || "—"}</td>
                  <td className="p-3">{staff.viber || "—"}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {staff.phone ? <ContactAction href={telUrl(staff.phone)} label="Call" /> : null}
                      {staff.email ? <ContactAction href={mailtoUrl(staff.email)} label="Email" /> : null}
                      {staff.whatsapp ? (
                        <ContactAction
                          href={whatsappUrl(staff.whatsapp, whatsappMessage)}
                          label="WhatsApp"
                          tone="whatsapp"
                        />
                      ) : null}
                      {staff.viber ? <ContactAction href={viberUrl(staff.viber)} label="Viber" tone="viber" /> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
