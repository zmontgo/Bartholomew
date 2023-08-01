// Get the afk Table stored in the MongoDB database
import { prisma } from "../utils/database";
import { SlashCommandBuilder } from 'discord.js'
import type { ChatInputCommandInteraction } from 'discord.js'

export = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set yourself as AFK')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to display when someone mentions you')
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const afkMessage = interaction.options.getString('message') ?? 'They didn\'t tell us where they went...'
    const sender = interaction.user

    let result = await prisma.afks.findUnique({ where: { user: sender.id } });

    if (result === null) {
      const afkObject = {
        message: afkMessage,
        user: sender.id,
        cooldown: Date.now(),
        date: Date.now(),
      };

      await prisma.afks.create({ data: afkObject });

      try {
        await interaction.reply(`I have marked you as AFK, <@${sender.id}>. Anyone who pings you will be notified you are away.\n\`\`\`AFK Message: ${afkMessage}\`\`\``)
      } catch (err) {
        console.log(err);
      }
    } else {
      await prisma.afks.delete({ where: { user: sender.id } });

      await interaction.reply(`Welcome back, <@${sender.id}>! I have removed your AFK status.`)
    }
  },
};
