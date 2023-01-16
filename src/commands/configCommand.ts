import {ContextyCommand} from "./contextyCommands.js";
import {SlashCommandBuilder} from "@discordjs/builders";
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
} from "discord.js";
import {DatabaseManager} from "../index.js";

const ConfigCommand: ContextyCommand = {
    discordCommand: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Change the Contexty\'s configuration')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommandGroup => subcommandGroup
            .setName('mode')
            .setDescription('Change Contexty\'s mode')
            .addStringOption(option =>
                option.setName('mode')
                    .setDescription('Contexty\'s mode')
                    .setRequired(true)
                    .addChoices(
                        {name: 'Simple', value: 'disable'},
                        {name: 'Verbose', value: 'enable'},
                    ))
        )
        .addSubcommand(subcommandGroup => subcommandGroup
            .setName('images')
            .setDescription('Enable Contexty previewing images')
            .addStringOption(option =>
                option.setName('images')
                    .setDescription('Enable Contexty previewing images')
                    .setRequired(true)
                    .addChoices(
                        {name: 'Enable', value: 'enable'},
                        {name: 'Disable', value: 'disable'},
                    ))
        )
        .addSubcommand(subcommandGroup => subcommandGroup
            .setName('stickers')
            .setDescription('Enable Contexty previewing stickers')
            .addStringOption(option =>
                option.setName('stickers')
                    .setDescription('Enable Contexty previewing stickers')
                    .setRequired(true)
                    .addChoices(
                        {name: 'Enable', value: 'enable'},
                        {name: 'Disable', value: 'disable'},
                    ))
        )
        .addSubcommand(subcommandGroup => subcommandGroup
            .setName('attachments')
            .setDescription('Enable Contexty previewing attachments')
            .addStringOption(option =>
                option.setName('attachments')
                    .setDescription('Enable Contexty previewing attachments')
                    .setRequired(true)
                    .addChoices(
                        {name: 'Enable', value: 'enable'},
                        {name: 'Disable', value: 'disable'},
                    ))
        )
        .addSubcommand(subcommandGroup => subcommandGroup
            .setName('embeds')
            .setDescription('Enable Contexty previewing embeds')
            .addStringOption(option =>
                option.setName('embeds')
                    .setDescription('Enable Contexty previewing embeds')
                    .setRequired(true)
                    .addChoices(
                        {name: 'Enable', value: 'enable'},
                        {name: 'Disable', value: 'disable'},
                    ))
        )
        .addSubcommand(subcommandGroup => subcommandGroup
            .setName('removal')
            .setDescription('Let members remove their own context to linked messages')
            .addStringOption(option =>
                option.setName('removal')
                    .setDescription('Let members remove their own context to linked messages')
                    .setRequired(true)
                    .addChoices(
                        {name: 'Enable', value: 'enable'},
                        {name: 'Disable', value: 'disable'},
                    ))
        )
        .addSubcommand(subcommandGroup => subcommandGroup
            .setName('delete')
            .setDescription('Deletes messages that are just links, once previewed')
            .addStringOption(option =>
                option.setName('delete')
                    .setDescription('Deletes messages that are just links, once previewed')
                    .setRequired(true)
                    .addChoices(
                        {name: 'Enable', value: 'enable'},
                        {name: 'Disable', value: 'disable'},
                    ))
        )
        .addSubcommand(subcommandGroup => subcommandGroup
            .setName('view')
            .setDescription('View the current config')
        ),
    guildOnly: true,
    execute: async (command: ChatInputCommandInteraction) => {
        switch (command.options.getSubcommand()) {
            case "view": {
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Config')
                    .setDescription(`
            **Config** 
            \`mode\` • Should context be simple or verbose? (\`${DatabaseManager.getServerConfig(command.guildId).verbose ? "Verbose" : "Simple"}\`)
            \`images\` • Should context preview images? (\`${DatabaseManager.getServerConfig(command.guildId).images ? "Enabled" : "Disabled"}\`)
            \`stickers\` • Should context preview stickers? (\`${DatabaseManager.getServerConfig(command.guildId).stickers ? "Enabled" : "Disabled"}\`)
            \`attachments\` • Should context preview attachments? (\`${DatabaseManager.getServerConfig(command.guildId).attachments ? "Enabled" : "Disabled"}\`)
            \`embeds\` • Should context preview embeds? (\`${DatabaseManager.getServerConfig(command.guildId).embeds ? "Enabled" : "Disabled"}\`)
            \`removal\` • Should Contexty let members remove their own context to linked messages? (\`${DatabaseManager.getServerConfig(command.guildId).removal ? "Enabled" : "Disabled"}\`)
            \`delete\` • Should Contexty delete the original message when it's just a link? (\`${DatabaseManager.getServerConfig(command.guildId).delete ? "Enabled" : "Disabled"}\`)
            `)
                    .setTimestamp();
                await command.reply({embeds: [embed]});
                break;
            }
            case "mode":
            case "images":
            case "stickers":
            case "attachments":
            case "embeds":
            case "removal":
            case "delete": {
                const setting = command.options.getString(command.options.getSubcommand()) === "enable";
                const oldSetting = DatabaseManager.getServerConfig(command.guildId)[command.options.getSubcommand()];
                DatabaseManager.changeServerConfig(command.guildId, {[command.options.getSubcommand() === "mode" ? "verbose" : command.options.getSubcommand()]: setting});
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Config')
                    .setDescription(`
            **Config**
            \`${command.options.getSubcommand()}\` • Changed from \`${command.options.getSubcommand() === "mode" ? `${oldSetting ? "Verbose" : "Simple"}\` to \`${setting ? "Verbose" : "Simple"}` : `${oldSetting ? "Enabled" : "Disabled"}\` to \`${setting ? "Enabled" : "Disabled"}`}\`
            `)
                    .setTimestamp();
                await command.reply({embeds: [embed]});
                break;
            }
        }
    }
}

export default ConfigCommand;
