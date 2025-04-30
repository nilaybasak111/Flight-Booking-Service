const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");

const { Booking } = require("../models");
const CrudRepository = require("./crud-repository");
const { Enums } = require("../utils/common");
const { BOOKED, CANCELED } = Enums.BOOKING_STATUS;

class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
  }

  // Create Booking using Transaction
  // This method is used to create a booking with transaction support
  async createBooking(data, transaction) {
    const response = await Booking.create(data, { transaction: transaction });
    return response;
  }

  // Get Booking using Transaction
  // This method is used to get a booking by its bookingId with transaction support
  async get(data, transaction) {
    const response = await Booking.findByPk(data, {
      transaction: transaction,
    });
    if (!response) {
      throw new AppError(
        "Not Able to Find the Resource",
        StatusCodes.NOT_FOUND
      );
    }
    return response;
  }

  // Update Booking using Transaction
  // This method is used to update a booking by its bookingId with transaction support
  async update(id, data, transaction) {
    // data --> Data must be an Object --> {col: value, .......}
    const response = await Booking.update(
      data,
      {
        where: {
          id: id,
        },
      },
      { transaction: transaction }
    );
    return response;
  }

  // Cancel Expired Booking using Transaction
  async cancelOldBookings(timestamp) {
    const response = await Booking.update(
      { status: CANCELED },
      {
        where: {
          [Op.and]: [
            { createdAt: { [Op.lt]: timestamp } },
            { status: { [Op.ne]: BOOKED } },
            { status: { [Op.ne]: CANCELED } },
          ],
        },
      }
    );
    return response;
  }
}

module.exports = BookingRepository;
