import {
    ActivityType, BaseGuildTextChannel,
    ButtonInteraction,
    Client,
    CommandInteraction,
    DMChannel,
    GatewayIntentBits,
    Partials,
    REST,
    Routes
} from 'discord.js';
import * as fs from "fs";
import * as AutoPoster from "topgg-autoposter";
import {getMessageDetails, messageParser} from "./utils/messageParser.js";
import {isDevelopment} from "./utils/main.js";
import {temporaryMessage} from "./utils/messages.js";
import MessageContext from "./MessageContext.js";
import contextyCommands from "./commands/contextyCommands.js";
import databaseManager from './utils/databaseManager.js';

const config: { token: string, development?: boolean, topgg: string, id: string } = JSON.parse(fs.readFileSync('../config.json').toString());

process.env.DEVELOPMENT = config.development ? "true" : "false";

switch (process.platform) {
    case 'win32':
        process.env.GIFSKI_PATH = `"../node_modules/gifski/bin/windows/gifski.exe"`
        break;
    case'linux':
        process.env.GIFSKI_PATH = "../node_modules/gifski/bin/debian/gifski"
        break
}

export const ContextyClient = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

export const RestClient = new REST({ version: '10' }).setToken(config.token);

export const DatabaseManager = new databaseManager("../database.json");

if (!isDevelopment() && config.topgg) {
    AutoPoster.AutoPoster(config.topgg, ContextyClient)
}

if (!fs.existsSync('../images')) {
    fs.mkdirSync('../images');
}

ContextyClient.once('ready', () => {
    console.log('Contexty is ready!');
    console.log("In Guilds: [" + ContextyClient.guilds.cache.size + "/100]");
    status()
    setInterval(status, 1000 * 60);
});

const status = () => {
    if (isDevelopment()) {
        ContextyClient.user.setActivity(`the developer`, {type: ActivityType.Listening});
    } else {
        ContextyClient.user.setActivity(`${ContextyClient.guilds.cache.size} Guilds`, {type: ActivityType.Watching});
    }
}

ContextyClient.on("messageCreate", async (received) => {
    if (received.author.bot) return;
    const content = received.content.toLowerCase();
    if (!content || content === "") return;
    const [guildId, channelId, messageId, justLink] = messageParser(content);
    if (!guildId || !channelId || !messageId) return;
    const [guild, channel, message] = await getMessageDetails(guildId, channelId, messageId)
    if (!guild || !channel || !message) return;
    if (channel.nsfw && (received.channel instanceof DMChannel || !(<BaseGuildTextChannel> received.channel).nsfw)) return;
    if (message.author.id === config.id) {
        temporaryMessage(`I can't preview my own messages!`, received);
        return;
    }
    const messageContext = new MessageContext(message, received, justLink);
    await messageContext.addRequested();
    await messageContext.send();
});

ContextyClient.on('interactionCreate', async interaction => {
    if (interaction.isButton()) {
        const button = interaction as ButtonInteraction;
        try {
            switch (button.customId) {
                case "hide": {
                    // check if removal is set to true in server
                    const serverConfig = await DatabaseManager.getServerConfig(button.guildId);
                    if (!serverConfig.removal) {
                        await button.reply({content: "Message removal is disabled in this server!", ephemeral: true});
                        return;
                    }
                    if ((await interaction.channel.messages.fetch(button.message.reference.messageId)).author.id === button.user.id) {
                        const reply = button.reply({content: "Context removed.", ephemeral: true});
                        await Promise.all([reply, button.message.delete()]);
                    } else {
                        await button.reply({content: "You can't delete other people's context!", ephemeral: true});
                    }
                    break;
                }
            }
        } catch (e) {
            if (isDevelopment()) {
                console.log(e);
            }
        }
    } else if (interaction.isCommand()) {
        const command = interaction as CommandInteraction;
        const commandName = command.commandName;
        const commandObject = contextyCommands.find(command => command.discordCommand.name === commandName);
        if (commandObject && !(commandObject.guildOnly && command.guild === null)) {
            try {
                await commandObject.execute(command);
            } catch (e) {
                if (isDevelopment()) {
                    console.log(e);
                }
            }
        }
    }
});

ContextyClient.on("guildCreate", async (guild) => {
    console.log("Joined New Guild: " + guild.name);
    console.log("In Guilds: [" + ContextyClient.guilds.cache.size + "/100]");
})


process.on('SIGINT', function () {
    ContextyClient.user.setActivity(`Restarting...`, {type: ActivityType.Playing});
    console.log("Restarting...");
    ContextyClient.destroy();
    process.exit();
});

if (!isDevelopment()) {
    process.on('uncaughtException', function (err) {
        console.log('Caught exception: ' + err);
        console.log(err.stack)
    });
}

(async () => {
    const response: {id: string, name: string}[] = await RestClient.put(
        Routes.applicationCommands(config.id),
        { body: contextyCommands.map(command => command.discordCommand.toJSON()) },
    ) as any;
    response.forEach((data) => {
        const command = contextyCommands.find(command => command.discordCommand.name === data.name);
        if (command) {
            command.data = data;
        }
    })
    await ContextyClient.login(config.token);

    await new Promise(resolve => setTimeout(resolve, 1000 * 60));

    if (!ContextyClient.isReady()) {
        console.log("Failed to boot, restarting...");
        process.exit();
    }
})()
