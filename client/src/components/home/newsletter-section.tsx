"use client";

import { MailCheck, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address to subscribe.");
      return;
    }

    setSubscribed(true);
    setEmail("");
    toast.success("Subscribed to the CivicRoots weekly volunteer digest!");
  };

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-primary px-6 py-12 text-primary-foreground shadow-xl sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-2xl"
          />
          <div className="relative mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold tracking-wide uppercase">
                <MailCheck className="h-3.5 w-3.5" />
                <span>Weekly Dispatch</span>
              </span>
              <h2 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                Never Miss a Local Volunteer Drive
              </h2>
              <p className="max-w-xl text-sm leading-relaxed opacity-90 sm:text-base">
                Get curated updates on upcoming winter relief distributions,
                tree plantation weekends, and community service highlights in
                your area.
              </p>
            </div>

            <div className="lg:col-span-5">
              <form
                onSubmit={handleSubscribe}
                noValidate
                className="flex flex-col gap-3 sm:flex-row"
              >
                <Input
                  type="email"
                  aria-label="Newsletter email address"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (subscribed) setSubscribed(false);
                  }}
                  className="h-12 border-white/25 bg-white text-slate-900 placeholder:text-slate-500"
                />
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="h-12 shrink-0 px-6 font-bold"
                >
                  <Send className="h-4 w-4" />
                  <span>{subscribed ? "Subscribed" : "Subscribe"}</span>
                </Button>
              </form>
              <p className="mt-2.5 text-xs opacity-80">
                Zero spam. Unsubscribe anytime with one click.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
