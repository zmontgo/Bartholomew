import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

export = {
  data: new SlashCommandBuilder()
    .setName("shoot")
    .setDescription("Shoots specified user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to shoot.")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const prob = getRandomInt(100);    

    if (prob == 99) {
      await interaction.reply(`_Shoots ${user} violently._`);
    } else {
      await interaction.reply(`Violence is never the answer. Do... do you need a hug?`);
    }
  }
};
