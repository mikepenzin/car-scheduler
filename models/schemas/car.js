var mongoose = require('mongoose');

	
var CarSchema = new mongoose.Schema({
	carName: String,
	licensePlate: String,
	model: String,
	numberOfSeats: {
		type: Number, 
		default: 0
	},
	manufactureYear: {
		type: Number, 
		default: 2018
	},
	currentStatus: {
		type: String, 
		default: "occupied"
	},
	isContractor: {
		type: Boolean,
		default: false
	},
	isActive: {
		type: Boolean,
		default: true
	},
	driver: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}
});

module.exports = mongoose.model("Car", CarSchema);