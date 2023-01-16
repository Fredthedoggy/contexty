import {SlashCommandBuilder} from '@discordjs/builders'
import contextyCommands, {ContextyCommand} from "./contextyCommands.js";
import {CommandInteraction, EmbedBuilder} from "discord.js";

const HelpCommand: ContextyCommand =  {
    discordCommand: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List of Commands')
    ,
    guildOnly: false,
    execute: async (command: CommandInteraction) => {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Help')
            .setDescription(`
            **Commands**
            ${contextyCommands.map((command) => {
                return `</${command.discordCommand.name}:${command.data.id}> • \`${command.discordCommand.description}\``;
            }).join("\n")}
            `)
            .setTimestamp();
        await command.reply({embeds: [embed]});
    }
}

export default HelpCommand
