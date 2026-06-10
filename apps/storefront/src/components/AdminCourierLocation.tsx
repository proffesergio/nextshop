"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isValidCoordinates, type CourierLocation } from "@nextshop/commerce-core";

/** Owner/courier pushes a GPS fix for a shipped order. */
export function AdminCourierLocation({ orderId, current }: { orderId: string; current?: CourierLocation }) {
  const router = useRouter();
  const [lat, setLat] = useState(current ? String(current.lat) : "");
  const [lng, setLng] = useState(current ? String(current.lng) : "");
  const [busy, setBusy] = useState(false);

  async function setLocation() {
    const nLat = Number(lat);
    const nLng = Number(lng);
    if (lat.trim() === "" || lng.trim() === "" || !isValidCoordinates(nLat, nLng)) return;
    setBusy(true);
    await fetch(`/api/admin/orders/${orderId}/location`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat: nLat, lng: nLng }),
    });
    setBusy(false);
    router.refresh();
  }

  const input: React.CSSProperties = { width: 90 };

  return (
    <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
      <input aria-label="Latitude" style={input} value={lat} onChange={(e) => setLat(e.target.value)} placeholder="lat" />
      <input aria-label="Longitude" style={input} value={lng} onChange={(e) => setLng(e.target.value)} placeholder="lng" />
      <button type="button" onClick={setLocation} disabled={busy}>
        Set GPS
      </button>
    </span>
  );
}
