import { REST, Collection, Routes, type ChatInputCommandInteraction } from 'discord.js'
import fs from 'fs'
import path from 'path'

const commands: any[] = []
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands/')).filter(file => file.endsWith('.js'))

export const deployAppCommands = async (client) => {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!)
  client.commands = new Collection()

  for (const file of commandFiles) {
    const filePath = path.join(__dirname, '../commands/', file)
    const command = require(filePath)

    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON())
      client.commands.set(command.data.name, {
        config: command.config,
        data: command.data,
        async execute (interaction: ChatInputCommandInteraction) {
          try {
            await command.execute(interaction)
          } catch (error: any) {

            // Check if the interaction has already been replied to - likely meaning that the error has already been handled
            if (interaction.replied) {
              return
            }

            // Code 40060: Interaction has already been acknowledged
            if (error.code === 40060) {
              console.warn(`[WARNING] The interaction with ID ${interaction.id} has already been acknowledged.`)
              return
            }

            console.error(error)

            await interaction.reply({ content: 'Looks like the bot is having some issues right now. Please try again later.', ephemeral: true })
          }
        }
      })
    } else {
      console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
    }
  }

  try {
    if (process.env.TEST_GUILD_ID === undefined) {
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID!),
        { body: commands }
      )
    } else {
      console.warn(`[WARNING] The bot is not in production mode. The commands will only be deployed to the guild with ID ${process.env.TEST_GUILD_ID}.`)

      try {
        await rest.put(
          Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.TEST_GUILD_ID!),
          { body: commands }
        )
      } catch (error: any) {
        // APPLICATION_COMMAND_PERMISSIONS_UPDATE
        if (error.code === 50001) {
          return console.warn(`[WARNING] The bot does not have permission to manage slash commands in the guild with ID ${process.env.TEST_GUILD_ID}.`)
        }

        // APPLICATION_COMMANDS_DUPLICATE_NAME
        if (error.code === 50041) {
          return console.warn(`[WARNING] The bot has a duplicate command name in the guild with ID ${process.env.TEST_GUILD_ID}.`)
        }

        console.error(error)
      }
    }
  } catch (error: any) {
    console.error(error)
  }
}
