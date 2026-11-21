/**
 * Realtime sync utility across browser tabs and components.
 * Combines BroadcastChannel API (0ms latency cross-tab) and window Events.
 */
export const broadcastRealtimeEvent = (type, data = null) => {
  if (typeof BroadcastChannel !== "undefined") {
    try {
      const bc = new BroadcastChannel("portfolio_realtime_sync");
      bc.postMessage({ type, data });
      bc.close();
    } catch (e) {
      // Ignore broadcast channel errors in unsupported environments
    }
  }

  if (type === "CONFIG_UPDATED") {
    window.dispatchEvent(new Event("portfolioConfigUpdated"));
  } else {
    window.dispatchEvent(new Event("portfolioDataUpdated"));
  }
};
