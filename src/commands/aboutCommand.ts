import {SlashCommandBuilder} from '@discordjs/builders'
import {ContextyCommand} from "./contextyCommands.js";
import {CommandInteraction, EmbedBuilder} from "discord.js";

const AboutCommand: ContextyCommand =  {
    discordCommand: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Information about the bot')
    ,
    guildOnly: false,
    execute: async (command: CommandInteraction) => {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Help')
            .setDescription(`
            **About** 
            Contexty is a Discord bot that allows you to preview messages linked messages.
            To use it, simply link to a message sent in a channel <@${command.client.user.id}> has access to.
            
            Contexty is maintained by [Fredthedoggy#0001](https://discord.com/users/547890787682222081) with [discord.js](https://www.npmjs.com/package/discord.js) and [typescript](https://www.npmjs.com/package/typescript).
            
            Feel free to [vote](https://top.gg/bot/954551864656007198/vote) for the bot on [top.gg](https://top.gg/bot/954551864656007198), or leave a review!
            
            **Privacy Policy**
            Contexty only collects cached stickers that have been used in linked messages for loading time purposes. All other text-based or image-based data is requested on-demand, and not stored on contexty's servers.
            
            **Contact**
            Contact me at Fredthedoggy#0001 on Discord, or join [Contexty Playground](https://discord.gg/WKTrmqGWFZ).
            
            **Disclaimer**
            Contexty is not responsible for user-generated content proxied through the bot.
            `)
            .setTimestamp();
        await command.reply({embeds: [embed]});
    }
}

export default AboutCommand
