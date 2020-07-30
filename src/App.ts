import * as os from "os";
import * as path from "path";
import * as fs from "fs-extra";
import * as figlet from "figlet";
import * as open from "open";
import * as inquirer from "inquirer";
import { createConnection, Connection } from "typeorm";
import { AppArgs } from "./AppArgs";
import { AppConfig } from "./AppConfig";
import { HitokotoService } from "./control";
import * as entities from "./entity";
import * as views from "./view";


export class App {
    args: AppArgs;
    debuggable: boolean

    programDir: string
    configPath: string
    mainDBPath: string
    hitokotoDBPath: string

    config: AppConfig
    private mainDBConnection: Connection
    private hitokotoDBConnection: Connection

    constructor() {
        this.parseCommandArgs();
        this.setDebuggable();

        this.setPath();
        this.ensurePath();
    }

    public get version(): string {
        const packageJSON = fs.readFileSync(path.join(__dirname, "/../package.json"), { encoding: "utf8" });
        const packageInfo = JSON.parse(packageJSON);
        return packageInfo.version;
    }

    public getMainDBConnection(): Connection {
        return this.mainDBConnection;
    }

    public getHitokotoDBConnection(): Connection {
        return this.hitokotoDBConnection;
    }

    private parseCommandArgs(): void {
        this.args = new AppArgs();
    }

    private setDebuggable(): void {
        this.debuggable = process.env.NODE_ENV === "development";
        if (this.args.hasFlag("d") || this.args.hasFlag("debug")) {
            this.debuggable = true;
        }
    }

    private setPath(): void {
        const platform = os.platform();
        const homeDir = os.homedir();

        this.programDir = "";
        switch (platform) {
            case "win32": {
                this.programDir = path.resolve(homeDir + "/AppData/Local/DayPrimer");
                break;
            }

            case "linux": case "darwin": {
                this.programDir = path.resolve(homeDir + "/.DayPrimer");
                break;
            }
        }

        if (this.programDir === "") {
            throw "不支持的平台：" + platform;
        }

        this.configPath = path.resolve(this.programDir + "/config.json");
        this.mainDBPath = path.resolve(this.programDir + "/main.sqlite3");
        this.hitokotoDBPath = path.resolve(this.programDir + "/hitokoto.sqlite3");
    }

    private ensurePath(): void {
        fs.ensureDirSync(path.dirname(this.programDir));
        fs.ensureDirSync(path.dirname(this.configPath));
        fs.ensureDirSync(path.dirname(this.mainDBPath));
    }

    public async start(): Promise<void> {
        await this.initConfig();
        await this.initDB();

        this.updateHitokoto();

        let shouldLaunchMainUI = true;
        const getNextCommand = this.args.consumeComand.bind(this.args);
        for (let command = getNextCommand(); command != null; command = getNextCommand()) {
            if (command === "data") {
                open(this.programDir);
                shouldLaunchMainUI = false;
            }
        }

        if (shouldLaunchMainUI) {
            this.launchMainUI();
        }
    }

    private async initConfig(): Promise<void> {
        this.config = await AppConfig.load(this.configPath);
        AppConfig.save(this.config, this.configPath);
    }

    private async initDB(): Promise<void> {
        await createConnection({
            name:     "main",
            type:     "sqlite",
            database: this.mainDBPath,
            entities: [
                entities.Target, entities.Action
            ],
            logging:     this.debuggable,
            logger:      "file",
            synchronize: true
        })
            .then(conn => this.mainDBConnection = conn)
            .catch(err => console.log(err));

        await createConnection({
            name:        "hitokoto",
            type:        "sqlite",
            database:    this.hitokotoDBPath,
            entities:    [entities.Hitokoto],
            logging:     this.debuggable,
            logger:      "file",
            synchronize: true
        })
            .then(conn => this.hitokotoDBConnection = conn)
            .catch(err => console.error(err));
    }


    private updateHitokoto(): void {
        if (this.config.updateHitokotoAtStartup) {
            HitokotoService.update();
        }
    }

    private async launchMainUI(): Promise<void> {
        this.printTitle();
        await this.greeting();

        let shouldRun = true;
        while (shouldRun) {
            const answer = await inquirer.prompt(views.mainMenuOptions);
            switch (answer.mainMenuOptions) {
                case "设置": {
                    console.log("未实现。");
                    break;
                }
                case "退出": {
                    shouldRun = false;
                }
            }
        }
    }

    private printTitle(): void {
        const textArt = (text: string): string => figlet.textSync(text, "Star Wars");
        console.log(textArt("Phase"));
    }

    private async greeting(): Promise<void> {
        const hitokoto = await HitokotoService.random();
        if (hitokoto != null) {
            console.log(`［一言］${hitokoto.content} ——${hitokoto.from}`);
        }
    }
}
