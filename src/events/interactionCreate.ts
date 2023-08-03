import config from "../config"

export = async (client, interaction) => {
  try {
    if (interaction.isCommand()) {
      const command = interaction.client.commands.get(interaction.commandName)

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`)
        return
      }

      try {
        if (interaction.channel?.id === config.channels.counting && (!command.config || !command.config.counting)) {
          await interaction.reply({ content: 'This command cannot be used in the counting channel.', ephemeral: true })
          return  
        }

        await command.execute(interaction)
      } catch (error: any) {
        console.error(error)

        // Check if the command has been responded to already
        if (interaction.replied) {
          await interaction.followUp({ content: 'A fatal error occured while executing the command.', ephemeral: true })
        } else {
          await interaction.reply({ content: 'A fatal error occured while executing the command.', ephemeral: true })
        }
      }
    } else if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName)

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`)
        return
      }

      try {
        await command.autocomplete(interaction)
      } catch (error: any) {
        console.error(error)

        // Check if the command has been responded to already
        if (interaction.replied) {
          await interaction.followUp({ content: 'A fatal error occured while executing the command.', ephemeral: true })
        } else {
          await interaction.reply({ content: 'A fatal error occured while executing the command.', ephemeral: true })
        }
      }
    }
  } catch (error: any) {
    console.error(error)
  }
}
