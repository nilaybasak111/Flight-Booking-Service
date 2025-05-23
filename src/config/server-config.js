const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    PORT: process.env.PORT,
    FLIGHT_SERVICE: process.env.FLIGHT_SERVICE,
    RABBITMQ_QUEUE: process.env.RABBITMQ_QUEUE,
}