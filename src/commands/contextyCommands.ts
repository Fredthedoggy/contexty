import {SlashCommandBuilder} from '@discordjs/builders'
import {CommandInteraction, SlashCommandSubcommandsOnlyBuilder} from "discord.js";
import helpCommand from "./helpCommand.js";
import configCommand from "./configCommand.js";
import aboutCommand from "./aboutCommand.js";

export interface ContextyCommand {
    discordCommand: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute: (command: CommandInteraction) => Promise<void>;
    guildOnly: boolean;
    data?: {
        id: string;
    }
}

const Commands = [helpCommand, aboutCommand, configCommand];

export default Commands;
