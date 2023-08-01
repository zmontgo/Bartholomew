import { EmbedBuilder } from "discord.js";
import config from "../config";
import { SlashCommandBuilder } from 'discord.js'
import type { ChatInputCommandInteraction } from 'discord.js'

const version = config.version;
const versioninfo = config.versioninfo;

export = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Get information about Bartholomew'),
  async execute(interaction: ChatInputCommandInteraction) {
    const infoMessage = new EmbedBuilder()
      .setColor(config.colors.embedColor)
      .setTitle("Bartholomew")
      .setThumbnail(
        "https://images-ext-1.discordapp.net/external/2soj2X2BPQkQsH-kOk_5GmgL9_KUvGcNdd2fcN1s7jo/%3Fsize%3D256/https/cdn.discordapp.com/avatars/693840044032786444/b2598077df8a48b63c9da434ba33aab2.png"
      );
    infoMessage.addFields(
      { name: "Version", value: version, inline: false },
      { name: "Version Info", value: versioninfo, inline: false },
      { name: "Description", value: "A helpful guy here to add some personality to the server and help with various tasks!", inline: false},
      { name: "GitHub", value: "Want to help us develop Bartholomew? Check out the repo on GitHub! https://github.com/zmontgo/Bartholomew", inline: false}
    );
    
    return await interaction.reply({ embeds: [infoMessage] });
  },
};
