"use client";

import { Calendar, Image as ImageIcon, MapPin, Tag, Type } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EventFormPayload } from "@/lib/api";
import { FALLBACK_EVENT_IMAGE, isValidHttpUrl } from "@/lib/utils";
import { EVENT_CATEGORIES, EventCategory } from "@/types/event";

interface EventFormProps {
  initialValues?: {
    title: string;
    description: string;
    eventType: EventCategory;
    thumbnail: string;
    location: string;
    eventDate: Date | null;
  };
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (payload: EventFormPayload) => Promise<void>;
  onCancel?: () => void;
}

type FieldErrors = Partial<
  Record<
    "title" | "description" | "eventType" | "thumbnail" | "location" | "eventDate",
    string
  >
>;

export function EventForm({
  initialValues,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: EventFormProps) {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(
    initialValues?.description || ""
  );
  const [eventType, setEventType] = useState<EventCategory>(
    initialValues?.eventType || "Cleanup"
  );
  const [thumbnail, setThumbnail] = useState(initialValues?.thumbnail || "");
  const [location, setLocation] = useState(initialValues?.location || "");
  const [eventDate, setEventDate] = useState<Date | null>(
    initialValues?.eventDate || null
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 1. Intercept programmatic smooth scrollIntoView calls triggered by react-datepicker on time list items
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    HTMLElement.prototype.scrollIntoView = function (
      this: HTMLElement,
      arg?: boolean | ScrollIntoViewOptions
    ) {
      if (this.closest && this.closest(".react-datepicker__time-container")) {
        return;
      }
      return originalScrollIntoView.call(this, arg);
    };

    // 2. Intercept programmatic scrollTop assignments on the time list so time never auto-scrolls on mount or date click
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      Element.prototype,
      "scrollTop"
    );

    const preventTimeAutoScroll = () => {
      const lists = document.querySelectorAll<HTMLUListElement>(
        ".react-datepicker__time-list"
      );
      lists.forEach((list) => {
        const customList = list as HTMLUListElement & {
          __noAutoScrollAttached?: boolean;
        };
        if (customList.__noAutoScrollAttached) return;
        customList.__noAutoScrollAttached = true;

        const getter = originalDescriptor?.get;
        Object.defineProperty(list, "scrollTop", {
          get(this: HTMLUListElement) {
            return getter ? getter.call(this) : 0;
          },
          set() {
            // Intentionally block programmatic auto-scrolling
          },
          configurable: true,
        });
      });
    };

    preventTimeAutoScroll();
    const observer = new MutationObserver(preventTimeAutoScroll);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
      observer.disconnect();
    };
  }, []);

  const clearError = (field: keyof FieldErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const nextErrors: FieldErrors = {};

    if (!title.trim() || title.trim().length < 3) {
      nextErrors.title = "Event title must be at least 3 characters long.";
    } else if (title.trim().length > 120) {
      nextErrors.title = "Event title cannot exceed 120 characters.";
    }

    if (!description.trim() || description.trim().length < 15) {
      nextErrors.description =
        "Description must be at least 15 characters to explain the initiative clearly.";
    }

    if (!EVENT_CATEGORIES.includes(eventType)) {
      nextErrors.eventType = "Please select a valid event category.";
    }

    if (!thumbnail.trim()) {
      nextErrors.thumbnail = "Thumbnail image URL is required.";
    } else if (!isValidHttpUrl(thumbnail.trim())) {
      nextErrors.thumbnail =
        "Thumbnail URL must start with http:// or https://.";
    }

    if (!location.trim() || location.trim().length < 3) {
      nextErrors.location = "Event location must be at least 3 characters long.";
    }

    if (!eventDate || Number.isNaN(eventDate.getTime())) {
      nextErrors.eventDate = "Please pick an event date and time.";
    } else if (eventDate.getTime() <= Date.now()) {
      nextErrors.eventDate =
        "Past dates are not allowed. Event date must be in the future.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstError = Object.values(nextErrors)[0];
      if (firstError) toast.error(firstError);
      return false;
    }

    return true;
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || !eventDate) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        eventType,
        thumbnail: thumbnail.trim(),
        location: location.trim(),
        eventDate: eventDate.toISOString(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-5">
      <div className="space-y-1.5">
        <label
          htmlFor="event-title"
          className="block text-sm font-semibold text-foreground"
        >
          Event Title
        </label>
        <div className="relative">
          <Type className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            id="event-title"
            type="text"
            placeholder="e.g., Winter Clothes Distribution – Mirpur 10, Dhaka"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              clearError("title");
            }}
            hasError={Boolean(errors.title)}
            className="pl-10"
          />
        </div>
        {errors.title && (
          <p className="text-xs font-medium text-danger">{errors.title}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="event-type"
            className="block text-sm font-semibold text-foreground"
          >
            Event Type
          </label>
          <div className="relative">
            <Tag className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
            <select
              id="event-type"
              value={eventType}
              onChange={(e) => {
                setEventType(e.target.value as EventCategory);
                clearError("eventType");
              }}
              className="flex h-11 w-full max-h-[80vh] rounded-xl border border-border bg-surface pr-4 pl-10 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
            >
              {EVENT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          {errors.eventType && (
            <p className="text-xs font-medium text-danger">
              {errors.eventType}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="event-date"
            className="block text-sm font-semibold text-foreground"
          >
            Event Date &amp; Time (Future Only)
          </label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute top-1/2 left-3.5 z-10 h-4 w-4 -translate-y-1/2 text-muted" />
            <DatePicker
              id="event-date"
              selected={eventDate}
              onChange={(date: Date | null) => {
                setEventDate(date);
                clearError("eventDate");
              }}
              showTimeSelect
              timeIntervals={30}
              minDate={todayStart}
              openToDate={todayStart}
              filterTime={(time: Date) => {
                const candidate = new Date(eventDate || new Date());
                candidate.setHours(
                  time.getHours(),
                  time.getMinutes(),
                  0,
                  0
                );
                return candidate.getTime() > Date.now();
              }}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              portalId="datepicker-portal"
              popperPlacement="bottom-start"
              fixedHeight
              dateFormat="MMM d, yyyy h:mm aa"
              placeholderText="Select upcoming date & time"
              className={`flex h-11 w-full rounded-xl border bg-surface pr-4 pl-10 text-sm text-foreground placeholder:text-muted/70 transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                errors.eventDate
                  ? "border-danger focus-visible:ring-danger/40"
                  : "border-border focus-visible:ring-primary/40"
              }`}
            />
          </div>
          {errors.eventDate && (
            <p className="text-xs font-medium text-danger">
              {errors.eventDate}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="event-location"
          className="block text-sm font-semibold text-foreground"
        >
          Location
        </label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            id="event-location"
            type="text"
            placeholder="e.g., Mohammadpur Town Hall, Dhaka"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              clearError("location");
            }}
            hasError={Boolean(errors.location)}
            className="pl-10"
          />
        </div>
        {errors.location && (
          <p className="text-xs font-medium text-danger">{errors.location}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="event-thumbnail"
          className="block text-sm font-semibold text-foreground"
        >
          Thumbnail Image URL
        </label>
        <div className="relative">
          <ImageIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            id="event-thumbnail"
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={thumbnail}
            onChange={(e) => {
              setThumbnail(e.target.value);
              clearError("thumbnail");
            }}
            hasError={Boolean(errors.thumbnail)}
            className="pl-10"
          />
        </div>
        {errors.thumbnail && (
          <p className="text-xs font-medium text-danger">{errors.thumbnail}</p>
        )}

        {isValidHttpUrl(thumbnail) && (
          <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-surface-muted/40">
            <img
              src={thumbnail.trim()}
              alt="Event thumbnail preview"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_EVENT_IMAGE;
              }}
              className="aspect-[16/7] w-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="event-description"
          className="block text-sm font-semibold text-foreground"
        >
          Description
        </label>
        <Textarea
          id="event-description"
          placeholder="Describe the purpose, meeting point, items needed, and how volunteers can contribute..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            clearError("description");
          }}
          hasError={Boolean(errors.description)}
          rows={5}
        />
        {errors.description && (
          <p className="text-xs font-medium text-danger">
            {errors.description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
