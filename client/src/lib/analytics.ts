type AnalyticsConfig = {
  endpoint?: string;
  websiteId?: string;
};

const stripTrailingSlash = (url: string) => url.replace(/\/+$/, "");

export const bootAnalytics = ({ endpoint, websiteId }: AnalyticsConfig) => {
  if (typeof document === "undefined") return;

  const safeEndpoint = endpoint?.trim();
  const safeWebsiteId = websiteId?.trim();

  if (!safeEndpoint || !safeWebsiteId) {
    return;
  }

  const scriptId = "analytics-script";

  if (document.getElementById(scriptId)) {
    return;
  }

  const script = document.createElement("script");
  script.id = scriptId;
  script.async = true;
  script.defer = true;
  script.dataset.websiteId = safeWebsiteId;
  script.src = `${stripTrailingSlash(safeEndpoint)}/umami.js`;

  document.body.appendChild(script);
};
