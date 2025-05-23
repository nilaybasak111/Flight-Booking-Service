const amqplib = require("amqplib");
const ServerConfig = require("./server-config");

let connection, channel;

// Connect to RabbitMQ
// This function is used to connect to RabbitMQ
async function connectQueue() {
  try {
    connection = await amqplib.connect("amqp://localhost");
    channel = await connection.createChannel();
    await channel.assertQueue(ServerConfig.RABBITMQ_QUEUE);
  } catch (error) {
    console.error("Error connecting to RabbitMQ: ", error);
  }
}

// Send data to RabbitMQ Queue
// This function is used to send data to the RabbitMQ queue
async function sendData(data) {
  try {
    // This Send Messages to Queue After Every 1 Second
    // setInterval(() => {
    //   channel.sendToQueue("noti_queue", Buffer.from('Up & Running'));
    //   console.log("Message sent to queue");
    // }, 1000);
    await channel.sendToQueue(
      ServerConfig.RABBITMQ_QUEUE,
      Buffer.from(JSON.stringify(data))
    );
  } catch (error) {
    console.error("Error sending data to RabbitMQ: ", error);
  }
}

module.exports = {
  connectQueue,
  sendData,
};
