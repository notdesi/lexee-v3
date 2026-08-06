"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Briefcase,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  LayoutGrid,
  Lock,
  Printer,
  Search,
  Settings2,
  Users,
  X,
} from "lucide-react";
import type { ComponentType } from "react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { UI_EASE } from "@/lib/ui-motion";

type SettingsNavId =
  | "configuration"
  | "usage"
  | "billing"
  | "users"
  | "client-acquisition";
type SettingsSectionId = "research" | "quick-tasks";

type SettingsNavItem = {
  id: SettingsNavId;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  { id: "configuration", label: "Configuration", icon: Settings2 },
  { id: "usage", label: "Usage", icon: LayoutGrid },
  { id: "billing", label: "Billing and purchase history", icon: CreditCard },
  { id: "users", label: "Users", icon: Users },
  {
    id: "client-acquisition",
    label: "Client acquisition and services",
    icon: Briefcase,
  },
];

type SettingsSearchResult = {
  id: string;
  label: string;
  description: string;
  navId: SettingsNavId;
  sectionId?: SettingsSectionId;
  usagePage?: "overview" | "logs";
  billingPage?: "overview" | "monthly-bills" | "invoices";
  keywords: string[];
};

const SETTINGS_SEARCH_INDEX: SettingsSearchResult[] = [
  {
    id: "nav-configuration",
    label: "Configuration",
    description: "Workspace defaults and assistant behavior",
    navId: "configuration",
    keywords: ["configuration", "settings", "workspace", "assistant", "defaults"],
  },
  {
    id: "section-research",
    label: "Research & Analysis",
    description: "Heavy tier · Configuration",
    navId: "configuration",
    sectionId: "research",
    keywords: [
      "research",
      "analysis",
      "heavy",
      "tier",
      "case-law",
      "document",
      "discovery",
    ],
  },
  {
    id: "section-quick-tasks",
    label: "Quick Tasks",
    description: "Light tier · Configuration",
    navId: "configuration",
    sectionId: "quick-tasks",
    keywords: ["quick", "tasks", "light", "tier", "drafting", "email", "emails"],
  },
  {
    id: "nav-usage",
    label: "Usage",
    description: "Assistant activity for the current billing cycle",
    navId: "usage",
    keywords: ["usage", "limits", "quota", "credits", "billing cycle", "activity"],
  },
  {
    id: "section-system-usage",
    label: "System usage",
    description: "Storage and seats · Usage",
    navId: "usage",
    keywords: ["system", "storage", "seats", "consumption", "workspace"],
  },
  {
    id: "section-firm-usage",
    label: "Firm-wide Usage",
    description: "Credits · Usage",
    navId: "usage",
    keywords: ["firm", "wide", "credits", "usage"],
  },
  {
    id: "section-logs",
    label: "Logs",
    description: "Assistant activity log · Usage",
    navId: "usage",
    usagePage: "logs",
    keywords: ["logs", "activity", "tokens", "requests", "history"],
  },
  {
    id: "section-monthly-bill",
    label: "Total Monthly bill",
    description: "Monthly spend breakdown · Billing",
    navId: "billing",
    billingPage: "monthly-bills",
    keywords: ["monthly", "bill", "invoice", "spend", "august", "july", "june"],
  },
  {
    id: "section-invoices",
    label: "Invoices",
    description: "Invoice history · Billing",
    navId: "billing",
    billingPage: "invoices",
    keywords: ["invoices", "invoice", "paid", "receipt", "export", "print"],
  },
  {
    id: "nav-billing",
    label: "Billing and purchase history",
    description: "Plan, payment method, invoices and AI credit spend by model",
    navId: "billing",
    keywords: ["billing", "purchase", "history", "invoice", "plan", "payment", "card"],
  },
  {
    id: "nav-users",
    label: "Users",
    description: "Per-user spend and monthly limits for the firm",
    navId: "users",
    keywords: ["users", "limits", "spend", "seats", "team", "members"],
  },
  {
    id: "nav-client-acquisition",
    label: "Client acquisition and services",
    description: "Credits for client acquisition and related services",
    navId: "client-acquisition",
    keywords: [
      "client",
      "acquisition",
      "services",
      "credits",
      "assigned",
      "remaining",
    ],
  },
  {
    id: "section-client-credits",
    label: "Credits",
    description: "Assigned, used, and remaining · Client acquisition",
    navId: "client-acquisition",
    keywords: [
      "credits",
      "assigned",
      "used",
      "remaining",
      "add credits",
      "client",
    ],
  },
  {
    id: "section-client-logs",
    label: "Logs",
    description: "Token and cost activity · Client acquisition",
    navId: "client-acquisition",
    keywords: [
      "logs",
      "time",
      "input",
      "output",
      "token",
      "cost",
      "client",
    ],
  },
];

type ModelOption = {
  id: string;
  label: string;
  description: string;
};

const RESEARCH_MODELS: ModelOption[] = [
  {
    id: "claude-opus-4",
    label: "Claude Opus 4",
    description:
      "Anthropic's most capable model — strongest for nuanced legal reasoning and long-document review.",
  },
  {
    id: "claude-sonnet-4",
    label: "Claude Sonnet 4",
    description:
      "A balanced Anthropic model — nearly as capable as Opus at a lower cost and faster response time.",
  },
  {
    id: "gpt-4o",
    label: "GPT-4o",
    description:
      "OpenAI's flagship model — strong general reasoning, a good alternative when you want a second opinion.",
  },
];

const QUICK_MODELS: ModelOption[] = [
  {
    id: "gpt-4o-mini",
    label: "GPT-4o mini",
    description:
      "A compact, low-cost OpenAI model — fast responses for routine drafting and short answers.",
  },
  {
    id: "claude-haiku",
    label: "Claude Haiku",
    description:
      "Anthropic's fastest model — near-instant replies for simple, high-volume tasks.",
  },
];

type UsageTimeframeId = "billing-cycle" | "7d" | "30d" | "90d";

const USAGE_TIMEFRAMES: { id: UsageTimeframeId; label: string }[] = [
  { id: "billing-cycle", label: "This billing cycle" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
];

const USAGE_BY_TIMEFRAME: Record<
  UsageTimeframeId,
  { total: number; used: number }
> = {
  "billing-cycle": { total: 1000, used: 420 },
  "7d": { total: 1000, used: 96 },
  "30d": { total: 1000, used: 310 },
  "90d": { total: 1000, used: 745 },
};

const CLIENT_ACQUISITION_CREDITS = {
  assigned: 1000,
  used: 420,
};

type ClientAcquisitionLogEntry = {
  id: string;
  time: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
};

const CLIENT_ACQUISITION_LOGS: ClientAcquisitionLogEntry[] = [
  {
    id: "cas-log-1",
    time: "Aug 6, 2026 4:40 PM",
    inputTokens: 320,
    outputTokens: 140,
    cost: 1.8,
  },
  {
    id: "cas-log-2",
    time: "Aug 6, 2026 3:12 PM",
    inputTokens: 910,
    outputTokens: 420,
    cost: 4.65,
  },
  {
    id: "cas-log-3",
    time: "Aug 6, 2026 1:55 PM",
    inputTokens: 240,
    outputTokens: 95,
    cost: 1.2,
  },
  {
    id: "cas-log-4",
    time: "Aug 5, 2026 6:28 PM",
    inputTokens: 1280,
    outputTokens: 610,
    cost: 7.4,
  },
  {
    id: "cas-log-5",
    time: "Aug 5, 2026 11:04 AM",
    inputTokens: 480,
    outputTokens: 210,
    cost: 2.55,
  },
];

const SYSTEM_USAGE_METRICS = [
  {
    id: "storage",
    label: "Storage",
    used: 82,
    total: 200,
    unit: "GB",
  },
  {
    id: "seats",
    label: "Seats active",
    used: 11,
    total: 12,
    unit: "users",
  },
] as const;

type UsageLogEntry = {
  id: string;
  time: string;
  requestedBy: string;
  modelUsed: string;
  inputTokens: number;
  outputTokens: number;
  taskType: string;
};

const USAGE_LOGS: UsageLogEntry[] = [
  {
    id: "log-1",
    time: "Aug 6, 2026 4:12 PM",
    requestedBy: "Rohit Rajawat",
    modelUsed: "Claude Opus 4",
    inputTokens: 2140,
    outputTokens: 890,
    taskType: "Research & Analysis (heavy tier)",
  },
  {
    id: "log-2",
    time: "Aug 6, 2026 3:48 PM",
    requestedBy: "Matt Murdock",
    modelUsed: "GPT-4o mini",
    inputTokens: 640,
    outputTokens: 310,
    taskType: "Quick Tasks (light tier)",
  },
  {
    id: "log-3",
    time: "Aug 6, 2026 2:21 PM",
    requestedBy: "Foggy Nelson",
    modelUsed: "Claude Sonnet 4",
    inputTokens: 4820,
    outputTokens: 1560,
    taskType: "Research & Analysis (heavy tier)",
  },
  {
    id: "log-4",
    time: "Aug 6, 2026 1:05 PM",
    requestedBy: "Karen Page",
    modelUsed: "Claude Haiku",
    inputTokens: 420,
    outputTokens: 180,
    taskType: "Quick Tasks (light tier)",
  },
  {
    id: "log-5",
    time: "Aug 6, 2026 11:42 AM",
    requestedBy: "Matt Murdock",
    modelUsed: "GPT-4o",
    inputTokens: 3180,
    outputTokens: 1240,
    taskType: "Research & Analysis (heavy tier)",
  },
  {
    id: "log-6",
    time: "Aug 5, 2026 6:18 PM",
    requestedBy: "Rohit Rajawat",
    modelUsed: "Claude Haiku",
    inputTokens: 290,
    outputTokens: 140,
    taskType: "Quick Tasks (light tier)",
  },
  {
    id: "log-7",
    time: "Aug 5, 2026 4:03 PM",
    requestedBy: "Foggy Nelson",
    modelUsed: "Claude Opus 4",
    inputTokens: 6120,
    outputTokens: 2310,
    taskType: "Research & Analysis (heavy tier)",
  },
  {
    id: "log-8",
    time: "Aug 5, 2026 12:27 PM",
    requestedBy: "Karen Page",
    modelUsed: "GPT-4o mini",
    inputTokens: 510,
    outputTokens: 260,
    taskType: "Quick Tasks (light tier)",
  },
  {
    id: "log-9",
    time: "Aug 4, 2026 5:51 PM",
    requestedBy: "Matt Murdock",
    modelUsed: "Claude Sonnet 4",
    inputTokens: 2750,
    outputTokens: 980,
    taskType: "Research & Analysis (heavy tier)",
  },
  {
    id: "log-10",
    time: "Aug 4, 2026 10:14 AM",
    requestedBy: "Rohit Rajawat",
    modelUsed: "Claude Haiku",
    inputTokens: 360,
    outputTokens: 150,
    taskType: "Quick Tasks (light tier)",
  },
];

const USAGE_LOGS_PREVIEW_COUNT = 5;

function formatCredits(value: number) {
  return value.toLocaleString("en-US");
}

function UsageProgressRow({
  label,
  used,
  total,
  unit,
}: {
  label: string;
  used: number;
  total: number;
  unit: string;
}) {
  const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)_auto] items-center gap-4">
      <p className="text-body-md text-neutral-950">{label}</p>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-neutral-200"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={used}
      >
        <div
          className="h-full rounded-full bg-violet-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="justify-self-end whitespace-nowrap text-[13px] leading-5 text-neutral-600">
        {used.toLocaleString("en-US")}
        {unit === "GB" ? ` ${unit}` : ""} / {total.toLocaleString("en-US")} {unit}
      </p>
    </div>
  );
}

function UsageLogsTable({ logs }: { logs: UsageLogEntry[] }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-neutral-200">
            {[
              "Time",
              "Requested by",
              "Model used",
              "Input tokens",
              "Output tokens",
              "Task type",
            ].map((heading) => (
              <th
                key={heading}
                className="whitespace-nowrap py-3 pr-4 text-[12px] font-medium text-neutral-500 first:pl-0 last:pr-0"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map((entry) => (
            <tr
              key={entry.id}
              className="border-b border-neutral-200 last:border-b-0"
            >
              <td className="whitespace-nowrap py-3.5 pr-4 text-[13px] leading-5 text-neutral-800 first:pl-0">
                {entry.time}
              </td>
              <td className="whitespace-nowrap py-3.5 pr-4 text-[13px] leading-5 text-neutral-800">
                {entry.requestedBy}
              </td>
              <td className="whitespace-nowrap py-3.5 pr-4 text-[13px] leading-5 text-neutral-800">
                {entry.modelUsed}
              </td>
              <td className="whitespace-nowrap py-3.5 pr-4 text-[13px] leading-5 text-neutral-800">
                {entry.inputTokens.toLocaleString("en-US")}
              </td>
              <td className="whitespace-nowrap py-3.5 pr-4 text-[13px] leading-5 text-neutral-800">
                {entry.outputTokens.toLocaleString("en-US")}
              </td>
              <td className="whitespace-nowrap py-3.5 text-[13px] leading-5 text-neutral-800 last:pr-0">
                {entry.taskType}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClientAcquisitionLogsTable({
  logs,
}: {
  logs: ClientAcquisitionLogEntry[];
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-neutral-200">
            {["Time", "Input token", "Output token", "Cost"].map((heading) => (
              <th
                key={heading}
                className="whitespace-nowrap py-3 pr-4 text-[12px] font-medium text-neutral-500 first:pl-0 last:pr-0"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map((entry) => (
            <tr key={entry.id} className="border-b border-neutral-200">
              <td className="whitespace-nowrap py-3.5 pr-4 text-[13px] leading-5 text-neutral-800">
                {entry.time}
              </td>
              <td className="whitespace-nowrap py-3.5 pr-4 text-[13px] leading-5 text-neutral-800">
                {entry.inputTokens.toLocaleString("en-US")}
              </td>
              <td className="whitespace-nowrap py-3.5 pr-4 text-[13px] leading-5 text-neutral-800">
                {entry.outputTokens.toLocaleString("en-US")}
              </td>
              <td className="whitespace-nowrap py-3.5 text-[13px] leading-5 text-neutral-800 last:pr-0">
                {formatCurrency(entry.cost)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type BuyCreditsDialogProps = {
  open: boolean;
  amount: string;
  onAmountChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

function BuyCreditsDialog({
  open,
  amount,
  onAmountChange,
  onClose,
  onConfirm,
}: BuyCreditsDialogProps) {
  const titleId = useId();
  const amountRef = useRef<HTMLInputElement | null>(null);
  const reduceMotion = useReducedMotion();
  const amountValue = Number.parseFloat(amount);
  const canConfirm = Number.isFinite(amountValue) && amountValue > 0;

  const overlayTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.18, ease: UI_EASE };

  const panelTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.22, ease: UI_EASE };

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      amountRef.current?.focus();
      amountRef.current?.select();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="buy-credits-dialog"
          className="absolute inset-0 z-[60] flex items-center justify-center px-4"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
        >
          <div
            className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
            aria-hidden
            onMouseDown={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-sm rounded-2xl border border-neutral-300 bg-[var(--background)] p-5 shadow-[var(--shadow-panel)]"
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.99 }
            }
            transition={panelTransition}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h3
              id={titleId}
              className="font-tiempos-headline text-[20px] leading-none tracking-[-0.015em] text-neutral-950"
            >
              Buy credits
            </h3>
            <p className="mt-3 text-caption leading-5 text-neutral-600">
              Add AI credits to the firm&apos;s total pool, charged to your card on file.
            </p>

            <label className="mt-5 block">
              <span className="mb-1.5 block text-[12px] font-medium leading-4 text-neutral-500">
                Amount (USD)
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 focus-within:border-violet-300/80 focus-within:ring-2 focus-within:ring-violet-200/60">
                <span className="text-body-md text-neutral-500">$</span>
                <input
                  ref={amountRef}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(event) => onAmountChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && canConfirm) {
                      event.preventDefault();
                      onConfirm();
                    }
                  }}
                  placeholder="0"
                  className="w-full bg-transparent text-body-md text-neutral-950 placeholder:text-neutral-500 focus:outline-none"
                />
              </div>
            </label>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-body-md-secondary text-neutral-700 ui-t-colors hover:bg-neutral-200 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={!canConfirm}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--button-primary-bg)] px-3.5 text-body-md text-[var(--button-primary-fg)] hover:bg-[var(--button-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--button-primary-disabled-bg)] disabled:text-[var(--button-primary-disabled-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
              >
                Confirm purchase
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

const BILLING_COUNTRIES = [
  "United States",
  "India",
  "United Kingdom",
  "Canada",
  "Australia",
] as const;

type MonthlyBillLineItem = {
  id: string;
  label: string;
  amount: number;
};

type MonthlyBill = {
  id: string;
  monthLabel: string;
  total: number;
  lineItems: MonthlyBillLineItem[];
};

const MONTHLY_BILLS: MonthlyBill[] = [
  {
    id: "2026-08",
    monthLabel: "August 2026",
    total: 1240,
    lineItems: [
      {
        id: "aug-opus",
        label: "Claude Opus 4 (Research & Analysis)",
        amount: 620,
      },
      {
        id: "aug-sonnet",
        label: "Claude Sonnet 4 (Research & Analysis)",
        amount: 280,
      },
      {
        id: "aug-mini",
        label: "GPT-4o mini (Quick Tasks)",
        amount: 210,
      },
      {
        id: "aug-haiku",
        label: "Claude Haiku (Quick Tasks)",
        amount: 130,
      },
    ],
  },
  {
    id: "2026-07",
    monthLabel: "July 2026",
    total: 1198.5,
    lineItems: [
      {
        id: "jul-opus",
        label: "Claude Opus 4 (Research & Analysis)",
        amount: 540,
      },
      {
        id: "jul-gpt4o",
        label: "GPT-4o (Research & Analysis)",
        amount: 318.5,
      },
      {
        id: "jul-mini",
        label: "GPT-4o mini (Quick Tasks)",
        amount: 210,
      },
      {
        id: "jul-haiku",
        label: "Claude Haiku (Quick Tasks)",
        amount: 130,
      },
    ],
  },
  {
    id: "2026-06",
    monthLabel: "June 2026",
    total: 900,
    lineItems: [
      {
        id: "jun-opus",
        label: "Claude Opus 4 (Research & Analysis)",
        amount: 410,
      },
      {
        id: "jun-sonnet",
        label: "Claude Sonnet 4 (Research & Analysis)",
        amount: 260,
      },
      {
        id: "jun-mini",
        label: "GPT-4o mini (Quick Tasks)",
        amount: 140,
      },
      {
        id: "jun-haiku",
        label: "Claude Haiku (Quick Tasks)",
        amount: 90,
      },
    ],
  },
  {
    id: "2026-05",
    monthLabel: "May 2026",
    total: 1084,
    lineItems: [
      {
        id: "may-opus",
        label: "Claude Opus 4 (Research & Analysis)",
        amount: 490,
      },
      {
        id: "may-sonnet",
        label: "Claude Sonnet 4 (Research & Analysis)",
        amount: 304,
      },
      {
        id: "may-mini",
        label: "GPT-4o mini (Quick Tasks)",
        amount: 180,
      },
      {
        id: "may-haiku",
        label: "Claude Haiku (Quick Tasks)",
        amount: 110,
      },
    ],
  },
  {
    id: "2026-04",
    monthLabel: "April 2026",
    total: 976.25,
    lineItems: [
      {
        id: "apr-opus",
        label: "Claude Opus 4 (Research & Analysis)",
        amount: 440,
      },
      {
        id: "apr-gpt4o",
        label: "GPT-4o (Research & Analysis)",
        amount: 286.25,
      },
      {
        id: "apr-mini",
        label: "GPT-4o mini (Quick Tasks)",
        amount: 160,
      },
      {
        id: "apr-haiku",
        label: "Claude Haiku (Quick Tasks)",
        amount: 90,
      },
    ],
  },
  {
    id: "2026-03",
    monthLabel: "March 2026",
    total: 842,
    lineItems: [
      {
        id: "mar-opus",
        label: "Claude Opus 4 (Research & Analysis)",
        amount: 380,
      },
      {
        id: "mar-sonnet",
        label: "Claude Sonnet 4 (Research & Analysis)",
        amount: 242,
      },
      {
        id: "mar-mini",
        label: "GPT-4o mini (Quick Tasks)",
        amount: 140,
      },
      {
        id: "mar-haiku",
        label: "Claude Haiku (Quick Tasks)",
        amount: 80,
      },
    ],
  },
];

const MONTHLY_BILLS_PREVIEW_COUNT = 3;

type InvoiceStatus = "Paid" | "Pending";

type InvoiceRecord = {
  id: string;
  invoiceNumber: string;
  dateLabel: string;
  total: number;
  status: InvoiceStatus;
  periodLabel: string;
  lineItems: MonthlyBillLineItem[];
  billedTo: string;
  paymentMethod: string;
};

const INVOICES: InvoiceRecord[] = [
  {
    id: "inv-2026-08",
    invoiceNumber: "INV-2026-08",
    dateLabel: "Aug 20, 2026",
    total: 1240,
    status: "Paid",
    periodLabel: "August 2026",
    billedTo: "As Wel As Law · Matt Murdock",
    paymentMethod: "Visa •••• 4471",
    lineItems: [
      {
        id: "inv-aug-opus",
        label: "Claude Opus 4 (Research & Analysis)",
        amount: 620,
      },
      {
        id: "inv-aug-sonnet",
        label: "Claude Sonnet 4 (Research & Analysis)",
        amount: 280,
      },
      {
        id: "inv-aug-mini",
        label: "GPT-4o mini (Quick Tasks)",
        amount: 210,
      },
      {
        id: "inv-aug-haiku",
        label: "Claude Haiku (Quick Tasks)",
        amount: 130,
      },
    ],
  },
  {
    id: "inv-2026-07",
    invoiceNumber: "INV-2026-07",
    dateLabel: "Jul 20, 2026",
    total: 1198.5,
    status: "Paid",
    periodLabel: "July 2026",
    billedTo: "As Wel As Law · Matt Murdock",
    paymentMethod: "Visa •••• 4471",
    lineItems: [
      {
        id: "inv-jul-opus",
        label: "Claude Opus 4 (Research & Analysis)",
        amount: 540,
      },
      {
        id: "inv-jul-gpt4o",
        label: "GPT-4o (Research & Analysis)",
        amount: 318.5,
      },
      {
        id: "inv-jul-mini",
        label: "GPT-4o mini (Quick Tasks)",
        amount: 210,
      },
      {
        id: "inv-jul-haiku",
        label: "Claude Haiku (Quick Tasks)",
        amount: 130,
      },
    ],
  },
  {
    id: "inv-2026-06",
    invoiceNumber: "INV-2026-06",
    dateLabel: "Jun 20, 2026",
    total: 900,
    status: "Paid",
    periodLabel: "June 2026",
    billedTo: "As Wel As Law · Matt Murdock",
    paymentMethod: "Visa •••• 4471",
    lineItems: [
      {
        id: "inv-jun-opus",
        label: "Claude Opus 4 (Research & Analysis)",
        amount: 410,
      },
      {
        id: "inv-jun-sonnet",
        label: "Claude Sonnet 4 (Research & Analysis)",
        amount: 260,
      },
      {
        id: "inv-jun-mini",
        label: "GPT-4o mini (Quick Tasks)",
        amount: 140,
      },
      {
        id: "inv-jun-haiku",
        label: "Claude Haiku (Quick Tasks)",
        amount: 90,
      },
    ],
  },
  {
    id: "inv-2026-05",
    invoiceNumber: "INV-2026-05",
    dateLabel: "May 20, 2026",
    total: 1084,
    status: "Paid",
    periodLabel: "May 2026",
    billedTo: "As Wel As Law · Matt Murdock",
    paymentMethod: "Visa •••• 4471",
    lineItems: [
      {
        id: "inv-may-opus",
        label: "Claude Opus 4 (Research & Analysis)",
        amount: 490,
      },
      {
        id: "inv-may-sonnet",
        label: "Claude Sonnet 4 (Research & Analysis)",
        amount: 304,
      },
      {
        id: "inv-may-mini",
        label: "GPT-4o mini (Quick Tasks)",
        amount: 180,
      },
      {
        id: "inv-may-haiku",
        label: "Claude Haiku (Quick Tasks)",
        amount: 110,
      },
    ],
  },
  {
    id: "inv-2026-04",
    invoiceNumber: "INV-2026-04",
    dateLabel: "Apr 20, 2026",
    total: 976.25,
    status: "Paid",
    periodLabel: "April 2026",
    billedTo: "As Wel As Law · Matt Murdock",
    paymentMethod: "Visa •••• 4471",
    lineItems: [
      {
        id: "inv-apr-opus",
        label: "Claude Opus 4 (Research & Analysis)",
        amount: 440,
      },
      {
        id: "inv-apr-gpt4o",
        label: "GPT-4o (Research & Analysis)",
        amount: 286.25,
      },
      {
        id: "inv-apr-mini",
        label: "GPT-4o mini (Quick Tasks)",
        amount: 160,
      },
      {
        id: "inv-apr-haiku",
        label: "Claude Haiku (Quick Tasks)",
        amount: 90,
      },
    ],
  },
  {
    id: "inv-2026-03",
    invoiceNumber: "INV-2026-03",
    dateLabel: "Mar 20, 2026",
    total: 842,
    status: "Paid",
    periodLabel: "March 2026",
    billedTo: "As Wel As Law · Matt Murdock",
    paymentMethod: "Visa •••• 4471",
    lineItems: [
      {
        id: "inv-mar-opus",
        label: "Claude Opus 4 (Research & Analysis)",
        amount: 380,
      },
      {
        id: "inv-mar-sonnet",
        label: "Claude Sonnet 4 (Research & Analysis)",
        amount: 242,
      },
      {
        id: "inv-mar-mini",
        label: "GPT-4o mini (Quick Tasks)",
        amount: 140,
      },
      {
        id: "inv-mar-haiku",
        label: "Claude Haiku (Quick Tasks)",
        amount: 80,
      },
    ],
  },
];

const INVOICES_PREVIEW_COUNT = 3;

const USER_LIMIT_MIN = 30;
const USER_LIMIT_MAX = 5000;
const CREDIT_PRICE_USD = 0.03;

type FirmUser = {
  id: string;
  name: string;
  used: number;
  limit: number;
};

const DEFAULT_FIRM_USERS: FirmUser[] = [
  { id: "user-rohit", name: "Rohit Rajawat", used: 1120, limit: 1500 },
  { id: "user-jenna", name: "Jenna Cole", used: 640, limit: 1000 },
  { id: "user-sarah", name: "Sarah Ahn", used: 980, limit: 1000 },
  { id: "user-david", name: "David Kim", used: 210, limit: 750 },
];

function formatCurrency(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function formatCreditsFromUsd(amount: number) {
  return Math.round(amount / CREDIT_PRICE_USD).toLocaleString("en-US");
}

type MonthlyBillsListProps = {
  bills: MonthlyBill[];
  expandedId: string | null;
  onExpandedChange: (id: string | null) => void;
  reduceMotion: boolean | null;
  transition: { duration: number; ease?: readonly [number, number, number, number] };
};

function MonthlyBillsList({
  bills,
  expandedId,
  onExpandedChange,
  reduceMotion,
  transition,
}: MonthlyBillsListProps) {
  return (
    <div className="w-full">
      {bills.map((bill, index) => {
        const isExpanded = expandedId === bill.id;
        return (
          <div
            key={bill.id}
            className={
              index < bills.length - 1 ? "border-b border-neutral-200" : ""
            }
          >
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() =>
                onExpandedChange(expandedId === bill.id ? null : bill.id)
              }
              className="flex w-full items-center justify-between gap-4 py-3.5 text-left ui-t-colors hover:bg-neutral-100/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
            >
              <span className="text-body-md font-medium text-neutral-950">
                {bill.monthLabel}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-body-md text-neutral-950">
                  {formatCurrency(bill.total)}
                </span>
                <ChevronDown
                  className={[
                    "h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
                    isExpanded ? "rotate-180" : "",
                  ].join(" ")}
                  strokeWidth={1.75}
                />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isExpanded ? (
                <motion.div
                  key={`${bill.id}-details`}
                  initial={
                    reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }
                  }
                  animate={{ opacity: 1, height: "auto" }}
                  exit={
                    reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }
                  }
                  transition={transition}
                  className="overflow-hidden"
                >
                  <div className="space-y-2.5 pb-4 pl-3">
                    {bill.lineItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-4"
                      >
                        <p className="min-w-0 text-[13px] leading-5 text-neutral-600">
                          {item.label}
                        </p>
                        <p className="shrink-0 text-[13px] leading-5 text-neutral-600">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

type InvoicesTableProps = {
  invoices: InvoiceRecord[];
  onView: (invoice: InvoiceRecord) => void;
};

function InvoicesTable({ invoices, onView }: InvoicesTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-neutral-200">
            {["Date", "Total", "Status", "Action"].map((heading) => (
              <th
                key={heading}
                className={[
                  "whitespace-nowrap py-3 pr-4 text-[12px] font-medium text-neutral-500 first:pl-0 last:pr-0",
                  heading === "Action" ? "text-right" : "",
                ].join(" ")}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="border-b border-neutral-200 last:border-b-0"
            >
              <td className="whitespace-nowrap py-3.5 pr-4 text-[13px] leading-5 text-neutral-800">
                {invoice.dateLabel}
              </td>
              <td className="whitespace-nowrap py-3.5 pr-4 text-[13px] leading-5 text-neutral-800">
                {formatCurrency(invoice.total)}
              </td>
              <td className="whitespace-nowrap py-3.5 pr-4">
                <span
                  className={[
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-4",
                    invoice.status === "Paid"
                      ? "bg-neutral-100 text-neutral-700"
                      : "bg-neutral-100 text-neutral-600",
                  ].join(" ")}
                >
                  {invoice.status}
                </span>
              </td>
              <td className="whitespace-nowrap py-3.5 text-right last:pr-0">
                <button
                  type="button"
                  onClick={() => onView(invoice)}
                  className="inline-flex items-center gap-1 text-[13px] font-medium leading-5 text-neutral-800 ui-t-colors hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                >
                  View
                  <ChevronRight className="h-4 w-4 text-neutral-400" strokeWidth={1.75} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type InvoiceDetailDialogProps = {
  invoice: InvoiceRecord | null;
  open: boolean;
  onClose: () => void;
};

function InvoiceDetailDialog({ invoice, open, onClose }: InvoiceDetailDialogProps) {
  const titleId = useId();
  const printRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  const overlayTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.18, ease: UI_EASE };

  const panelTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.22, ease: UI_EASE };

  const handlePrint = () => {
    if (!invoice || !printRef.current) return;
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=840,height=900");
    if (!printWindow) return;
    printWindow.document.write(`<!doctype html><html><head><title>${invoice.invoiceNumber}</title>
      <style>
        body { font-family: Georgia, serif; color: #171717; padding: 32px; }
        h1 { font-size: 24px; margin: 0 0 8px; }
        .meta { color: #525252; font-size: 13px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { text-align: left; padding: 10px 0; border-bottom: 1px solid #e5e5e5; font-size: 13px; }
        th { color: #737373; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
        .total { font-weight: 600; font-size: 16px; }
      </style></head><body>${printRef.current.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleExport = () => {
    if (!invoice) return;
    const lines = [
      `Invoice,${invoice.invoiceNumber}`,
      `Date,${invoice.dateLabel}`,
      `Period,${invoice.periodLabel}`,
      `Billed To,${invoice.billedTo}`,
      `Payment Method,${invoice.paymentMethod}`,
      `Status,${invoice.status}`,
      "",
      "Item,Amount",
      ...invoice.lineItems.map((item) => `"${item.label}",${item.amount.toFixed(2)}`),
      `Total,${invoice.total.toFixed(2)}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.invoiceNumber}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {open && invoice ? (
        <motion.div
          key="invoice-detail-dialog"
          className="absolute inset-0 z-[60] flex items-center justify-center px-4 py-6"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
        >
          <div
            className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
            aria-hidden
            onMouseDown={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex max-h-[min(86vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-neutral-300 bg-[var(--background)] shadow-[var(--shadow-panel)]"
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.99 }
            }
            transition={panelTransition}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-neutral-200 px-5 py-4">
              <div className="min-w-0">
                <h3
                  id={titleId}
                  className="font-tiempos-headline text-[20px] leading-none tracking-[-0.015em] text-neutral-950"
                >
                  Invoice
                </h3>
                <p className="mt-2 text-[12px] leading-4 text-neutral-500">
                  {invoice.invoiceNumber}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-medium leading-4 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                >
                  <Printer className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Print
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-medium leading-4 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                >
                  <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Export
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-200 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                  aria-label="Close invoice"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <div ref={printRef}>
                <h1 className="font-tiempos-text text-[24px] leading-none tracking-[-0.015em] text-neutral-950">
                  {invoice.invoiceNumber}
                </h1>
                <div className="meta mt-3 space-y-1 text-[13px] leading-5 text-neutral-600">
                  <p>Date: {invoice.dateLabel}</p>
                  <p>Billing period: {invoice.periodLabel}</p>
                  <p>Billed to: {invoice.billedTo}</p>
                  <p>Payment method: {invoice.paymentMethod}</p>
                  <p>
                    Status:{" "}
                    <span className="font-medium text-violet-700">{invoice.status}</span>
                  </p>
                </div>

                <table className="mt-6 w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="pb-2 text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-500">
                        Item
                      </th>
                      <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-500">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((item) => (
                      <tr key={item.id} className="border-b border-neutral-200">
                        <td className="py-2.5 text-[13px] leading-5 text-neutral-800">
                          {item.label}
                        </td>
                        <td className="py-2.5 text-right text-[13px] leading-5 text-neutral-800">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="total pt-3 text-[15px] font-medium text-neutral-950">
                        Total
                      </td>
                      <td className="total pt-3 text-right text-[15px] font-medium text-neutral-950">
                        {formatCurrency(invoice.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type SetLimitDialogProps = {
  open: boolean;
  userName: string;
  limit: number;
  onClose: () => void;
  onSave: (limit: number) => void;
};

function SetLimitDialog({
  open,
  userName,
  limit,
  onClose,
  onSave,
}: SetLimitDialogProps) {
  const titleId = useId();
  const reduceMotion = useReducedMotion();
  const [draftLimit, setDraftLimit] = useState(limit);

  const overlayTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.18, ease: UI_EASE };

  const panelTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.22, ease: UI_EASE };

  useEffect(() => {
    if (open) setDraftLimit(limit);
  }, [open, limit]);

  const percent =
    ((draftLimit - USER_LIMIT_MIN) / (USER_LIMIT_MAX - USER_LIMIT_MIN)) * 100;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="set-limit-dialog"
          className="absolute inset-0 z-[60] flex items-center justify-center px-4 py-6"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
        >
          <div
            className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
            aria-hidden
            onMouseDown={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-neutral-300 bg-[var(--background)] shadow-[var(--shadow-panel)]"
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.99 }
            }
            transition={panelTransition}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-5 pb-1 pt-5">
              <div className="min-w-0">
                <h3
                  id={titleId}
                  className="font-tiempos-headline text-[20px] leading-none tracking-[-0.015em] text-neutral-950"
                >
                  Set your monthly maximum
                </h3>
                <p className="mt-2 text-[12px] leading-4 text-neutral-500">
                  For {userName}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-200 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div className="px-5 pb-5 pt-4">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="font-tiempos-text text-[28px] leading-none tracking-[-0.015em] text-neutral-950">
                  {formatCurrency(draftLimit)}
                  <span className="text-[18px] text-neutral-500">/mo</span>
                </p>
                <p className="mt-2 text-[13px] leading-5 text-neutral-600">
                  That&apos;s about {formatCreditsFromUsd(draftLimit)} credits, at{" "}
                  {formatCurrency(CREDIT_PRICE_USD)}/credit.
                </p>

                <div className="mt-5">
                  <input
                    type="range"
                    min={USER_LIMIT_MIN}
                    max={USER_LIMIT_MAX}
                    step={10}
                    value={draftLimit}
                    onChange={(event) => setDraftLimit(Number(event.target.value))}
                    aria-label={`Monthly maximum for ${userName}`}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-violet-600 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-violet-600 [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-600"
                    style={{
                      background: `linear-gradient(to right, var(--violet-500) 0%, var(--violet-500) ${percent}%, rgb(229 229 229) ${percent}%, rgb(229 229 229) 100%)`,
                    }}
                  />
                  <div className="mt-2 flex items-center justify-between text-[12px] leading-4 text-neutral-500">
                    <span>{formatCurrency(USER_LIMIT_MIN)}</span>
                    <span>{formatCurrency(USER_LIMIT_MAX)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-body-md-secondary text-neutral-700 ui-t-colors hover:bg-neutral-200 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onSave(draftLimit)}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--button-primary-bg)] px-3.5 text-body-md text-[var(--button-primary-fg)] hover:bg-[var(--button-primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                >
                  Save limit
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type UsersTableProps = {
  users: FirmUser[];
  onSetLimit: (user: FirmUser) => void;
};

function UsersTable({ users, onSetLimit }: UsersTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="whitespace-nowrap py-3 pr-4 text-[12px] font-medium text-neutral-500">
              User
            </th>
            <th className="whitespace-nowrap py-3 pr-4 text-[12px] font-medium text-neutral-500">
              Used
            </th>
            <th className="whitespace-nowrap py-3 pr-4 text-[12px] font-medium text-neutral-500">
              Limit
            </th>
            <th className="min-w-[140px] py-3 pr-4 text-[12px] font-medium text-neutral-500">
              <span className="sr-only">Usage</span>
            </th>
            <th className="whitespace-nowrap py-3 text-right text-[12px] font-medium text-neutral-500 last:pr-0">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const percent =
              user.limit > 0
                ? Math.min(100, Math.round((user.used / user.limit) * 100))
                : 0;
            return (
              <tr
                key={user.id}
                className="border-b border-neutral-200 last:border-b-0 hover:bg-neutral-100/50"
              >
                <td className="whitespace-nowrap py-3.5 pr-4 text-[13px] leading-5 text-neutral-950">
                  {user.name}
                </td>
                <td className="whitespace-nowrap py-3.5 pr-4 text-[13px] leading-5 text-neutral-800">
                  {formatCurrency(user.used)}
                </td>
                <td className="whitespace-nowrap py-3.5 pr-4 text-[13px] leading-5 text-neutral-800">
                  {formatCurrency(user.limit)}
                </td>
                <td className="py-3.5 pr-4">
                  <div
                    className="h-2 overflow-hidden rounded-full bg-neutral-200"
                    role="progressbar"
                    aria-label={`${user.name} spend`}
                    aria-valuemin={0}
                    aria-valuemax={user.limit}
                    aria-valuenow={user.used}
                  >
                    <div
                      className="h-full rounded-full bg-violet-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </td>
                <td className="whitespace-nowrap py-3.5 text-right last:pr-0">
                  <button
                    type="button"
                    onClick={() => onSetLimit(user)}
                    className="inline-flex items-center gap-1 text-[13px] font-medium leading-5 text-neutral-800 ui-t-colors hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                  >
                    Set limit
                    <ChevronRight className="h-4 w-4 text-neutral-400" strokeWidth={1.75} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type UpdateCardDialogProps = {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
};

function UpdateCardDialog({ open, onClose, onContinue }: UpdateCardDialogProps) {
  const titleId = useId();
  const cardNumberRef = useRef<HTMLInputElement | null>(null);
  const reduceMotion = useReducedMotion();
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState<(typeof BILLING_COUNTRIES)[number]>("United States");
  const [address, setAddress] = useState("");

  const canContinue =
    cardNumber.trim().length >= 12 &&
    expiryDate.trim().length >= 4 &&
    securityCode.trim().length >= 3 &&
    fullName.trim().length > 0 &&
    address.trim().length > 0;

  const overlayTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.18, ease: UI_EASE };

  const panelTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.22, ease: UI_EASE };

  useEffect(() => {
    if (!open) {
      setCardNumber("");
      setExpiryDate("");
      setSecurityCode("");
      setFullName("");
      setCountry("United States");
      setAddress("");
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      cardNumberRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const fieldClass =
    "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-body-md text-neutral-950 placeholder:text-neutral-500 focus:border-violet-300/80 focus:outline-none focus:ring-2 focus:ring-violet-200/60";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="update-card-dialog"
          className="absolute inset-0 z-[60] flex items-center justify-center px-4 py-6"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
        >
          <div
            className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
            aria-hidden
            onMouseDown={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex max-h-[min(86vh,640px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-neutral-300 bg-[var(--background)] shadow-[var(--shadow-panel)]"
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.99 }
            }
            transition={panelTransition}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-1 pt-5">
              <h3
                id={titleId}
                className="font-tiempos-headline text-[20px] leading-none tracking-[-0.015em] text-neutral-950"
              >
                Add payment method
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-200 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-3">
              <p className="mb-4 inline-flex items-center gap-1.5 text-[12px] leading-4 text-neutral-600">
                <Lock className="h-3.5 w-3.5 shrink-0 text-violet-600" strokeWidth={1.75} />
                Secure, fast checkout
              </p>

              <div className="relative">
                <input
                  ref={cardNumberRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={cardNumber}
                  onChange={(event) => setCardNumber(event.target.value)}
                  placeholder="Card number"
                  className={fieldClass}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1 text-[10px] font-medium tracking-wide text-neutral-400">
                  <span>VISA</span>
                  <span>MC</span>
                  <span>AMEX</span>
                </span>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  value={expiryDate}
                  onChange={(event) => setExpiryDate(event.target.value)}
                  placeholder="Expiry date"
                  className={fieldClass}
                />
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={securityCode}
                    onChange={(event) => setSecurityCode(event.target.value)}
                    placeholder="Security code"
                    className={fieldClass}
                  />
                  <CreditCard
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              <h4 className="mt-6 text-[16px] font-medium leading-6 text-neutral-950">
                Billing address
              </h4>

              <div className="mt-3 flex flex-col gap-2.5">
                <input
                  type="text"
                  autoComplete="cc-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Full name"
                  className={fieldClass}
                />

                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-500">
                    Country or region
                  </span>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(event) =>
                        setCountry(event.target.value as (typeof BILLING_COUNTRIES)[number])
                      }
                      className={`${fieldClass} appearance-none pr-9`}
                    >
                      {BILLING_COUNTRIES.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
                      strokeWidth={1.75}
                    />
                  </div>
                </label>

                <input
                  type="text"
                  autoComplete="street-address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Address"
                  className={fieldClass}
                />
              </div>

              <p className="mt-5 text-[12px] leading-5 text-neutral-500">
                By continuing, you authorize Lexee to save this payment method and charge it
                for future payments.
              </p>

              <button
                type="button"
                onClick={onContinue}
                disabled={!canContinue}
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--button-primary-bg)] px-3.5 text-body-md text-[var(--button-primary-fg)] hover:bg-[var(--button-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--button-primary-disabled-bg)] disabled:text-[var(--button-primary-disabled-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type ModelSelectProps = {
  label: string;
  options: ModelOption[];
  value: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (id: string) => void;
};

function ModelSelect({
  label,
  options,
  value,
  open,
  onOpenChange,
  onChange,
}: ModelSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const selected = options.find((option) => option.id === value) ?? options[0];

  const menuTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.22, ease: UI_EASE };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      onOpenChange(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, onOpenChange]);

  return (
    <div ref={rootRef} className="relative mt-5">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => onOpenChange(!open)}
        className={[
          "flex w-full items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-left",
          "text-body-md text-neutral-950 ui-t-colors",
          "hover:border-neutral-300 hover:bg-neutral-100",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300",
          open ? "border-violet-300 ring-2 ring-violet-200/60" : "",
        ].join(" ")}
      >
        <span className="min-w-0 truncate">{selected?.label}</span>
        <ChevronDown
          className={[
            "h-4 w-4 shrink-0 text-neutral-600 transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            open ? "rotate-180" : "",
          ].join(" ")}
          strokeWidth={1.75}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="model-select-menu"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -1 }}
            transition={menuTransition}
            className="absolute left-0 right-0 top-full z-20 mt-2 origin-top rounded-xl border border-neutral-200 bg-neutral-50 p-2 shadow-[var(--shadow-popup)]"
          >
            <div role="listbox" aria-label={label} className="flex flex-col gap-1">
              {options.map((option) => {
                const isSelected = option.id === value;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.id);
                      onOpenChange(false);
                    }}
                    className={[
                      "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left ui-t-colors",
                      isSelected
                        ? "bg-neutral-200 text-neutral-950"
                        : "text-neutral-700 hover:bg-neutral-200/70 hover:text-neutral-950",
                    ].join(" ")}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-body-md text-inherit">{option.label}</span>
                      <span className="mt-1 block text-[12px] leading-5 text-neutral-600">
                        {option.description}
                      </span>
                    </span>
                    {isSelected ? (
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-neutral-700"
                        strokeWidth={2}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const searchRootRef = useRef<HTMLDivElement | null>(null);
  const researchSectionRef = useRef<HTMLElement | null>(null);
  const quickTasksSectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeNavId, setActiveNavId] = useState<SettingsNavId>("configuration");
  const [pendingSectionId, setPendingSectionId] = useState<SettingsSectionId | null>(
    null,
  );
  const [researchModelId, setResearchModelId] = useState("claude-opus-4");
  const [quickModelId, setQuickModelId] = useState("claude-haiku");
  const [researchMenuOpen, setResearchMenuOpen] = useState(false);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false);
  const [buyCreditsAmount, setBuyCreditsAmount] = useState("50");
  const [updateCardOpen, setUpdateCardOpen] = useState(false);
  const [expandedMonthlyBillId, setExpandedMonthlyBillId] = useState<string | null>(null);
  const [billingPage, setBillingPage] = useState<
    "overview" | "monthly-bills" | "invoices"
  >("overview");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [firmUsers, setFirmUsers] = useState<FirmUser[]>(DEFAULT_FIRM_USERS);
  const [limitUser, setLimitUser] = useState<FirmUser | null>(null);
  const [setLimitOpen, setSetLimitOpen] = useState(false);
  const [usageTimeframeId, setUsageTimeframeId] =
    useState<UsageTimeframeId>("billing-cycle");
  const [usageTimeframeMenuOpen, setUsageTimeframeMenuOpen] = useState(false);
  const [usagePage, setUsagePage] = useState<"overview" | "logs">("overview");
  const usageTimeframeRef = useRef<HTMLDivElement | null>(null);

  const usageCredits = USAGE_BY_TIMEFRAME[usageTimeframeId];
  const usageCreditsRemaining = usageCredits.total - usageCredits.used;
  const selectedUsageTimeframe =
    USAGE_TIMEFRAMES.find((item) => item.id === usageTimeframeId) ??
    USAGE_TIMEFRAMES[0];

  const closeBuyCredits = useCallback(() => {
    setBuyCreditsOpen(false);
    setBuyCreditsAmount("50");
  }, []);

  const confirmBuyCredits = useCallback(() => {
    // Prototype: purchase flow is visual-only for now.
    closeBuyCredits();
  }, [closeBuyCredits]);

  const closeUpdateCard = useCallback(() => {
    setUpdateCardOpen(false);
  }, []);

  const continueUpdateCard = useCallback(() => {
    // Prototype: card update flow is visual-only for now.
    closeUpdateCard();
  }, [closeUpdateCard]);

  const closeInvoiceDialog = useCallback(() => {
    setInvoiceDialogOpen(false);
    setSelectedInvoice(null);
  }, []);

  const openInvoiceDialog = useCallback((invoice: InvoiceRecord) => {
    setSelectedInvoice(invoice);
    setInvoiceDialogOpen(true);
  }, []);

  const closeSetLimit = useCallback(() => {
    setSetLimitOpen(false);
    setLimitUser(null);
  }, []);

  const openSetLimit = useCallback((user: FirmUser) => {
    setLimitUser(user);
    setSetLimitOpen(true);
  }, []);

  const saveUserLimit = useCallback(
    (limit: number) => {
      if (!limitUser) return;
      setFirmUsers((previous) =>
        previous.map((user) =>
          user.id === limitUser.id ? { ...user, limit } : user,
        ),
      );
      closeSetLimit();
    },
    [limitUser, closeSetLimit],
  );

  const overlayTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const };

  const panelTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.32, ease: [0.32, 0.72, 0, 1] as const };

  const searchMenuTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.18, ease: UI_EASE };

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return SETTINGS_SEARCH_INDEX.filter((item) => {
      if (item.label.toLowerCase().includes(normalized)) return true;
      if (item.description.toLowerCase().includes(normalized)) return true;
      return item.keywords.some((keyword) => keyword.includes(normalized) || normalized.includes(keyword));
    });
  }, [query]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const goToSearchResult = useCallback((result: SettingsSearchResult) => {
    setActiveNavId(result.navId);
    setPendingSectionId(result.sectionId ?? null);
    setUsagePage(result.usagePage ?? "overview");
    setBillingPage(result.billingPage ?? "overview");
    setQuery("");
    setSearchOpen(false);
    setResearchMenuOpen(false);
    setQuickMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (buyCreditsOpen) {
          closeBuyCredits();
          return;
        }
        if (updateCardOpen) {
          closeUpdateCard();
          return;
        }
        if (invoiceDialogOpen) {
          closeInvoiceDialog();
          return;
        }
        if (setLimitOpen) {
          closeSetLimit();
          return;
        }
        if (usagePage === "logs") {
          setUsagePage("overview");
          return;
        }
        if (billingPage === "monthly-bills" || billingPage === "invoices") {
          setBillingPage("overview");
          return;
        }
        if (usageTimeframeMenuOpen) {
          setUsageTimeframeMenuOpen(false);
          return;
        }
        if (searchOpen) {
          setSearchOpen(false);
          return;
        }
        if (researchMenuOpen || quickMenuOpen) {
          setResearchMenuOpen(false);
          setQuickMenuOpen(false);
          return;
        }
        handleClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [
    open,
    handleClose,
    researchMenuOpen,
    quickMenuOpen,
    searchOpen,
    buyCreditsOpen,
    closeBuyCredits,
    updateCardOpen,
    closeUpdateCard,
    invoiceDialogOpen,
    closeInvoiceDialog,
    setLimitOpen,
    closeSetLimit,
    usageTimeframeMenuOpen,
    usagePage,
    billingPage,
  ]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSearchOpen(false);
      setActiveNavId("configuration");
      setPendingSectionId(null);
      setResearchMenuOpen(false);
      setQuickMenuOpen(false);
      setUsageTimeframeMenuOpen(false);
      setUsageTimeframeId("billing-cycle");
      setUsagePage("overview");
      setBillingPage("overview");
      setExpandedMonthlyBillId(null);
      setFirmUsers(DEFAULT_FIRM_USERS);
      closeBuyCredits();
      closeUpdateCard();
      closeInvoiceDialog();
      closeSetLimit();
    }
  }, [open, closeBuyCredits, closeUpdateCard, closeInvoiceDialog, closeSetLimit]);

  useEffect(() => {
    setResearchMenuOpen(false);
    setQuickMenuOpen(false);
    setUsageTimeframeMenuOpen(false);
    if (activeNavId !== "usage") {
      setUsagePage("overview");
    }
    if (activeNavId !== "billing") {
      setBillingPage("overview");
      setExpandedMonthlyBillId(null);
    }
  }, [activeNavId]);

  useEffect(() => {
    if (!searchOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRootRef.current?.contains(target)) return;
      setSearchOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [searchOpen]);

  useEffect(() => {
    if (!usageTimeframeMenuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (usageTimeframeRef.current?.contains(target)) return;
      setUsageTimeframeMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [usageTimeframeMenuOpen]);

  useEffect(() => {
    if (!pendingSectionId || activeNavId !== "configuration") return;

    const frame = window.requestAnimationFrame(() => {
      const target =
        pendingSectionId === "research"
          ? researchSectionRef.current
          : quickTasksSectionRef.current;
      target?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
      setPendingSectionId(null);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pendingSectionId, activeNavId, reduceMotion]);

  const activeLabel =
    activeNavId === "usage" && usagePage === "logs"
      ? "Logs"
      : activeNavId === "billing" && billingPage === "monthly-bills"
        ? "Total Monthly bill"
        : activeNavId === "billing" && billingPage === "invoices"
          ? "Invoices"
          : SETTINGS_NAV_ITEMS.find((item) => item.id === activeNavId)?.label ??
            "Settings";

  const visibleUsageLogs =
    usagePage === "logs" ? USAGE_LOGS : USAGE_LOGS.slice(0, USAGE_LOGS_PREVIEW_COUNT);

  const visibleMonthlyBills =
    billingPage === "monthly-bills"
      ? MONTHLY_BILLS
      : MONTHLY_BILLS.slice(0, MONTHLY_BILLS_PREVIEW_COUNT);

  const visibleInvoices =
    billingPage === "invoices"
      ? INVOICES
      : INVOICES.slice(0, INVOICES_PREVIEW_COUNT);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="settings-modal"
          className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-8"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
        >
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            aria-hidden
            onMouseDown={handleClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex h-[min(82vh,720px)] w-full max-w-4xl overflow-hidden rounded-2xl border border-neutral-300 bg-[var(--background)] shadow-[var(--shadow-panel)]"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 14, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 8, scale: 0.99 }
            }
            transition={panelTransition}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <aside className="flex w-[240px] shrink-0 flex-col border-r border-neutral-200 bg-neutral-50">
              <div className="relative z-30 px-3 pb-2 pt-4" ref={searchRootRef}>
                <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-[var(--background)] px-3 py-2 focus-within:border-violet-300/80 focus-within:ring-2 focus-within:ring-violet-200/60">
                  <Search
                    className="h-4 w-4 shrink-0 text-neutral-500"
                    strokeWidth={1.75}
                  />
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(event) => {
                      const next = event.target.value;
                      setQuery(next);
                      setSearchOpen(next.trim().length > 0);
                    }}
                    onFocus={() => {
                      if (query.trim().length > 0) setSearchOpen(true);
                    }}
                    placeholder="Search"
                    aria-label="Search settings"
                    aria-expanded={searchOpen}
                    aria-controls="settings-search-results"
                    autoComplete="off"
                    className="w-full bg-transparent text-body-md text-neutral-950 placeholder:text-neutral-500 focus:outline-none"
                  />
                </div>

                <AnimatePresence>
                  {searchOpen && query.trim().length > 0 ? (
                    <motion.div
                      id="settings-search-results"
                      key="settings-search-menu"
                      role="listbox"
                      aria-label="Settings search results"
                      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -1 }}
                      transition={searchMenuTransition}
                      className="absolute left-3 right-3 top-full z-40 mt-1.5 origin-top overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-1.5 shadow-[var(--shadow-popup)]"
                    >
                      {searchResults.length > 0 ? (
                        <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
                          {searchResults.map((result) => (
                            <button
                              key={result.id}
                              type="button"
                              role="option"
                              onClick={() => goToSearchResult(result)}
                              className="flex w-full flex-col items-start rounded-lg px-2.5 py-2 text-left ui-t-colors hover:bg-neutral-200/80"
                            >
                              <span className="text-body-md text-neutral-950">
                                {result.label}
                              </span>
                              <span className="mt-0.5 text-[11px] leading-4 text-neutral-500">
                                {result.description}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="px-2.5 py-3 text-[12px] leading-4 text-neutral-500">
                          No matching settings
                        </p>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <nav
                className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 pt-2"
                aria-label="Settings"
              >
                <p className="px-2 pb-1.5 pt-1 text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-500">
                  Settings
                </p>
                <div className="flex flex-col gap-0.5">
                  {SETTINGS_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeNavId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveNavId(item.id);
                          setPendingSectionId(null);
                          setSearchOpen(false);
                          setQuery("");
                        }}
                        className={[
                          "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left ui-t-colors",
                          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-violet-300",
                          isActive
                            ? "bg-neutral-200 text-neutral-950"
                            : "text-neutral-700 hover:bg-neutral-200/70 hover:text-neutral-950",
                        ].join(" ")}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon
                          className="h-4 w-4 shrink-0 text-neutral-600"
                          strokeWidth={1.75}
                        />
                        <span className="truncate text-body-md-secondary text-inherit">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </nav>
            </aside>

            <div className="relative flex min-w-0 flex-1 flex-col bg-[var(--background)]">
              <div className="flex shrink-0 items-start justify-between gap-4 px-8 pb-5 pt-6">
                <div className="min-w-0 max-w-xl">
                  {activeNavId === "usage" && usagePage === "logs" ? (
                    <button
                      type="button"
                      onClick={() => setUsagePage("overview")}
                      className="inline-flex items-center gap-1.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                      aria-label="Back to Usage"
                    >
                      <ChevronLeft
                        className="h-5 w-5 shrink-0 text-neutral-700"
                        strokeWidth={1.75}
                      />
                      <h2
                        id={titleId}
                        className="font-tiempos-headline text-[22px] leading-none tracking-[-0.015em] text-neutral-950"
                      >
                        Logs
                      </h2>
                    </button>
                  ) : activeNavId === "billing" && billingPage === "monthly-bills" ? (
                    <button
                      type="button"
                      onClick={() => setBillingPage("overview")}
                      className="inline-flex items-center gap-1.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                      aria-label="Back to Billing"
                    >
                      <ChevronLeft
                        className="h-5 w-5 shrink-0 text-neutral-700"
                        strokeWidth={1.75}
                      />
                      <h2
                        id={titleId}
                        className="font-tiempos-headline text-[22px] leading-none tracking-[-0.015em] text-neutral-950"
                      >
                        Total Monthly bill
                      </h2>
                    </button>
                  ) : activeNavId === "billing" && billingPage === "invoices" ? (
                    <button
                      type="button"
                      onClick={() => setBillingPage("overview")}
                      className="inline-flex items-center gap-1.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                      aria-label="Back to Billing"
                    >
                      <ChevronLeft
                        className="h-5 w-5 shrink-0 text-neutral-700"
                        strokeWidth={1.75}
                      />
                      <h2
                        id={titleId}
                        className="font-tiempos-headline text-[22px] leading-none tracking-[-0.015em] text-neutral-950"
                      >
                        Invoices
                      </h2>
                    </button>
                  ) : (
                    <h2
                      id={titleId}
                      className="font-tiempos-headline text-[22px] leading-none tracking-[-0.015em] text-neutral-950"
                    >
                      {activeLabel}
                    </h2>
                  )}
                  {activeNavId === "configuration" ? (
                    <p className="mt-3 text-body-md-secondary leading-6">
                      Workspace defaults and assistant behavior.
                    </p>
                  ) : activeNavId === "usage" && usagePage === "logs" ? (
                    <p className="mt-3 text-body-md-secondary leading-6">
                      Complete assistant activity log for the firm.
                    </p>
                  ) : activeNavId === "billing" && billingPage === "monthly-bills" ? (
                    <p className="mt-3 text-body-md-secondary leading-6">
                      Full monthly spend history with model-level breakdowns.
                    </p>
                  ) : activeNavId === "billing" && billingPage === "invoices" ? (
                    <p className="mt-3 text-body-md-secondary leading-6">
                      Complete invoice history for the firm.
                    </p>
                  ) : activeNavId === "billing" ? (
                    <p className="mt-3 text-body-md-secondary leading-6">
                      Plan, payment method, invoices and AI credit spend by model.
                    </p>
                  ) : activeNavId === "users" ? (
                    <p className="mt-3 text-body-md-secondary leading-6">
                      Per-user spend and monthly limits for the firm.
                    </p>
                  ) : activeNavId === "client-acquisition" ? (
                    <p className="mt-3 text-body-md-secondary leading-6">
                      Credits for client acquisition and related services.
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-200 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                  aria-label="Close settings"
                >
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-8">
                {activeNavId === "configuration" ? (
                  <div className="flex max-w-xl flex-col gap-12 pt-2">
                    <section ref={researchSectionRef} id="settings-section-research">
                      <h3 className="text-[16px] font-medium leading-6 text-neutral-950">
                        Research &amp; Analysis{" "}
                        <span className="font-normal text-neutral-500">(heavy tier)</span>
                      </h3>
                      <p className="mt-2.5 max-w-prose text-[13px] leading-6 text-neutral-600">
                        For deep case-law research, document intelligence, and extracting facts
                        from filings or discovery. Slower and higher cost.
                      </p>
                      <ModelSelect
                        label="Research and analysis model"
                        options={RESEARCH_MODELS}
                        value={researchModelId}
                        open={researchMenuOpen}
                        onOpenChange={(next) => {
                          setResearchMenuOpen(next);
                          if (next) setQuickMenuOpen(false);
                        }}
                        onChange={setResearchModelId}
                      />
                    </section>

                    <section
                      ref={quickTasksSectionRef}
                      id="settings-section-quick-tasks"
                      className="border-t border-neutral-200 pt-10"
                    >
                      <h3 className="text-[16px] font-medium leading-6 text-neutral-950">
                        Quick Tasks{" "}
                        <span className="font-normal text-neutral-500">(light tier)</span>
                      </h3>
                      <p className="mt-2.5 max-w-prose text-[13px] leading-6 text-neutral-600">
                        Faster, lower-cost model for everyday drafting, emails, and quick
                        answers.
                      </p>
                      <ModelSelect
                        label="Quick tasks model"
                        options={QUICK_MODELS}
                        value={quickModelId}
                        open={quickMenuOpen}
                        onOpenChange={(next) => {
                          setQuickMenuOpen(next);
                          if (next) setResearchMenuOpen(false);
                        }}
                        onChange={setQuickModelId}
                      />
                    </section>
                  </div>
                ) : activeNavId === "usage" && usagePage === "logs" ? (
                  <div className="pt-2">
                    <UsageLogsTable logs={USAGE_LOGS} />
                  </div>
                ) : activeNavId === "usage" ? (
                  <div className="flex flex-col gap-5 pt-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-[16px] font-medium leading-6 text-neutral-950">
                          Firm-wide Usage
                        </h3>
                        <p className="mt-1 max-w-prose text-[13px] leading-6 text-neutral-600">
                          Assistant activity for the current billing cycle.
                        </p>
                      </div>

                      <div ref={usageTimeframeRef} className="relative shrink-0">
                        <button
                          type="button"
                          aria-label="Usage timeframe"
                          aria-expanded={usageTimeframeMenuOpen}
                          aria-haspopup="listbox"
                          onClick={() => setUsageTimeframeMenuOpen((open) => !open)}
                          className={[
                            "inline-flex h-8 items-center justify-between gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 text-left",
                            "text-[12px] leading-4 text-neutral-800 ui-t-colors",
                            "hover:border-neutral-300 hover:bg-neutral-100",
                            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300",
                            usageTimeframeMenuOpen
                              ? "border-violet-300 ring-2 ring-violet-200/60"
                              : "",
                          ].join(" ")}
                        >
                          <span className="max-w-[9.5rem] truncate">
                            {selectedUsageTimeframe.label}
                          </span>
                          <ChevronDown
                            className={[
                              "h-3.5 w-3.5 shrink-0 text-neutral-600 transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
                              usageTimeframeMenuOpen ? "rotate-180" : "",
                            ].join(" ")}
                            strokeWidth={1.75}
                          />
                        </button>

                        <AnimatePresence>
                          {usageTimeframeMenuOpen ? (
                            <motion.div
                              key="usage-timeframe-menu"
                              role="listbox"
                              aria-label="Usage timeframe"
                              initial={
                                reduceMotion ? { opacity: 0 } : { opacity: 0, y: -2 }
                              }
                              animate={{ opacity: 1, y: 0 }}
                              exit={
                                reduceMotion ? { opacity: 0 } : { opacity: 0, y: -1 }
                              }
                              transition={searchMenuTransition}
                              className="absolute right-0 top-full z-20 mt-1.5 w-[190px] origin-top rounded-xl border border-neutral-200 bg-neutral-50 p-1 shadow-[var(--shadow-popup)]"
                            >
                              <div className="flex flex-col gap-0.5">
                                {USAGE_TIMEFRAMES.map((timeframe) => {
                                  const isSelected = timeframe.id === usageTimeframeId;
                                  return (
                                    <button
                                      key={timeframe.id}
                                      type="button"
                                      role="option"
                                      aria-selected={isSelected}
                                      onClick={() => {
                                        setUsageTimeframeId(timeframe.id);
                                        setUsageTimeframeMenuOpen(false);
                                      }}
                                      className={[
                                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] leading-4 ui-t-colors",
                                        isSelected
                                          ? "bg-neutral-200 text-neutral-950"
                                          : "text-neutral-700 hover:bg-neutral-200/70 hover:text-neutral-950",
                                      ].join(" ")}
                                    >
                                      <span className="min-w-0 flex-1 truncate">
                                        {timeframe.label}
                                      </span>
                                      {isSelected ? (
                                        <Check
                                          className="h-3.5 w-3.5 shrink-0 text-neutral-700"
                                          strokeWidth={2}
                                        />
                                      ) : null}
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 shadow-[var(--shadow-card)]">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[12px] font-medium leading-4 text-neutral-500">
                            Total credits
                          </p>
                          <button
                            type="button"
                            onClick={() => setBuyCreditsOpen(true)}
                            className="shrink-0 text-[12px] font-medium leading-4 text-violet-600 underline-offset-2 hover:text-violet-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                          >
                            Buy credits
                          </button>
                        </div>
                        <p className="mt-3 font-tiempos-text text-[28px] leading-none tracking-[-0.015em] text-neutral-950">
                          {formatCredits(usageCredits.total)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 shadow-[var(--shadow-card)]">
                        <p className="text-[12px] font-medium leading-4 text-neutral-500">
                          Credits used
                        </p>
                        <p className="mt-3 font-tiempos-text text-[28px] leading-none tracking-[-0.015em] text-neutral-950">
                          {formatCredits(usageCredits.used)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 shadow-[var(--shadow-card)]">
                        <p className="text-[12px] font-medium leading-4 text-neutral-500">
                          Credits remaining
                        </p>
                        <p className="mt-3 font-tiempos-text text-[28px] leading-none tracking-[-0.015em] text-neutral-950">
                          {formatCredits(usageCreditsRemaining)}
                        </p>
                      </div>
                    </div>

                    <section className="border-t border-neutral-200 pt-8">
                      <h3 className="text-[16px] font-medium leading-6 text-neutral-950">
                        System usage
                      </h3>
                      <p className="mt-1 max-w-prose text-[13px] leading-6 text-neutral-600">
                        Total consumption across the firm&apos;s workspace this cycle.
                      </p>
                      <div className="mt-5 flex flex-col gap-4">
                        {SYSTEM_USAGE_METRICS.map((metric) => (
                          <UsageProgressRow
                            key={metric.id}
                            label={metric.label}
                            used={metric.used}
                            total={metric.total}
                            unit={metric.unit}
                          />
                        ))}
                      </div>
                    </section>

                    <section className="border-t border-neutral-200 pt-8">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="text-[16px] font-medium leading-6 text-neutral-950">Logs</h3>
                        <button
                          type="button"
                          onClick={() => setUsagePage("logs")}
                          className="shrink-0 text-[12px] font-medium leading-4 text-violet-600 underline-offset-2 hover:text-violet-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                        >
                          View more
                        </button>
                      </div>
                      <UsageLogsTable logs={visibleUsageLogs} />
                    </section>
                  </div>
                ) : activeNavId === "billing" && billingPage === "monthly-bills" ? (
                  <div className="max-w-xl pt-2">
                    <MonthlyBillsList
                      bills={MONTHLY_BILLS}
                      expandedId={expandedMonthlyBillId}
                      onExpandedChange={setExpandedMonthlyBillId}
                      reduceMotion={reduceMotion}
                      transition={searchMenuTransition}
                    />
                  </div>
                ) : activeNavId === "billing" && billingPage === "invoices" ? (
                  <div className="pt-2">
                    <InvoicesTable invoices={INVOICES} onView={openInvoiceDialog} />
                  </div>
                ) : activeNavId === "billing" ? (
                  <div className="flex w-full flex-col gap-10 pt-2">
                    <div className="max-w-xl rounded-xl border border-neutral-200 bg-neutral-50 p-5 shadow-[var(--shadow-card)]">
                      <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-500">
                        Payment method
                      </p>
                      <p className="mt-2 font-tiempos-text text-[22px] leading-none tracking-[-0.015em] text-neutral-950">
                        Visa •••• 4471
                      </p>
                      <p className="mt-2 text-[13px] leading-5 text-neutral-600">
                        Next charge: Aug 20, 2026 · $1,240.00
                      </p>
                      <button
                        type="button"
                        onClick={() => setUpdateCardOpen(true)}
                        className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body-md text-neutral-950 ui-t-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                      >
                        Update card
                      </button>
                    </div>

                    <section className="max-w-xl">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="text-[16px] font-medium leading-6 text-neutral-950">
                          Total Monthly bill
                        </h3>
                        <button
                          type="button"
                          onClick={() => setBillingPage("monthly-bills")}
                          className="shrink-0 text-[12px] font-medium leading-4 text-violet-600 underline-offset-2 hover:text-violet-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                        >
                          View more
                        </button>
                      </div>
                      <MonthlyBillsList
                        bills={visibleMonthlyBills}
                        expandedId={expandedMonthlyBillId}
                        onExpandedChange={setExpandedMonthlyBillId}
                        reduceMotion={reduceMotion}
                        transition={searchMenuTransition}
                      />
                    </section>

                    <section>
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="text-[16px] font-medium leading-6 text-neutral-950">
                          Invoices
                        </h3>
                        <button
                          type="button"
                          onClick={() => setBillingPage("invoices")}
                          className="shrink-0 text-[12px] font-medium leading-4 text-violet-600 underline-offset-2 hover:text-violet-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                        >
                          View more
                        </button>
                      </div>
                      <InvoicesTable
                        invoices={visibleInvoices}
                        onView={openInvoiceDialog}
                      />
                    </section>
                  </div>
                ) : activeNavId === "users" ? (
                  <div className="pt-2">
                    <UsersTable users={firmUsers} onSetLimit={openSetLimit} />
                  </div>
                ) : activeNavId === "client-acquisition" ? (
                  <div className="flex w-full flex-col gap-10 pt-2">
                    <section>
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="text-[16px] font-medium leading-6 text-neutral-950">
                          Credits
                        </h3>
                        <button
                          type="button"
                          onClick={() => setBuyCreditsOpen(true)}
                          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-[var(--button-primary-bg)] px-3.5 text-body-md text-[var(--button-primary-fg)] hover:bg-[var(--button-primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                        >
                          Add credits
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 shadow-[var(--shadow-card)]">
                          <p className="text-[12px] font-medium leading-4 text-neutral-500">
                            Credits assigned
                          </p>
                          <p className="mt-3 font-tiempos-text text-[28px] leading-none tracking-[-0.015em] text-neutral-950">
                            {formatCredits(CLIENT_ACQUISITION_CREDITS.assigned)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 shadow-[var(--shadow-card)]">
                          <p className="text-[12px] font-medium leading-4 text-neutral-500">
                            Credits used
                          </p>
                          <p className="mt-3 font-tiempos-text text-[28px] leading-none tracking-[-0.015em] text-neutral-950">
                            {formatCredits(CLIENT_ACQUISITION_CREDITS.used)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 shadow-[var(--shadow-card)]">
                          <p className="text-[12px] font-medium leading-4 text-neutral-500">
                            Credits remaining
                          </p>
                          <p className="mt-3 font-tiempos-text text-[28px] leading-none tracking-[-0.015em] text-neutral-950">
                            {formatCredits(
                              CLIENT_ACQUISITION_CREDITS.assigned -
                                CLIENT_ACQUISITION_CREDITS.used,
                            )}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="border-t border-neutral-200 pt-8">
                      <h3 className="mb-4 text-[16px] font-medium leading-6 text-neutral-950">
                        Logs
                      </h3>
                      <ClientAcquisitionLogsTable logs={CLIENT_ACQUISITION_LOGS} />
                    </section>
                  </div>
                ) : null}
              </div>
            </div>

            <BuyCreditsDialog
              open={buyCreditsOpen}
              amount={buyCreditsAmount}
              onAmountChange={setBuyCreditsAmount}
              onClose={closeBuyCredits}
              onConfirm={confirmBuyCredits}
            />
            <UpdateCardDialog
              open={updateCardOpen}
              onClose={closeUpdateCard}
              onContinue={continueUpdateCard}
            />
            <InvoiceDetailDialog
              open={invoiceDialogOpen}
              invoice={selectedInvoice}
              onClose={closeInvoiceDialog}
            />
            <SetLimitDialog
              open={setLimitOpen}
              userName={limitUser?.name ?? "User"}
              limit={limitUser?.limit ?? USER_LIMIT_MIN}
              onClose={closeSetLimit}
              onSave={saveUserLimit}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
