const mongoose = require("mongoose");

mongoose
	.connect('mongodb://karan:karan12345@bayonetbaron.com:27017/?authSource=admin', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false
	})
	.then(
		() => {
		  console.log("Database successfully connected!");
		},
		error => {
		  console.log("Database could not connected", error);
		}
	);
