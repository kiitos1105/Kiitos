import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

const hasDiscordOAuth = Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret:
    process.env.NEXTAUTH_SECRET ??
    process.env.AUTH_SECRET ??
    "kiitos-development-secret-set-nextauth-secret-on-vercel",
  providers: hasDiscordOAuth
    ? [
        Discord({
          clientId: process.env.DISCORD_CLIENT_ID,
          clientSecret: process.env.DISCORD_CLIENT_SECRET,
          authorization: { params: { scope: "identify email" } }
        })
      ]
    : [],
  pages: {
    error: "/auth/error",
    signIn: "/auth/error"
  },
  callbacks: {
    jwt({ token, profile }) {
      if (profile) {
        token.discordId = profile.id;
        token.discordName = profile.global_name ?? profile.username ?? token.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.discordId ?? token.sub ?? "");
        session.user.name = String(token.discordName ?? token.name ?? session.user.name ?? "");
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      return `${baseUrl}/lobby`;
    }
  }
});
