const axios = require("axios");
const { StatusCodes } = require("http-status-codes");

const { BookingRepository } = require("../repositories");
const AppError = require("../utils/errors/app-error");
const { ServerConfig, Queue } = require("../config");
const db = require("../models");
const { Enums } = require("../utils/common");
const { BOOKED, CANCELED } = Enums.BOOKING_STATUS;

const bookingRepository = new BookingRepository();

async function createBooking(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const flight = await axios.get(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`
    );
    //console.log("this is flight from booking service", flight);
    const flightData = flight.data.data;
    if (data.noOfSeats > flightData.totalSeats) {
      throw new AppError("Not enough seats available", StatusCodes.BAD_REQUEST);
    }

    const totalBillingAmount = data.noOfSeats * flightData.price;
    //console.log( "this is total billing amount from booking service", totalBillingAmount);
    const bookingPayload = { ...data, totalCost: totalBillingAmount };
    const booking = await bookingRepository.create(bookingPayload, transaction);
    await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,
      {
        seats: data.noOfSeats,
      }
    );

    await transaction.commit();
    return booking;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function makePayment(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.get(
      data.bookingId,
      transaction
    );

    if (!bookingDetails.status == CANCELED) {
      throw new AppError(
        "The Booking Session is Expired",
        StatusCodes.BAD_REQUEST
      );
    }

    const bookingTime = new Date(bookingDetails.createdAt);
    const currentTime = new Date();
    // Complete the payment within 5 minutes
    // If the payment is not completed within 5 minutes, cancel the booking
    if (currentTime - bookingTime > 300000) {
      await cancelBooking(data.bookingId);
      throw new AppError(
        "The Booking Session is Expired",
        StatusCodes.BAD_REQUEST
      );
    }

    if (bookingDetails.totalCost != data.totalCost) {
      throw new AppError(
        "The Amount of The Payment does not Matched",
        StatusCodes.BAD_REQUEST
      );
    }

    if (bookingDetails.userId != data.userId) {
      throw new AppError(
        "The User Corresponding to the Booking does not Matched",
        StatusCodes.BAD_REQUEST
      );
    }

    // We can assume that the payment was successful
    // Update the booking status pending to booked
    await bookingRepository.update(
      data.bookingId,
      { status: BOOKED },
      transaction
    );

    // Finding User Mail Id using UserId
    const userMail = await axios.get(`${ServerConfig.API_GATEWAY_BOOKING}/api/v1/user/${data.userId}`);
    //console.log("this is user mail from booking service ", userMail.data.data);

    // After the payment is successful, we can send a notification to the user
    Queue.sendData({
      // recepientEmail: "abc@gmail.com",
      recepientEmail: userMail.data.data,
      subject: "Flight Booked",
      text: `Booking Successfully Done for The Booking Id ${data.bookingId}`,
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function cancelBooking(bookingId) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.get(bookingId, transaction);
    if (bookingDetails.status == CANCELED) {
      await transaction.commit();
      return true;
    }
    await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`,
      {
        seats: bookingDetails.noOfSeats,
        dec: 0,
      }
    );
    await bookingRepository.update(
      bookingId,
      { status: CANCELED },
      transaction
    );
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function cancelOldBookings() {
  try {
    const time = new Date(Date.now() - 1000 * 300); // 5 Minutes Ago
    const response = await bookingRepository.cancelOldBookings(time);
    return response;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { createBooking, makePayment, cancelOldBookings };
