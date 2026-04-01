export type AvatarAssetRecord = {
  id: string;
  displayName: string;
  theme: string;
  finalAssetPath: string;
  status: "planned" | "selected" | "implemented";
};

export const avatarAssetManifest: AvatarAssetRecord[] = [
  {
    id: "nova",
    displayName: "Nova",
    theme: "blue-cyan premium futurist",
    finalAssetPath: "/assets/avatars/nova.png",
    status: "planned",
  },
  {
    id: "pulse",
    displayName: "Pulse",
    theme: "violet electric social-tech",
    finalAssetPath: "/assets/avatars/pulse.png",
    status: "planned",
  },
  {
    id: "sage",
    displayName: "Sage",
    theme: "green mentor calm",
    finalAssetPath: "/assets/avatars/sage.png",
    status: "planned",
  },
  {
    id: "onyx",
    displayName: "Onyx",
    theme: "black gunmetal premium",
    finalAssetPath: "/assets/avatars/onyx.png",
    status: "planned",
  },
  {
    id: "sentinel",
    displayName: "Sentinel",
    theme: "tactical amber guardian",
    finalAssetPath: "/assets/avatars/sentinel.png",
    status: "planned",
  },
  {
    id: "oracle",
    displayName: "Oracle",
    theme: "silver ice-blue strategist",
    finalAssetPath: "/assets/avatars/oracle.png",
    status: "planned",
  },
];
