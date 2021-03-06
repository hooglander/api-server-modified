'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');

const mongoHost = process.env.MONGO_HOST || 'localhost';
const mongoPort = process.env.MONGO_PORT || '27017';

let db;

let restaurantSchema = new mongoose.Schema({
    id: { type: Number, index: true, unique: true },
    address: String,
    phone_number: String,
    location: {lat: Number, lng: Number},
    icon: String,
    name: String,
    opening_hours: [String],
    price_level: Number,
    rating: Number,
    google_maps_url: String,
    website: String,
    photo: String
});
const Restaurant = mongoose.model('restaurants', restaurantSchema);

const connect = async () => {
    try {
        await mongoose.connect(`mongodb://${mongoHost}:${mongoPort}/viaplay`, {useNewUrlParser: true});
        return mongoose.connection;
    } catch( error ) {
        console.log(`Cannot connect to the mongo db: ${error}`);
    }
};

const getAll = async (name, /*price_level,*/ rating) => {
	/*const findParams = {
		...((name? true: false) && {"name": {$regex: name, $options: i}}),
		...((price_level? true: false) && {"price_level": price_level}),
		...((rating? true: false) && {"rating": {$gte: rating}})
	}*/
	var findParams = {};
	if(name) {
		const regex = new RegExp(name, 'i');
		findParams["name"] = {$regex: regex}
	}
	if(rating) {
		findParams["rating"] = {$gte: rating};
	}
	
	/*console.log('NAME IS ', name);
	console.log('RATING IS ', rating);*/
	/*console.log('FINDPARAMS NAME IS',findParams.name);
	console.log('FINDPARAMS PRICE_LEVEL IS',findParams.price_level);
	console.log('FINDPARAMS RATING IS',findParams.rating);*/
    try {
        if(!db) db = await connect();
        const results = await Restaurant.find(findParams).exec();
        return results.map(restaurant => _.pick(restaurant, ['id', 'name', 'price_level', 'rating', 'location', 'photo']));
    } catch(error) {
        console.log(`Cannot fetch all from db: ${error}`);
    }
};

const getOne = async (id) => {
    try {
        if(!db) db = await connect();
        return await Restaurant.findOne({id}).exec();
    } catch(error) {
        console.log(`Cannot fetch restaurant with id: ${id} from db: ${error}`);
    }
};

module.exports = {
    getAll,
    getOne
}
