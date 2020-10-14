const moment                      = require('moment-business-days');
const {authentication, adminAuth} = require('../middleware/authentication');
const ServiceStatistics           = require('../services/statistics');

module.exports = function (app) {
    app.get('/v2/statistics/globale',              authentication, adminAuth, getGlobaleStats);
    app.get('/v2/statistics/sell/canceledCart',    authentication, adminAuth, getCanceledCart);
    app.get('/v2/statistics/sell/cag',             authentication, adminAuth, getCag);
    app.get('/v2/statistics/sell/capp',            authentication, adminAuth, getCapp);
    app.get('/v2/statistics/sell/nbOrder',         authentication, adminAuth, getNbOrder);
    app.get('/v2/statistics/customer/newCustomer', authentication, adminAuth, getNewCustomer);
    app.get('/v2/statistics/customer/topCustomer', authentication, adminAuth, getTopCustomer);
    app.post('/v2/statistics/generate',            authentication, adminAuth, generateStatistics);
};

/**
 * POST /v2/statistics/generate
 * @tags Statistics
 * @summary Generate Statistics file (admin)
 */
async function generateStatistics(req, res, next) {
    try {
        const result = await ServiceStatistics.generateStatistics(req.body);
        return res.json(result);
    } catch (error) {
        return next(error);
    }
}

/**
 * GET /api/v2/statistics/globale
 * @tags Statistics
 * @summary Getting Globale Stats (accueil admin)
 */
async function getGlobaleStats(req, res, next) {
    try {
        const result = await ServiceStatistics.getGlobaleStats();
        return res.json(result);
    } catch (error) {
        return next(error);
    }
}

/**
 * GET /api/v2/statistics/sell/canceledCart
 * @tags Statistics
 * @summary Number of abandoned cart
 */
async function getCanceledCart(req, res, next) {
    try {
        const {periodeStart, periodeEnd} = convertDate(req.query.dateStart, req.query.dateEnd);
        const result                     = await ServiceStatistics.getCanceledCart(req.query.granularity, periodeStart, periodeEnd);
        return res.json(result);
    } catch (error) {
        return next(error);
    }
}

/**
 * GET /api/v2/statistics/sell/cag
 * @tags Statistics
 * @summary Global profit
 */
async function getCag(req, res, next) {
    try {
        const {periodeStart, periodeEnd} = convertDate(req.query.dateStart, req.query.dateEnd);
        const result                     = await ServiceStatistics.getCag(req.query.granularity, periodeStart, periodeEnd);
        return res.json(result);
    } catch (error) {
        return next(error);
    }
}

/**
 * GET /api/v2/statistics/sell/capp
 * @tags Statistics
 * @summary Profit by products
 */
async function getCapp(req, res, next) {
    try {
        const {periodeStart, periodeEnd} = convertDate(req.query.dateStart, req.query.dateEnd);
        const result                     = await ServiceStatistics.getCapp(req.query.granularity, periodeStart, periodeEnd);
        return res.json(result);
    } catch (error) {
        return next(error);
    }
}

/**
 * GET /api/v2/statistics/sell/nbOrder
 * @tags Statistics
 * @summary Number of orders
 */
async function getNbOrder(req, res, next) {
    try {
        const {periodeStart, periodeEnd} = convertDate(req.query.dateStart, req.query.dateEnd);
        const result                     = await ServiceStatistics.getNbOrder(req.query.granularity, periodeStart, periodeEnd);
        return res.json(result);
    } catch (error) {
        return next(error);
    }
}

/**
 * GET /api/v2/statistics/customer/topCustomer
 * @tags Statistics
 * @summary Getting top customers stats
 */
async function getTopCustomer(req, res, next) {
    try {
        const {periodeStart, periodeEnd} = convertDate(req.query.dateStart, req.query.dateEnd);
        const result                     = await ServiceStatistics.getTopCustomer(req.query.granularity, periodeStart, periodeEnd);
        return res.json(result);
    } catch (error) {
        return next(error);
    }
}

/**
 * GET /api/v2/statistics/customer/newCustomer
 * @tags Statistics
 * @summary Getting new customers stats
 */
async function getNewCustomer(req, res, next) {
    try {
        const {periodeStart, periodeEnd} = convertDate(req.query.dateStart, req.query.dateEnd);
        const result                     = await ServiceStatistics.getNewCustomer(req.query.granularity, periodeStart, periodeEnd);
        return res.json(result);
    } catch (error) {
        return next(error);
    }
}

// Return "moment" date
function convertDate(dateStart, dateEnd) {
    const periodeStart = moment(dateStart, 'YYYY-MM-DD');
    const periodeEnd   = moment(dateEnd, 'YYYY-MM-DD');

    return {periodeStart, periodeEnd};
}