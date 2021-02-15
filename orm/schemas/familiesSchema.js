/*
 * Product    : AQUILA-CMS
 * Author     : Nextsourcia - contact@aquila-cms.com
 * Copyright  : 2021 © Nextsourcia - All rights reserved.
 * License    : Open Software License (OSL 3.0) - https://opensource.org/licenses/OSL-3.0
 * Disclaimer : Do not edit or add to this file if you wish to upgrade AQUILA CMS to newer versions in the future.
 */

const mongoose = require('mongoose');
const helper   = require('../../utils/utils');
const Schema   = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const FamiliesSchema = new Schema({
    code      : {type: String, required: true, unique: true},
    name      : {type: String, required: true},
    type      : {type: String, required: true, enum: ['universe', 'family', 'subfamily']},
    ancestors : [{code: String, slug: String}],
    slug      : {type: String, unique: true},
    parent    : {type: ObjectId, ref: 'families'}, // Servira dans un futur plus ou moins proche
    children  : [{type: ObjectId, ref: 'families'}],
    details   : {}
}, {timestamps: true});

// FamiliesSchema.plugin(autoIncrement.plugin, { model: 'families', field: 'id' });

FamiliesSchema.pre('save', function (next) {
    if (!this.slug) this.slug = `${helper.slugify(this.name)}-${this.code}`;
    return next();
});

/*
FamiliesSchema.post('save', function () {
  helper.create_ancestors(this._id, this.parent);
});
*/

// Add menu in a family, and add this menu to all products assigned to this universe
// familyCode : families.code
// slugMenu : menus.slug
FamiliesSchema.statics.addMenuInUniverse = async function ( familyCode, slugMenu ) {
    const {Products} = require('../models');

    // Add menu in family
    const f = await this.findOne({code: familyCode});
    if ( f.menus === undefined) f.menus = [];
    if ( f.menus.indexOf(slugMenu) === -1) {
        f.menus.push(slugMenu);
        await f.save();
    }
};

// Remove menu from a family, and remove this menu from all products assigned to this universe
// familyCode : families.code
// slugMenu : menus.slug
FamiliesSchema.statics.removeMenuFromUniverse = async function (familyCode, slugMenu) {
    const {Products} = require('../models');

    // Remove menu from family
    const f           = await this.findOne({code: familyCode});
    const indexOfSlug = f.menus.indexOf(slugMenu);
    if ( f.menus !== undefined && (indexOfSlug > -1) ) {
        console.log(`removing ${slugMenu} from family ${familyCode}`);
        f.menus.splice(indexOfSlug, 1);
        await f.save();
    }
};

module.exports = FamiliesSchema;