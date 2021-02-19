/*
 * Product    : AQUILA-CMS
 * Author     : Nextsourcia - contact@aquila-cms.com
 * Copyright  : 2021 © Nextsourcia - All rights reserved.
 * License    : Open Software License (OSL 3.0) - https://opensource.org/licenses/OSL-3.0
 * Disclaimer : Do not edit or add to this file if you wish to upgrade AQUILA CMS to newer versions in the future.
 */

const mongoose  = require('mongoose');
const {slugify} = require('../../utils/utils');

const Schema = mongoose.Schema;

const TrademarksSchema = new Schema({
    code   : {type: String, unique: true},
    name   : {type: String, required: true, unique: true},
    active : {type: Boolean, default: true}
}, {timestamps: true});

TrademarksSchema.statics.insertIfNotExists = async function ( trademarkName, cb ) {
    const res = await this.find({name: trademarkName});
    if (res.length === 0) {
        const t               = {name: trademarkName};
        const ModelTrademarks = mongoose.model('trademarks', TrademarksSchema);
        const tm              = new ModelTrademarks(t);
        tm.save();
    }
    cb(trademarkName, res);
};

TrademarksSchema.pre('save', function (next) {
    this.code = slugify(this.name);
    return next();
});

module.exports = TrademarksSchema;