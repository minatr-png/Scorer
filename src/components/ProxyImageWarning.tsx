"use client";

import { useState } from "react";
import { proxyUrl } from "@/lib/imageProxy";
import { AlertIcon } from "@/components/Icons";

/** Probes the image through the proxy and warns when its host blocks it (it would break in the tier list). */
export default function ProxyImageWarning({ url }: { url: string }) {
  const [blockedUrl, setBlockedUrl] = useState<string | null>(null);

  if (!/^https?:\/\//.test(url)) return null;

  return (
    <>
      <img src={proxyUrl(url)} alt="" hidden onError={() => setBlockedUrl(url)} />
      {blockedUrl === url && (
        <p className="mt-2 flex gap-2 rounded-xl bg-amber-50/80 border border-amber-200/80 px-3 py-2 text-xs text-amber-800">
          <AlertIcon size={14} className="shrink-0 mt-px" />
          This site blocks image sharing, so the picture won&apos;t show in the tier list or the PNG. Use Search to pick a cover instead.
        </p>
      )}
    </>
  );
}
