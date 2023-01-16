import {ChannelType, Message} from "discord.js";

export function temporaryMessage(message: string, reply: Message, seconds: number = 15) {
    reply.reply({
        content: message,
        allowedMentions: {repliedUser: false}
    }).then((sent) => {
        setTimeout(() => {
            sent.delete().then(() => {});
        }, seconds * 1000);
    });
}
