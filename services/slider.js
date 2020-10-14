const path         = require('path');
const mongoose     = require('mongoose');
const {Slider}     = require('../orm/models');
const utils        = require('../utils/utils');
const mediasUtils  = require('../utils/medias');
const NSErrors     = require('../utils/errors/NSErrors');
const QueryBuilder = require('../utils/QueryBuilder');

const restrictedFields = [];
const defaultFields    = [
    '_id', 'name', 'code', 'items', 'accessibility', 'arrows', 'autoplay', 'autoplaySpeed',
    'infinite', 'fade', 'lazyLoad', 'pauseOnHover', 'slidesToShow', 'slidesToScroll', 'speed', 'swipe'
];
const queryBuilder     = new QueryBuilder(Slider, restrictedFields, defaultFields);

// Voir plus d'informations sur react slick: https://react-slick.neostack.com/
const getSliders = async (PostBody) => {
    return queryBuilder.find(PostBody);
};

const getSlider = async (PostBody) => {
    return queryBuilder.findOne(PostBody);
};

const getSliderById = async (id, PostBody = null) => {
    return queryBuilder.findById(id, PostBody);
};

const setSlider = async (req) => {
    const result = await Slider.findByIdAndUpdate(req.body._id, req.body, {new: true});
    if (!result) throw NSErrors.SliderUpdateError;
    return result;
};

const createSlider = async (req) => {
    req.body.code = utils.slugify(req.body.code);
    return Slider.create(req.body);
};

const deleteSlider = async (req) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw NSErrors.UnprocessableEntity;
    const doc = await Slider.findOneAndRemove({_id: req.params.id});
    for (let i = 0; i < doc.items.length; i++) {
        await mediasUtils.deleteFile(doc.items[i].src);
        require('./cache').deleteCacheImage('slider', {filename: path.basename(doc.items[i].src).split('.')[0]});
    }
    if (!doc) throw NSErrors.NotFound;
    return doc;
};

/**
 * @description Retourne le slider dont un item vient d'étre ajouté ou modifié
 * @param _id : _id du slider
 * @param datas : correspond a l'item qui doit être ajouté au slider
 */
const setItemSlider = async (_id, datas) => {
    if (!mongoose.Types.ObjectId.isValid(_id)) throw NSErrors.UnprocessableEntity;
    let result;
    if (datas._id) {
        // Update
        if (!mongoose.Types.ObjectId.isValid(datas._id)) throw NSErrors.UnprocessableEntity;
        result = await Slider.findOneAndUpdate(
            {_id, 'items._id': datas._id},
            {$set: {'items.$': datas}},
            {new: true, runValidators: true}
        );
        if (!result) throw NSErrors.GalleryUpdateError;
    } else {
        // Create
        result = await Slider.findByIdAndUpdate(_id, {$push: {items: datas}}, {new: true, runValidators: true});
    }
    return result;
};

/**
 * @description Retourne le slider dont un item vient d'être supprimé
 * @param _id : _id du slider
 * @param _id_item : id de l'item à supprimer dans le slider
 */
const deleteItemSlider = async (_id, _id_item) => {
    if (!mongoose.Types.ObjectId.isValid(_id) || !mongoose.Types.ObjectId.isValid(_id_item)) {
        throw NSErrors.UnprocessableEntity;
    }
    const slider = await Slider.findOne({_id});
    const doc    = await Slider.findByIdAndUpdate(_id, {$pull: {items: {_id: _id_item}}}, {new: true});
    if (!doc) throw NSErrors.NotFound;
    const item = slider.items.find((i) => i.id === _id_item);
    await mediasUtils.deleteFile(item.src);
    require('./cache').deleteCacheImage('slider', {filename: path.basename(item.src).split('.')[0]});
    return doc;
};

module.exports = {
    getSliders,
    getSlider,
    getSliderById,
    setSlider,
    createSlider,
    deleteSlider,
    setItemSlider,
    deleteItemSlider
};