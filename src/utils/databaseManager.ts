import {ServerConfig} from "../types/serverConfig";
import * as fs from "fs";

export default class DatabaseManager {

    private readonly path: string;
    private ContextyDatabase: ContextyDatabase;
    constructor(path: string) {
        this.path = path;
        this.ContextyDatabase = this.readFile();
    }

    public readFile(): ContextyDatabase {
        try {
            return JSON.parse(fs.readFileSync(this.path, 'utf-8'));
        } catch (e) {
            return {};
        }
    }

    public writeFile(): void {
        fs.writeFileSync(this.path, JSON.stringify(this.ContextyDatabase, null, 2));
    }

    public getServerConfig(serverId: string): ServerConfig {
        return {...defaultConfig, ...this.ContextyDatabase[serverId]};
    }

    public setServerConfig(serverId: string, serverConfig: ServerConfig): void {
        this.ContextyDatabase[serverId] = serverConfig;
        this.writeFile();
    }

    public changeServerConfig(serverId: string, partialServerConfig: Partial<ServerConfig>): void {
        this.setServerConfig(serverId, {...this.getServerConfig(serverId), ...partialServerConfig});
    }
}

export type ContextyDatabase = {
    [id: string]: ServerConfig
}

const defaultConfig: ServerConfig = {
    verbose: false,
    stickers: true,
    images: true,
    attachments: true,
    embeds: true,
    removal: true,
    delete: false,
}
