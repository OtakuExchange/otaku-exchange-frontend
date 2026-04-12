import ReactGA from "react-ga4";

type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

export type AnalyticsSource =
  | "event_card"
  | "portfolio_row"
  | "user_portfolio_row"
  | "history_card"
  | "direct"
  | "event_view";

export type AnalyticsEventName =
  | "event_opened"
  | "bookmark_toggled"
  | "stake_placed"
  | "stake_failed"
  | "pool_selected"
  | "history_filter_changed";

let enabled = false;
let initialized = false;

export function initAnalytics() {
  console.log("Initializing analytics...");
  if (initialized) return;
  initialized = true;

  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID as
    | string
    | undefined;
  enabled = Boolean(measurementId);
  console.log("Analytics enabled:", enabled);
  if (!enabled || !measurementId) return;
  console.log("Initializing analytics with measurement ID:", measurementId);
  ReactGA.initialize(measurementId);
}

export function isAnalyticsEnabled() {
  return enabled;
}

export function trackPageView({
  path,
  title,
}: {
  path: string;
  title?: string;
}) {
  if (!enabled) return;
  ReactGA.send({
    hitType: "pageview",
    page: path,
    title,
  });
}

export function trackEvent(
  name: AnalyticsEventName,
  params?: Record<string, Json>,
) {
  if (!enabled) return;
  ReactGA.event(name, params);
}

