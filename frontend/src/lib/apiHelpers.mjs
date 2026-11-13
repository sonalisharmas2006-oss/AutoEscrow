export function normalizeApiBaseUrl(rawValue) {
  const source = String(rawValue ?? "").trim();
  if (!source) {
    return "https://autoescrow-api-zaa0.onrender.com/api/v1";
  }

  const normalized = source.replace(/\/+$/, "");
  if (normalized.endsWith("/api/v1")) {
    return normalized;
  }

  return `${normalized}/api/v1`;
}

export function normalizeApiRequestPath(path, apiBaseUrl) {
  const base = normalizeApiBaseUrl(apiBaseUrl);
  if (!path) {
    return base;
  }

  if (/^https?:\/\//.test(path)) {
    return path;
  }

  const trimmed = path.startsWith("/api/v1") ? path.slice("/api/v1".length) : path;
  const suffix = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${suffix}`;
}

export function parseJsonResponse(rawText, contentType) {
  if (!rawText) {
    return null;
  }

  const trimmed = rawText.trim();
  if (!trimmed) {
    return null;
  }

  const looksLikeJson = (contentType || "").includes("application/json") || trimmed.startsWith("{") || trimmed.startsWith("[");
  if (!looksLikeJson) {
    return rawText;
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("AutoEscrow API payload was not valid JSON:", { contentType, error });
    }
    return rawText;
  }
}

export function isUnexpectedApiPayload(payload, contentType) {
  if (typeof payload !== "string") {
    return false;
  }

  return !(contentType || "").includes("application/json") || /<html|<!doctype/i.test(payload);
}

export function summarizeApiFailure(status, contentType, payload, url) {
  const extractMessage = (value) => {
    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((entry) => extractMessage(entry)).filter(Boolean).join("; ");
    }

    if (value && typeof value === "object") {
      if ("message" in value && typeof value.message === "string") {
        return value.message;
      }

      if ("detail" in value) {
        return extractMessage(value.detail);
      }

      if ("error" in value) {
        return extractMessage(value.error);
      }

      return JSON.stringify(value);
    }

    return String(value ?? "");
  };

  if (typeof payload === "string") {
    const text = payload.trim();
    if (!text) {
      return status === 401 ? "Your session is no longer valid. Please reconnect your wallet." : "The API returned an empty response.";
    }

    if ((contentType || "").includes("text/html") || /<html|<!doctype/i.test(text)) {
      return `The backend returned HTML instead of JSON at ${url}. This is usually caused by a wrong API base URL or an upstream proxy. Please retry after checking the backend origin.`;
    }

    return text.length > 220 ? `${text.slice(0, 220)}…` : text;
  }

  if (payload && typeof payload === "object") {
    const message = extractMessage(payload);
    if (message && message !== "[object Object]") {
      return message;
    }
  }

  if (status === 401) {
    return "Your session is no longer valid. Please reconnect your wallet.";
  }

  if (status === 404) {
    return "The requested V2 route was not found on the backend.";
  }

  if (status >= 500) {
    return "The backend returned a server error. Please retry or contact support.";
  }

  return "The AutoEscrow API request failed.";
}
