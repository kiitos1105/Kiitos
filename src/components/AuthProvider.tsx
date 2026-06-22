"use client";

import { SessionProvider, useSession } from "next-auth/react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { getUserProfile, saveUserProfile } from "@/lib/badges-client";

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthLocalSync />
      {children}
    </SessionProvider>
  );
}

function AuthLocalSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id || !session.user.name) {
      return;
    }

    const discordUser = {
      id: session.user.id,
      name: session.user.name,
      avatarUrl: session.user.image ?? "https://cdn.discordapp.com/embed/avatars/0.png"
    };
    window.localStorage.setItem("kiitos:discord-demo-user", JSON.stringify(discordUser));
    saveUserProfile({
      ...getUserProfile(),
      user_id: discordUser.id,
      avatar_url: discordUser.avatarUrl
    });
  }, [session?.user?.id, session?.user?.image, session?.user?.name]);

  return null;
}
