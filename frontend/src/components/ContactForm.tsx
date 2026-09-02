"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/context";
import { submitContact } from "@/lib/api";

export default function ContactForm({
  defaultSubject = "",
  defaultMessage = "",
}: {
  defaultSubject?: string;
  defaultMessage?: string;
}) {
  const { t } = useLocale();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const result = await submitContact({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: (formData.get("phone") as string) || undefined,
        subject: (formData.get("subject") as string) || undefined,
        message: formData.get("message") as string,
      });
      setStatus("success");
      setMessage(result.message);
      form.reset();
    } catch {
      setStatus("error");
      setMessage(t("contact.error"));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            {t("contact.fullName")}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            {t("contact.email")}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            {t("contact.phone")}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            {t("contact.subject")}
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            defaultValue={defaultSubject}
            className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          {t("contact.message")}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          defaultValue={defaultMessage}
          className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {status === "success" ? <p className="text-green-600 font-medium">{message}</p> : null}
      {status === "error" ? <p className="text-red-600 font-medium">{message}</p> : null}

      <button type="submit" disabled={status === "loading"} className="btn-primary disabled:opacity-50">
        {status === "loading" ? t("contact.sending") : t("contact.send")}
      </button>
    </form>
  );
}
