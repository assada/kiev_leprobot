const BoobsCommand = require('../commands/BoobsCommand');
const CatCommand = require('../commands/CatCommand');
const ButtCommand = require('../commands/ButtCommand');
const HoleCommand = require('../commands/HoleCommand');
const PenisCommand = require('../commands/PenisCommand');
const PidorCommand = require('../commands/PidorCommand');
const PidorTopCommand = require('../commands/PidorTopCommand');
const PussyCommand = require('../commands/PussyCommand');
const RateCommand = require('../commands/RateCommand');
const TrapCommand = require('../commands/TrapCommand');
const TopCommand = require('../commands/TopCommand');
const Rule34Command = require('../commands/Rule34Command');
const GraphTopCommand = require('../commands/GraphTopCommand');

const MessageHandler = require('../commands/handlers/MessageHandler');
const LeftChatParticipantHandler = require('../commands/handlers/LeftChatParticipantHandler');

const logger = require('../utils/logger');

class CommandRouter {
    constructor() {
        this.commands = new Map();
        this.registerCommands();
        this.handlers = new Map();
        this.registerHandlers();
    }

    registerCommands() {
        this.register(new BoobsCommand());
        this.register(new CatCommand());
        this.register(new ButtCommand());
        this.register(new HoleCommand());
        this.register(new PenisCommand());
        this.register(new PidorCommand());
        this.register(new PidorTopCommand());
        this.register(new PussyCommand());
        this.register(new RateCommand());
        this.register(new TrapCommand());
        this.register(new TopCommand());
        this.register(new Rule34Command());
        this.register(new GraphTopCommand());
    }

    registerHandlers() {
        this.registerHandler(new MessageHandler());
        this.registerHandler(new LeftChatParticipantHandler());
    }

    register(command) {
        this.commands.set(command.name, command);
        logger.info(`Registered command: ${command.name}`);
    }

    registerHandler(handler) {
        this.handlers.set(handler.name, handler);
        logger.info(`Registered handler: ${handler.name}`);
    }

    async setupRoutes(bot) {
        this.commands.forEach((command, name) => {
            const pattern = new RegExp(`^/${name}(?:@\\w+)?(.*)$`);
            
            bot.onText(pattern, async (msg, match) => {
                await command.handle(bot, msg, match);
            });
        });

        bot.on('message', async (msg) => {
            if (msg.text && !msg.text.startsWith('/')) {
                const messageHandler = this.handlers.get('MessageHandler');
                if (messageHandler) {
                    await messageHandler.execute(bot, msg);
                }
            }
        });

        bot.on('left_chat_member', async (msg) => {
            const leftChatHandler = this.handlers.get('LeftChatParticipantHandler');
            if (leftChatHandler) {
                await leftChatHandler.execute(bot, msg);
            }
        });

        logger.info(`Registered ${this.commands.size} commands and ${this.handlers.size} handlers`);
    }

    getCommands() {
        return Array.from(this.commands.values());
    }
}

module.exports = CommandRouter; 