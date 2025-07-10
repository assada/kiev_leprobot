const BaseCommand = require('./BaseCommand');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { sequelize } = require('../database/connection');
const repositories = require('../repositories');
const logger = require('../utils/logger');
const cache = require('memory-cache');

class GraphTopCommand extends BaseCommand {
    constructor() {
        super('graph_top', 'Показати графік...', '/graph_top');
    }

    async execute(bot, msg, match) {
        const chatId = msg.chat.id;

        const errorsMessages = {
            onlyForChats: 'Ця команда доступна лише в групових чатах',
            error: 'Схоже апі зламане... А у мене помилка'
        };

        const cacheKey = "_" + chatId + "-graph";
        if (chatId > 0) {
            bot.sendMessage(chatId, errorsMessages.onlyForChats);
            return false;
        }

        bot.sendChatAction(chatId, 'upload_photo');

        try {
            const res = await repositories.MessageRepository.topByDays(sequelize, chatId);
            
            const photo = await new Promise((resolve) => {
                if (cache.get(cacheKey) == null) {
                    let x = [];
                    let y = [];
                    
                    res.forEach((value) => {
                        x.push((value.day < 10 ? '0' + value.day : value.day));
                        y.push(value.count);
                    });
                    
                    const width = 1200;
                    const height = 800;
                    
                    const configuration = {
                        type: 'line',
                        data: {
                            labels: x.reverse(),
                            datasets: [
                                {
                                    label: 'Messages',
                                    backgroundColor: "rgba(255,255,255,1)",
                                    borderColor: "rgba(75,192,192,1)",
                                    borderCapStyle: 'butt',
                                    tension: 0,
                                    fill: false,
                                    data: y.reverse()
                                }
                            ]
                        },
                        options: {
                            plugins: {
                                legend: {
                                    display: true,
                                    position: 'top'
                                },
                                title: {
                                    display: true,
                                    text: 'Messages Activity'
                                }
                            },
                            scales: {
                                x: {
                                    display: true,
                                    title: {
                                        display: true,
                                        text: 'Days'
                                    }
                                },
                                y: {
                                    display: true,
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Messages Count'
                                    }
                                }
                            }
                        },
                        plugins: [{
                            id: 'background-colour',
                            beforeDraw: (chart) => {
                                const ctx = chart.ctx;
                                ctx.save();
                                ctx.fillStyle = 'white';
                                ctx.fillRect(0, 0, width, height);
                                ctx.restore();
                            }
                        }]
                    };

                    const chartCallback = (ChartJS) => {
                        ChartJS.defaults.responsive = true;
                        ChartJS.defaults.maintainAspectRatio = false;
                        ChartJS.defaults.font.family = 'Arial, sans-serif';
                        ChartJS.defaults.font.size = 14;
                        ChartJS.defaults.color = '#333';
                    };
                    
                    const chartJSNodeCanvas = new ChartJSNodeCanvas({ 
                        width, 
                        height,
                        chartCallback
                    });
                    
                    chartJSNodeCanvas.renderToBuffer(configuration).then((buffer) => {
                        logger.info('Creating cache for graph');
                        cache.put(cacheKey, buffer, 60 * 60 * 1000);
                        resolve(buffer);
                    }).catch((error) => {
                        logger.error('Error creating chart:', error);
                        throw error;
                    });
                } else {
                    logger.info('Using cache for graph');
                    resolve(cache.get(cacheKey));
                }
            });
            
            bot.sendPhoto(chatId, photo);
            
        } catch (error) {
            logger.error('Error getting graph:', error);
            bot.sendMessage(chatId, errorsMessages.error + ': ' + error.message, {
                parse_mode: 'Markdown'
            });
        }
    }
}

module.exports = GraphTopCommand;