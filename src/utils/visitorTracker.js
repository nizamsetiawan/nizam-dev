import { supabase } from "../supabase";

const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let os = "Lainnya";
  let device = "Desktop";
  let browser = "Browser";

  // Detect OS
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  // Detect Device
  if (/Mobi|Android/i.test(ua) && !/iPad|Tablet/i.test(ua)) {
    device = "Ponsel (Mobile)";
  } else if (/iPad|Tablet/i.test(ua) || (window.innerWidth >= 640 && window.innerWidth < 1024)) {
    device = "Tablet";
  } else {
    device = "Desktop";
  }

  // Detect Browser
  if (/Edg/i.test(ua)) browser = "Microsoft Edge";
  else if (/Chrome/i.test(ua)) browser = "Google Chrome";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Mozilla Firefox";
  else if (/Opera|OPR/i.test(ua)) browser = "Opera";

  return { os, device, browser };
};

export const recordVisitorLog = async (path = window.location.pathname) => {
  // Never log admin dashboard visits
  if (path.startsWith("/dashboard") || path.startsWith("/login")) {
    return;
  }

  // Prevent multiple rapid logs in the same second
  const lastLogTime = sessionStorage.getItem("last_visit_log_time");
  const now = Date.now();
  if (lastLogTime && now - parseInt(lastLogTime, 10) < 5000) {
    return;
  }
  sessionStorage.setItem("last_visit_log_time", now.toString());

  const { os, device, browser } = getDeviceInfo();
  const screen = `${window.screen.width}x${window.screen.height}`;
  const language = navigator.language || "id-ID";
  const referrer = document.referrer ? new URL(document.referrer).hostname : "Langsung (Direct)";
  const timestamp = new Date().toISOString();

  let ip = "127.0.0.1 (Lokal)";
  let location = "Indonesia";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const geo = await res.json();
      if (geo.ip) ip = geo.ip;
      if (geo.city && geo.country_name) {
        location = `${geo.city}, ${geo.country_name}`;
      } else if (geo.country_name) {
        location = geo.country_name;
      }
    }
  } catch {
    // Graceful fallback to default IP
  }

  const logEntry = {
    id: "log-" + now + "-" + Math.random().toString(36).slice(2, 6),
    ip,
    location,
    device,
    os,
    browser,
    screen,
    language,
    path,
    referrer,
    timestamp,
  };

  // 1. Save locally in localStorage
  try {
    const existing = JSON.parse(localStorage.getItem("portfolio_visitor_logs") || "[]");
    const updated = [logEntry, ...existing].slice(0, 300); // retain up to 300 recent records
    localStorage.setItem("portfolio_visitor_logs", JSON.stringify(updated));
    window.dispatchEvent(new Event("visitorLogsUpdated"));
  } catch (e) {
    console.warn("Gagal menyimpan log pengunjung lokal:", e);
  }

  // 2. Try Supabase table if available
  try {
    await supabase.from("visitor_logs").insert([logEntry]);
  } catch {
    // Silent fallback
  }

  return logEntry;
};

export const getVisitorLogs = async () => {
  let localLogs = [];
  try {
    localLogs = JSON.parse(localStorage.getItem("portfolio_visitor_logs") || "[]");
  } catch {
    localLogs = [];
  }

  try {
    const { data } = await supabase
      .from("visitor_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(200);

    if (data && data.length > 0) {
      // Merge unique by id
      const ids = new Set(data.map((d) => d.id));
      const filteredLocal = localLogs.filter((l) => !ids.has(l.id));
      return [...data, ...filteredLocal].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
    }
  } catch {
    // Return local logs
  }

  return localLogs;
};

export const clearVisitorLogs = async () => {
  localStorage.removeItem("portfolio_visitor_logs");
  window.dispatchEvent(new Event("visitorLogsUpdated"));

  try {
    await supabase.from("visitor_logs").delete().neq("id", "0");
  } catch {
    // Ignore
  }
};
