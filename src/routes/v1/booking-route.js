const express = require("express");
const router = express.Router();

const { BookingController } = require("../../controllers");

// POST : /api/v1/flights/
router.post(
  "/",
  BookingController.createBooking
);

module.exports = router;
