function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function supabaseEnv() {
  return {
    url: requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    serviceRoleKey: requiredEnv("SUPABASE_SERVICE_ROLE_KEY")
  };
}

export function discordEnv() {
  return {
    token: requiredEnv("DISCORD_TOKEN"),
    clientId: requiredEnv("DISCORD_CLIENT_ID"),
    guildId: process.env.DISCORD_GUILD_ID
  };
}

export function youtubeEnv() {
  return {
    apiKey: requiredEnv("YOUTUBE_API_KEY"),
    liveChatId: requiredEnv("YOUTUBE_LIVE_CHAT_ID"),
    pollIntervalMs: Number(process.env.YOUTUBE_POLL_INTERVAL_MS ?? 5000)
  };
}
