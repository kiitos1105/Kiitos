export type AppStage = "beta" | "production";

export function getAppStage(): AppStage {
  return process.env.NEXT_PUBLIC_APP_STAGE === "production" ? "production" : "beta";
}

export function isBetaStage() {
  return getAppStage() === "beta";
}

export function isPremiumUiEnabled() {
  return getAppStage() === "production";
}
