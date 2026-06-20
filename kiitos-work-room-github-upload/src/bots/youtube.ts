import { google } from "googleapis";
import { youtubeEnv } from "../lib/env";
import { enterRoom, getUserStatus, leaveRoom } from "../lib/sessions";

const { apiKey, liveChatId, pollIntervalMs } = youtubeEnv();
const youtube = google.youtube({ version: "v3", auth: apiKey });

let nextPageToken: string | undefined;
let currentPollIntervalMs = pollIntervalMs;

console.log("YouTube live chat bot is starting.");

async function poll() {
  try {
    const response = await youtube.liveChatMessages.list({
      liveChatId,
      part: ["snippet", "authorDetails"],
      pageToken: nextPageToken
    });

    nextPageToken = response.data.nextPageToken ?? undefined;
    currentPollIntervalMs = response.data.pollingIntervalMillis ?? pollIntervalMs;

    for (const item of response.data.items ?? []) {
      await handleMessage(item);
    }
  } catch (error) {
    console.error("YouTube polling failed:", error);
  } finally {
    setTimeout(poll, currentPollIntervalMs);
  }
}

async function handleMessage(message: {
  snippet?: { displayMessage?: string | null };
  authorDetails?: { channelId?: string | null; displayName?: string | null };
}) {
  const text = message.snippet?.displayMessage?.trim();
  const channelId = message.authorDetails?.channelId;

  if (!text || !channelId) {
    return;
  }

  const displayName = message.authorDetails?.displayName ?? "YouTube User";
  const user = {
    platform: "youtube" as const,
    platformUserId: channelId,
    displayName
  };

  if (text.startsWith("!in ")) {
    const roomName = text.replace(/^!in\s+/, "").trim();
    const result = await enterRoom(user, roomName);
    console.log(`[youtube] ${displayName}: ${result}`);
    return;
  }

  if (text === "!out") {
    const result = await leaveRoom(user);
    console.log(`[youtube] ${displayName}: ${result}`);
    return;
  }

  if (text === "!status") {
    const result = await getUserStatus(user.platform, user.platformUserId);
    console.log(`[youtube] ${displayName}: ${result}`);
  }
}

poll();
