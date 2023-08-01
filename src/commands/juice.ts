import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

export = {
  data: new SlashCommandBuilder()
    .setName("juice")
    .setDescription(
      "I will choose either :beverage_box: or :fox:. (My version of Russian Roulette)"
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    return await interaction.reply(
      Math.random() < 0.5 ? ":beverage_box:" : ":fox:"
    );
  },
};

