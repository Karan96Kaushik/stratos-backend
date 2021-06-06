const mongoose = require("mongoose");
const {Users} = require("../models/Users");
const crypto = require("crypto")
mongoose
	.connect('mongodb://karan:karan12345@bayonetbaron.com:27017/tms?authSource=admin', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false
	})
	.then(
		() => {
		  console.log("Database successfully connected!");

		//   let info = {
		// 		password: "karan1996",
		// 		userName: "Karan",
		// 		email: "admin@admin.com",
		//   }
		//   info.password = crypto.createHmac('sha256', "someSalt")
		// 	.update(info.password)
		// 	.digest('hex')
	
		// const save = Users.create({...info, isActive:true});
  
  
		},
		error => {
		  console.log("Database could not connected", error);
		}
	);
