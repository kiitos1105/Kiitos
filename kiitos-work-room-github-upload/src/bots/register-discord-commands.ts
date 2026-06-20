import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { discordEnv } from "../lib/env";
import { roomChoices } from "../lib/rooms";

const { token, clientId, guildId } = discordEnv();

const commands = [
  new SlashCommandBuilder()
    .setName("in")
    .setDescription("Kiitos Work Room に入室します")
    .addStringOption((option) =>
      option
        .setName("room")
        .setDescription("入室する部屋")
        .setRequired(true)
        .addChoices(...roomChoices())
    ),
  new SlashCommandBuilder().setName("out").setDescription("Kiitos Work Room から退室します"),
  new SlashCommandBuilder().setName("status").setDescription("現在の入室状況を確認します")
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(token);

if (guildId) {
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
  console.log(`Registered ${commands.length} guild commands.`);
} else {
  await rest.put(Routes.applicationCommands(clientId), { body: commands });
  console.log(`Registered ${commands.length} global commands.`);
}
