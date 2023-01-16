import {
    ActionRowBuilder, Attachment, AttachmentBuilder, ButtonBuilder, ButtonStyle, Channel, EmbedBuilder,
    EmbedField, GuildChannelResolvable, GuildTextBasedChannel,
    Message, MessageEditOptions, MessageReplyOptions, PermissionsBitField,
    StickerFormatType, ThreadChannel,
} from "discord.js";
import * as Buffer from "buffer";
import {temporaryMessage} from "./utils/messages.js";
import {isDevelopment} from "./utils/main.js";
import {ContextyClient, DatabaseManager} from "./index.js";
import {lottieToImage} from "./utils/converters/lottie.js";
import {ServerConfig} from "./types/serverConfig";
//import {apngToGif} from "./converters/apng";

export default class MessageContext {
    private readonly message: Message;
    private readonly received: Message;

    private readonly channel: GuildTextBasedChannel & GuildChannelResolvable = undefined;

    private fields: EmbedField[] = [];
    private images: URL[] = [];
    private attach: Record<string, Buffer> = {};
    private mainContent: string = "";
    private promises: Promise<any>[] = [];
    private embeds: EmbedBuilder[] = [];
    private config: ServerConfig = undefined;
    private hasContent = false;
    private justLink: boolean;

    constructor(message: Message, received: Message, justLink: boolean) {
        this.message = message;
        this.received = received;
        this.justLink = justLink;
        if (received.inGuild()) {
            this.channel = this.message.channel as GuildTextBasedChannel & GuildChannelResolvable;
        } else {
            throw new Error("Cannot create a MessageContext for a non-guild type channel.");
        }
        this.config = DatabaseManager.getServerConfig(this.channel.guildId);
    }

    public async addChannel() {
        if (this.config.verbose) {
            if (this.channel.id !== this.received.channelId) {
                let mainChannel: Channel;
                if (this.channel instanceof ThreadChannel) {
                    mainChannel = (this.channel as ThreadChannel).parent;
                }
                this.mainContent += `**Channel**\n${(mainChannel ? `<#${mainChannel.id}> ➜ <#${this.channel.id}>` : `<#${this.channel.id}>`)}\n\n`;
            }
        } else {
            if (this.channel.id !== this.received.channelId) {
                let mainChannel: Channel;
                if (this.channel instanceof ThreadChannel) {
                    mainChannel = (this.channel as ThreadChannel).parent;
                }
                this.fields.push({
                    name: "Channel",
                    value: mainChannel ? `<#${mainChannel.id}> ➜ <#${this.channel.id}>` : `<#${this.channel.id}>`,
                    inline: false
                });
            }
        }
    }

    public async addMessage() {
        if (this.message.content) {
            this.hasContent = true;
            this.mainContent += `${this.config.verbose ? `**Message**\n` : ""}${this.message.content}${this.message.editedAt ? ' `(edited)`' : ''}\n\n`;
        }
    }

    public async addSender() {
        if (this.config.verbose) {
            this.fields.push({
                name: "Sender",
                value: `<@${this.message.author.id}>`,
                inline: false
            });
        }
    }

    public async addAttachments() {
        const nonImages: Attachment[] = [];
        this.message.attachments.forEach((attachment) => {
            if (attachment.contentType.startsWith("image/")) {
                this.images.push(new URL(attachment.url));
            } else {
                nonImages.push(attachment);
            }
        });
        for (let embedObject of this.message.embeds.filter(e => e.data.type === "gifv")) {
            switch (embedObject.data.provider.name) {
                case "Tenor": {
                    const url = embedObject.data.thumbnail.url.slice(0, 39) + "C/img.mp4";
                    if (isDevelopment()) {
                        console.log(embedObject.data);
                        console.log(url);
                    }
                    this.images.push(new URL(url));
                    break;
                }
            }
        }
        if (nonImages.length >= 1) {
            this.hasContent = true;
            this.fields.push({
                name: "Attachments",
                value: nonImages.map((attachment) => `[${attachment.name}](${attachment.url})`).join("\n"),
                inline: false
            });
        }
    }

    public async addStickers() {
        for (let [, sticker] of this.message.stickers) {
            this.hasContent = true;
            if (sticker.format === StickerFormatType.PNG || sticker.format === StickerFormatType.APNG) {
                this.images.push(new URL(sticker.url));
                // } else if (sticker.format === StickerFormatType.APNG) {
                //     this.attach[`${sticker.id}.gif`] = await apngToGif(sticker);
                //     this.images.push(new URL(`attachment://${sticker.id}.gif`));
            } else if (sticker.format === StickerFormatType.Lottie) {
                const data = await lottieToImage(sticker);
                switch (data.type) {
                    case "PNG":
                        this.attach[sticker.id + ".png"] = data.buffer;
                        this.images.push(new URL(`attachment://${sticker.id}.png`));
                        break;
                    case "GIF":
                        this.attach[sticker.id + ".gif"] = data.buffer;
                        this.images.push(new URL(`attachment://${sticker.id}.gif`));
                        break;
                }
                if (data.promiseGif) {
                    this.promises.push(
                        data.promiseGif.then((gif) => {
                            this.attach[sticker.id + ".gif"] = gif;
                            this.images.push(new URL(`attachment://${sticker.id}.gif`));
                            delete this.attach[sticker.id + ".png"];
                            this.images = this.images.filter(i => i.href !== `attachment://${sticker.id}.png`);
                        }));
                }
            }
        }
    }

    public async addEmbeds() {
        for (let embedObject of this.message.embeds.filter(e => e.data.type === "rich")) {
            this.hasContent = true;
            const embed = EmbedBuilder.from(embedObject);
            embed.setFooter({
                text: this.config.verbose ? `Message sent by ${this.message.author.username}${this.message.author.id === this.message.author.id ? "" : `, requested by ${this.received.author.username}`}` : `${this.message.author.username}#${this.message.author.discriminator}`,
                iconURL: this.message.author.displayAvatarURL()
            });
            this.embeds.push(embed);
        }
    }

    public async addRequested() {
        await this.addChannel();
        await this.addMessage();
        await this.addSender();
        if (this.config.attachments) {
            await this.addAttachments();
        }
        if (this.config.stickers) {
            await this.addStickers();
        }
        if (this.config.embeds) {
            await this.addEmbeds();
        }
    }

    private async getMessage(): Promise<MessageReplyOptions & MessageEditOptions> {
        let buttons = new ActionRowBuilder<ButtonBuilder>()
        if (this.config.removal) {
            buttons = buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId('hide')
                    .setLabel('Remove Context')
                    .setStyle(ButtonStyle.Secondary),
            );
        }
        if (this.images.length >= 1 && this.config.images) {
            this.hasContent = true;
        }
        const embeds: EmbedBuilder[] = []

        if (this.fields.length || this.mainContent || this.images.length) {
            let mainEmbed = new EmbedBuilder()
                .setColor("#0099ff")
                .setDescription(this.mainContent === "" ? null : this.mainContent)
                .setFooter({
                    text: this.config.verbose ? `Message sent by ${this.message.author.username}${this.message.author.id === this.message.author.id ? "" : `, requested by ${this.received.author.username}`}` : `${this.message.author.username}#${this.message.author.discriminator}`,
                    iconURL: this.message.author.displayAvatarURL()
                })
                .setImage(this.images.length >= 1 && this.config.images ? this.images[0].href : null)
                .setTimestamp(this.message.createdAt);
            if (this.fields && this.fields.length) {
                mainEmbed = mainEmbed.setFields(this.fields);
            }
            embeds.push(mainEmbed)
        }
        embeds.push(...this.images.slice(1).filter(() => this.config.images).map((image) => {
                return new EmbedBuilder()
                    .setColor("#0099ff")
                    .setFooter({
                        text: this.config.verbose ? `Message sent by ${this.message.author.username}${this.message.author.id === this.message.author.id ? "" : `, requested by ${this.received.author.username}`}` : `${this.message.author.username}#${this.message.author.discriminator}`,
                        iconURL: this.message.author.displayAvatarURL()
                    })
                    .setImage(image.href)
                    .setTimestamp(this.message.createdAt)
            }),
            ...this.embeds);
        return {
            embeds: embeds,
            allowedMentions: {users: [], roles: [], repliedUser: false},
            components: buttons.components.length ? [buttons] : [],
            files: Object.keys(this.attach).map(k => new AttachmentBuilder(this.attach[k], {name: k}))
        };
    }

    public async send() {
        const options = await this.getMessage();
        if (!this.hasContent) return;
        let sent: Message;
        try {
            if (this.justLink && this.config.delete) {
                try {
                    await this.received.delete();
                } catch (e) {
                    sent = await this.received.reply(options);
                }
                if (!sent) {
                    sent = await this.received.channel.send(options);
                }
            }
            if (!sent) {
                sent = await this.received.reply(options);
            }
            if (this.promises.length >= 1) {
                Promise.all(this.promises).then(async () => {
                    if (isDevelopment()) {
                        console.log("Updating message");
                    }
                    await sent.edit(await this.getMessage());
                });
            }
        } catch (e) {
            if (e.rawError.message === "Missing Permissions") {
                try {
                    temporaryMessage(`I don't have permission to send embeds in this channel.\nPlease ${this.received.member.permissionsIn(this.channel).has(PermissionsBitField.Flags.ManageChannels, true) ? "either" : "ask an admin to either"} add the \`Embed Links\` permission to <@${ContextyClient.user.id}>, or remove my permission to send messages entirely.`, this.received);
                } catch (e) {
                    if (isDevelopment()) {
                        console.log(e);
                    }
                }
            } else {
                if (isDevelopment()) {
                    console.log(e);
                }
            }
        }
    }
}
