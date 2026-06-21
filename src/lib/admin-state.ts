import { createAdminAction, type AdminActionDraft } from "./work-room";

export type AdminSettings = {
  cameraIntervalSeconds: 5 | 7 | 10 | 15 | 30;
  globalAnnouncement: string;
  roomAnnouncements: Record<string, string>;
  pomodoroRunning: boolean;
  prioritizePopularRooms: boolean;
  disabledRooms: string[];
  actions: ReturnType<typeof createAdminAction>[];
};

const settings: AdminSettings = {
  cameraIntervalSeconds: 7,
  globalAnnouncement: "Welcome back to Kiitos Work Room.",
  roomAnnouncements: {},
  pomodoroRunning: true,
  prioritizePopularRooms: false,
  disabledRooms: [],
  actions: []
};

export function getAdminSettings() {
  return settings;
}

export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && password === expected;
}

export function updateAdminSettings(
  password: string,
  patch: Partial<Omit<AdminSettings, "actions">>,
  action?: AdminActionDraft,
  trusted = false
) {
  if (!trusted && !verifyAdminPassword(password)) {
    throw new Error("Invalid admin password");
  }

  Object.assign(settings, patch);

  if (action) {
    settings.actions.unshift(createAdminAction(action));
    settings.actions.splice(20);
  }

  return settings;
}
