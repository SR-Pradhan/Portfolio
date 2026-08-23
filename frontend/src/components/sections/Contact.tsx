"use client";

import { Mail, MapPin, Phone, Send } from "lucide-react";
import { type FormEvent, useState } from "react";
import { contact, site } from "@/data/site";
import { opensInNewTab, socialLinks } from "@/lib/socials";
import Reveal from "../Reveal";
import Section from "../Section";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Something went wrong.");
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted focus:border-accent";

  return (
    <Section id="contact" title={contact.heading}>
      <div className="grid gap-14 md:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <p className="text-lg leading-relaxed text-muted">{contact.sub}</p>

          <ul className="mt-10 space-y-5 text-sm">
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-accent" />
              {/* strip spaces: a tel: href with them is invalid and some
                  dialers drop the call */}
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="transition-colors hover:text-accent"
              >
                {site.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-accent" />
              <a
                href={`mailto:${site.email}`}
                className="transition-colors hover:text-accent"
              >
                {site.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin size={18} className="text-accent" />
              {/*
                Google Maps directions with a destination but no origin: Maps
                fills the origin with the visitor's own location and shows the
                route and distance. Doing it this way means the site never asks
                for a geolocation permission itself, which is a prompt nobody
                expects from a portfolio.

                The destination stays the city, not a street address. It answers
                "where is he, and how far is that from me" without publishing
                where he actually lives.
              */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.location)}`}
                target="_blank"
                rel="noreferrer"
                title={`Directions to ${site.location}`}
                className="transition-colors hover:text-accent"
              >
                {site.location}
              </a>
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                {...(opensInNewTab(href)
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                aria-label={label}
                title={label}
                className="group grid size-10 place-items-center rounded-full border border-border text-muted transition hover:border-accent hover:text-accent"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <form
            onSubmit={handleSubmit}
            className="relative rounded-2xl border border-border bg-surface p-7"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <input required name="name" placeholder="Name" className={inputClass} />
              <input
                required
                type="email"
                name="email"
                placeholder="Email"
                className={inputClass}
              />
            </div>
            <input
              required
              name="subject"
              placeholder="Subject"
              className={`${inputClass} mt-4`}
            />
            <textarea
              required
              name="message"
              rows={5}
              placeholder="Your message"
              className={`${inputClass} mt-4 resize-none`}
            />

            {/* Honeypot — hidden from people, catnip for bots. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="absolute left-[-9999px]"
            />

            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              <Send size={16} />
              {status === "sending" ? "Sending…" : "Send message"}
            </button>

            {status === "sent" && (
              <p className="mt-4 text-center text-sm text-accent">
                Message sent. I&apos;ll get back to you soon.
              </p>
            )}
            {status === "error" && (
              <p className="mt-4 text-center text-sm text-red-500">
                {error} You can also email me directly at {site.email}.
              </p>
            )}
          </form>
        </Reveal>
      </div>
    </Section>
  );
}
