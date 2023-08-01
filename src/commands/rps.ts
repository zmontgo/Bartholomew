import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

const rockEmoji = "🪨";
const paperEmoji = "📄";
const scissorsEmoji = "✂️";

export = {
  data: new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Starts a rock paper scissors game.")
    .addStringOption((option) =>
      option
        .setName("choice")
        .setDescription("Your choice.")
        .setRequired(true)
        .addChoices(
          { name: rockEmoji, value: "rock" },
          { name: paperEmoji, value: "paper" },
          { name: scissorsEmoji, value: "scissors" }
        )
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild || !interaction.channel) return await interaction.reply("This command can only be used in a server.");
    try {
      // Every three seconds, the bot will send a message to the channel.
      // Use the typing indicator to show that the bot is still working.
      await interaction.deferReply({ ephemeral: true });
      await interaction.channel.sendTyping();

      // Get the user's choice.
      const choice = interaction.options.getString("choice") as "rock" | "paper" | "scissors";

      // Get the bot's choice.
      const botChoice = ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)];

      await interaction.editReply(`Rock...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      await interaction.editReply(`Paper...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      await interaction.editReply(`Scissors...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Compare the choices.
      if (choice === botChoice) {
        await interaction.editReply(`I chose ${botChoice}! It's a tie!`);
      } else if ((choice === "rock" && botChoice === "scissors") || (choice === "paper" && botChoice === "rock") || (choice === "scissors" && botChoice === "paper")) {
        await interaction.editReply(`I chose ${botChoice}! You win!`);
      } else {
        await interaction.editReply(`I chose ${botChoice}! You lose!`);
      }
    } catch (err) {
      console.log(err);
    }
  }
};
