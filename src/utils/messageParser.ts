import {isDevelopment} from "./main.js";
import {Channel, ChannelType, Guild, Message, TextChannel} from "discord.js";
import {ContextyClient} from "../index.js";

export function messageParser(content: string): [string, string, string, boolean] | [undefined, undefined, undefined, undefined] {
    const link = /(https?:\/\/)?([a-zA-Z0-9]{1,12}\.){0,2}discord.com\/channels\/([0-9]{16,21})\/([0-9]{16,21})\/([0-9]{16,21})\/?/gi
    const match = link.exec(content);
    if (!match) {
        if (isDevelopment()) {
            console.log("No match: " + content);
        }
        return [undefined, undefined, undefined, undefined];
    }
    if (match.length < 4) {
        if (isDevelopment()) {
            console.log("Match length < 4: " + content);
        }
        return [undefined, undefined, undefined, undefined];
    }
    const guildId = match[3];
    const channelId = match[4];
    const messageId = match[5];
    if (isDevelopment()) {
        console.log("Found link: " + content);
    }
    return [guildId, channelId, messageId, content === match[0]];
}

export async function getGuild(guildId: string): Promise<Guild | undefined> {
    return ContextyClient.guilds.cache.get(guildId) ?? await ContextyClient.guilds.fetch(guildId);
}

export async function getChannel(channelId: string): Promise<Channel | undefined> {
    return ContextyClient.channels.cache.get(channelId) ?? await ContextyClient.channels.fetch(channelId);
}

export async function getMessage(messageId: string, channel: Channel): Promise<Message | undefined> {
    switch (channel.type) {
        case ChannelType.GuildText:
        case ChannelType.GuildPublicThread:
        case ChannelType.GuildPrivateThread:
        case ChannelType.GuildNews:
        case ChannelType.GuildNewsThread:
            return channel.messages.cache.get(messageId) ?? await channel.messages.fetch(messageId);
        default:
            return undefined;
    }
}

export async function getMessageDetails(guildId: string, channelId: string, messageId: string): Promise<[Guild | undefined, TextChannel | undefined, Message | undefined]> {
    const guild = await getGuild(guildId);
    const channel = await getChannel(channelId);
    const message = await getMessage(messageId, channel);
    switch (channel?.type) {
        case ChannelType.GuildText:
        case ChannelType.GuildPublicThread:
        case ChannelType.GuildPrivateThread:
        case ChannelType.GuildNews:
        case ChannelType.GuildNewsThread:
            return [guild, channel as TextChannel, message];
        default:
            return [guild, undefined, undefined];
    }
}
