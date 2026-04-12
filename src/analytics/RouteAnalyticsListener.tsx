import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "./ga4";

export function RouteAnalyticsListener() {
  const location = useLocation();

  useEffect(() => {
    trackPageView({
      path: `${location.pathname}${location.search}`,
      title: document.title,
    });
  }, [location.pathname, location.search]);

  return null;
}

