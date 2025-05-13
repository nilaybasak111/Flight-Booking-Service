const { StatusCodes } = require('http-status-codes');

const info = (req, res) => {
    return res.status(StatusCodes.OK).json({
        success: true,
        message: 'API is live from bookingService',
        error: {},
        data: {},
    });
}

module.exports = {
    info
}