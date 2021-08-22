const mongoose = require("mongoose");
const {Clients} = require("../models/Clients");
const crypto = require("crypto");
const {Utils} = require("../models/Utils");
mongoose
	.connect('mongodb://karan:karan12345@bayonetbaron.com:27017/tms?authSource=admin', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false
	})
	.then(async () => {
		  console.log("Database successfully connected!");

		//   let info = {
		// 		clientID: 0,
		// 		agentRegistrationID: 0,
		// 		projectRegistrationID: 0,
		// 		// userName: "Karan",
		// 		// email: "admin@admin.com",
		//   }
		//   info.password = crypto.createHmac('sha256', "someSalt")
		// 	.update(info.password)
		// 	.digest('hex')
	
		// const save = Utils.create({...info});
		
		// const save = await Clients.updateMany({clientType:"litigation"}, {clientType:"Litigation"});

		// console.log(save)
  
  
		},
		error => {
		  console.log("Database could not connected", error);
	});
