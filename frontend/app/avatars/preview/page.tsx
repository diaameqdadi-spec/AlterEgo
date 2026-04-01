"use client";

import { useState } from "react";
import { getAvatarPresetById } from "@/lib/avatar-presets";
import { avatarAssetManifest } from "@/lib/avatar-asset-manifest";

function AssetCard({
  id,
  displayName,
  theme,
  finalAssetPath,
  status,
}: (typeof avatarAssetManifest)[number]) {
  const [hasImage, setHasImage] = useState(true);
  const preset = getAvatarPresetById(id);

  return (
    <article className="panel">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="eyebrow">Avatar Asset</p>
          <h2 className="display mt-2 text-2xl font-semibold">{displayName}</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/54">
          {status}
        </span>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[#0b1320] p-5">
        {hasImage ? (
          <img
            src={finalAssetPath}
            alt={`${displayName} asset preview`}
            className="mx-auto h-64 w-auto rounded-[24px] object-contain"
            onError={() => setHasImage(false)}
          />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-[24px] border border-dashed border-white/10">
            {preset.preview}
          </div>
        )}
      </div>

      <div className="mt-5 space-y-3 text-sm text-white/64">
        <p>{theme}</p>
        <p>
          Final path:
          <span className="ml-2 font-medium text-white/86">{finalAssetPath}</span>
        </p>
        {!hasImage ? (
          <p className="text-[#9ff8dd]">
            No final image found yet. Drop a PNG into this path and refresh.
          </p>
        ) : null}
      </div>
    </article>
  );
}

export default function AvatarPreviewPage() {
  return (
    <main className="space-y-6">
      <section className="panel">
        <p className="eyebrow">Internal Preview</p>
        <h1 className="display mt-3 text-4xl font-semibold">Robot asset review gallery</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62">
          This page is for internal asset review. As soon as you place a final PNG in
          <span className="mx-1 font-semibold text-white">frontend/public/assets/avatars/</span>
          it will appear here automatically. Until then, the current robot preset acts
          as a placeholder reference.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {avatarAssetManifest.map((asset) => (
          <AssetCard key={asset.id} {...asset} />
        ))}
      </section>
    </main>
  );
}
