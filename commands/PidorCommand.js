const BaseCommand = require('./BaseCommand');
const PidorService = require('../services/PidorService');
const repositories = require('../repositories');
const { sequelize } = require('../database/connection');
const logger = require('../utils/logger');
const Random = require("random-js");
const { htmlEntities, capitalizeFirstLetter } = require('../utils/utils');

const errorsMessages = {
    onlyForChats: 'Ця команда працює тільки в чатах!'
};

class PidorCommand extends BaseCommand {
    constructor() {
        super('pidor', 'Підор!', '/pidor');
        this.randomizer = new Random.Random(Random.MersenneTwister19937.autoSeed());
        this.pidorService = new PidorService();
        this.princesses = [173485093, 263839313];
        this.pidorMutex = {};
        
    }

    async execute(bot, msg, match) {
        const chatId = msg.chat.id;
        
        if (chatId > 0) {
            bot.sendMessage(chatId, errorsMessages.onlyForChats);
            return false;
        }

        bot.sendChatAction(chatId, 'typing');

        logger.info('PidorCommand: Executing command for chatId:', chatId, 'and userId:', msg.from.id);

        try {
            const pidorResult = await this.pidorService.getPidor(chatId, msg.from.id);
            logger.warn('PidorCommand: Pidor result:', pidorResult);
            
            if (pidorResult.status === 'old' && pidorResult.user === msg.from.id) {
                await this.sendPidorCannotStartMessage(bot, chatId);
                return;
            }

            const user = await repositories.UserRepository.findByUserId(pidorResult.user);
            const pidorCount = await repositories.PidorRepository.pidorCount(sequelize, pidorResult.user, chatId);
            const userLevel = this.getUserLevel(pidorCount, user.user);

            if (pidorResult.status === 'old') {
                await this.sendExistingPidorMessage(bot, chatId, user, userLevel);
            } else {
                await this.processNewPidor(bot, chatId, user, userLevel);
            }
        } catch (error) {
            logger.error('PidorCommand: Error in execute:', error);
            delete this.pidorMutex[chatId];
        }
    }

    async sendPidorCannotStartMessage(bot, chatId) {
        await bot.sendMessage(chatId, 'Страждай педрилка! Тільки не підор може запустити підор-машину! ХА-ХА-ХА-ХА', {
            parse_mode: 'HTML'
        });
    }

    async sendExistingPidorMessage(bot, chatId, user, userLevel) {
        setTimeout(async () => {
            const message = `:lvl: дня - <b>${htmlEntities(user.first_name)} ${htmlEntities(user.last_name)}</b>`
                .replace(':lvl:', capitalizeFirstLetter(userLevel));
            
            await bot.sendMessage(chatId, message, {
                parse_mode: 'HTML'
            });
        }, 2000);
    }

    async processNewPidor(bot, chatId, user, userLevel) {
        const currentTime = process.hrtime();
        
        if (this.isPidorMutexActive(chatId, currentTime)) {
            return false;
        }

        this.pidorMutex[chatId] = currentTime[0];

        try {
            const chatMember = await bot.getChatMember(chatId, user.user);
            
            if (!this.isValidChatMember(chatMember)) {
                delete this.pidorMutex[chatId];
                logger.warn('PidorCommand: User is not a member of the chat');
                return;
            }

            await repositories.PidorRepository.store(chatId, user.user);
            const messageCount = await repositories.MessageRepository.countUserMessages(sequelize, user.user, chatId);
            
            await this.sendPidorScenario(bot, chatId, user, userLevel, messageCount[0].count);
        } catch (error) {
            delete this.pidorMutex[chatId];
            logger.error('PidorCommand: Error processing new pidor:', error);
        }
    }

    isPidorMutexActive(chatId, currentTime) {
        return chatId in this.pidorMutex && currentTime[0] - 2000 <= this.pidorMutex[chatId];
    }

    isValidChatMember(chatMember) {
        return ['creator', 'administrator', 'member'].includes(chatMember.status);
    }

    getUserLevel(pidorCount, userId) {
        const pidorLevels = [
            'підорасік',
            'підорок',
            'підор',
            'головний підор',
            'підорасіще',
            'підор із підорів',
        ];

        if (this.princesses.includes(userId)) {
            return 'Принцесска';
        }

        if (pidorCount <= 1) return pidorLevels[0];
        if (pidorCount <= 3) return pidorLevels[1];
        if (pidorCount <= 7) return pidorLevels[2];
        if (pidorCount <= 14) return pidorLevels[3];
        if (pidorCount <= 20) return pidorLevels[4];
        return pidorLevels[5];
    }

    async sendPidorScenario(bot, chatId, user, userLevel, messageCount) {
        const scenario = this.randomizer.pick(this.getPidorScenarios());
        let timeout = 1000;

        scenario.forEach((messageTemplate, index) => {
            setTimeout(async () => {
                const processedMessage = this.processMessageTemplate(messageTemplate, user, userLevel, messageCount);
                
                await bot.sendMessage(chatId, processedMessage, {
                    parse_mode: 'HTML'
                });
                
                if (index === scenario.length - 1) {
                    delete this.pidorMutex[chatId];
                }
            }, timeout);
            
            timeout += this.randomizer.integer(1000, 1500);
        });
    }

    processMessageTemplate(template, user, userLevel, messageCount) {
        return template
            .replace(/:username:/g, user.username)
            .replace(/:last_name:/g, htmlEntities(user.last_name))
            .replace(/:first_name:/g, htmlEntities(user.first_name))
            .replace(/:messages:/g, messageCount)
            .replace(/:lvl:/g, userLevel)
            .replace(/:draw:/g, this.randomizer.integer(15, 99999));
    }

    getPidorScenarios() {
        return [
            [
                'Стривай-но, спочатку потрібно врятувати острів!',
                '<i>4 8 15 16 23 42</i>',
                '108:00 <i>Встигли...</i>',
                'Острів урятували? Врятували. І підора коронувати не забудемо.',
                'Наш :lvl: це... @:username: (:first_name: :last_name:)! Ура, :lvl:!'
            ],
            [
                'Почнемо наш щоденний розіграш <b>#:draw:</b>!',
                'Крутимо барабан, панове!',
                'Дістаємо номер... Отже...',
                'Наш :lvl: на наступні 24 години тепер учасник, який написав :messages: повідомлень...',
                '... ... @:username: (:first_name: :last_name:)! Вітаємо :first_name: з цією ПОДІЄЮ!'
            ],
            [
                'Чо чо? Хочете підора? <i>Зараз я вам знайду</i> підора...',
                '<i>Ох ти...</i>',
                'ЦЬОГО НІХТО НЕ ЧЕКАВ!',
                'Ви готові?',
                'Тепер наш :lvl: - @:username: (:first_name: :last_name:)!',
                '<i>Охуїти, так?</i>',
            ],
            [
                'Відкриваю <b>Find My PIDOR..</b>',
                '<i>Сканую місцевість...</i>',
                'Ах ти сука, від мене не сховаєшся!',
                ':lvl: дня - @:username: (:first_name: :last_name:)!'
            ],
            [
                'ТЕПЕР ЦЕ НЕ Зупинити!',
                '<i>шаманним-шаманним...</i>',
                'Доступ отримано. <b>Аннал</b>ювання протоколу.',
                'TI PIDOR, @:username: (:first_name: :last_name:)'
            ],
            [
                'Обережно! <b>Підор дня</b> активовано!',
                'Сканую...',
                'КЕК',
                'Стояти! Не рухатись! Ви оголошені <b>підором дня</b>, @:username: (:first_name: :last_name:)',
            ],
            [
                'Зараз почаруємо...',
                '<i>Хм...</i>',
                'Так-так, що ж тут у нас...',
                'Ого, ви подивіться тільки! А :lvl: дня то - @:username: (:first_name: :last_name:)',
            ],
            [
                'Починаю пошук любителя техніки Apple...',
                'Щось надто дохуючи їх тут, кого б вибрати...',
                'Виберу найжирнішого!',
                ':lvl: дня - @:username: (:first_name: :last_name:)!'
            ],
            [
                'Настав час начарувати нового підора!',
                'Змішую трохи SEO, вейпа, смузі та заливаю в чан...',
                'Ретельно заважаю і зливаю в чат...',
                'БА-БАХ! А @:username:-то :lvl:! Котрий (:first_name: :last_name:)',
            ],
            [
                '甚至不要尝试翻译文本。',
                '如果您尝试 - 你会是一个同性恋的天结束。',
                '就这样吧。',
                '盖伊的一天 - @:username: (:first_name: :last_name:)!',
            ],
            [
                'Ну',
                'ладно',
                'Зараз',
                'вилетить',
                'підор!',
                'УВАГА!',
                '*ПДИЖЬ*',
                '@:username: (:first_name: :last_name:) - :lvl: дня',
            ]
        ];
    }
}

module.exports = PidorCommand; 