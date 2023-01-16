# Contexty

<!-- TOC -->
* [Contexty](#contexty)
  * [What is Contexty?](#what-is-contexty)
  * [How can I use it!](#how-can-i-use-it-)
  * [How can I get Support?](#how-can-i-get-support)
  * [Self Hosting](#self-hosting)
  * [Developing](#developing)
<!-- TOC -->

## What is Contexty?
Contexty is a single-purpose [Discord](https://discord.com/) Bot created to solve the issue of linked messages being incredibly clunky, and causing you to lose your place in a conversation.

## How can I use it?
A Public instance of Contexty is available on [Top.gg](https://top.gg/bot/954551864656007198) ([Direct Invite](https://top.gg/bot/954551864656007198/invite))

To set it up using the public instance
1. Open the [Direct Invite](https://top.gg/bot/954551864656007198/invite)
2. Select your server under "**ADD TO SERVER**", and click "**Continue**"
3. Navigate to your Server
4. Run `/config view`, and modify settings as you see fit
5. Modify your server's channel permissions to allow Contexty to read messages, send messages, and embed links in the channels you want it to work in
6. Click **`⋯`** when highlighting a message, and select `Copy Message Link 🔗`
7. Paste the link into the channel, send your message, and voilà!

## How can I get Support?
Join the support Discord Server [Contexty Playground](https://discord.gg/WKTrmqGWFZ) for assistance!

## Self Hosting
Self Hosting Instructions (This is not recommended, as it requires you to have a place to host the bot)

1. Nativate to https://discord.com/developers/applications
2. Click `New Application`
3. Give your application a name, and click Create
4. Navigate to `🧩 Bot`, and click `Add Bot`, then `Yes, Do It!`
5. Click `Reset Token`, and save this token to a secret place (We'll need it later, but make sure not to share it!)
6. Enable `MESSAGE CONTENT INTENT` (Required for Contexty to function), and Disable `Public Bot` (Optional, but recommended)
7. Navigate to `🏠 General Information`, and copy your `Application ID` (We'll also need this one later)
8. Now download the code from this repository (Bonus points if your host supports git!)
9. Copy the `config.example.json` file to `config.json`
10. Open `config.json` in your favorite text editor, and replace the `token` and `id` values with the ones you saved earlier
11. Install [NodeJS](https://nodejs.org/) & [Yarn](https://yarnpkg.com/), then run `yarn install` to install the required dependencies
12. Run `yarn production`
13. Open the URL `https://discord.com/api/oauth2/authorize?client_id=<id>&permissions=83968&scope=applications.commands%20bot` (replacing `<id>` with your previously copied ID)
14. Follow instructions starting from 2 in the public instance section

## Developing
If you want to contribute to the project, or just want to run it locally, follow the instructions below

1. Clone the repository
2. Copy the `config.example.json` file to `config.json`
3. Open `config.json` in your favorite text editor, and replace the `token` and `id` values with their respective values (see Self Hosting for Details)
4. Install [NodeJS](https://nodejs.org/) & [Yarn](https://yarnpkg.com/), then run `yarn install` to install the required dependencies
5. Run `yarn dev` each time you make changes.
6. Make a PR with your awesome changes!
