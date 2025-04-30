const cron = require("node-cron");

const { BookingService } = require("../../services");

function scheduleCrons() {
  cron.schedule("*/30 * * * *", async () => {
    console.log("Running Cron Job to Cancel Old Bookings Every 30 Minutes");
    await BookingService.cancelOldBookings();
  });
}

module.exports = scheduleCrons;
