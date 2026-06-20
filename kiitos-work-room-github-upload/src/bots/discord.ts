import {
  ChatInputCommandInteraction,
  Client,
  Events,
  GatewayIntentBits,
  Interaction
} from "discord.js";
import { discordEnv } from "../lib/env";
import { enterRoom, getUserStatus, leaveRoom } from "../lib/sessions";

const { token } = discordEnv();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Discord bot is ready: ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  try {
    const message = await handleCommand(interaction);
    await interaction.reply({ content: message, ephemeral: true });
  } catch (error) {
    console.error(error);
    const message = "処理中にエラーが発生しました。設定とDB接続を確認してください。";

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: message, ephemeral: true });
    } else {
      await interaction.reply({ content: message, ephemeral: true });
    }
  }
});

async function handleCommand(interaction: ChatInputCommandInteraction): Promise<string> {
  const user = {
    platform: "discord" as const,
    platformUserId: interaction.user.id,
    displayName: interaction.user.globalName ?? interaction.user.username
  };

  if (interaction.commandName === "in") {
    const roomName = interaction.options.getString("room", true);
    return enterRoom(user, roomName);
  }

  if (interaction.commandName === "out") {
    return leaveRoom(user);
  }

  if (interaction.commandName === "status") {
    return getUserStatus(user.platform, user.platformUserId);
  }

  return "未対応のコマンドです。";
}

client.login(token);
