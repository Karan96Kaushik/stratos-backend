const moment = require("moment");
const { Notifications } = require("../models/Notifications");
const { Members } = require("../models/Members");
const { Packages } = require("../models/Packages");
const { Payments } = require("../models/Payments");
const { Tasks } = require("../models/Tasks");

const newTaskAssignedNotification = async (data) => {

	try {
		await Promise.all(data._membersAssigned.map(async mID => {
			try {
				await Notifications.create({
					type:'task',
					text: trimString('New Task Added -' + data.clientName),
					id: data.taskID,
					_memberID: mID
				})
			}
			catch (err) {
				console.error('Error creating notification', err)
			}
		}))
	}
	catch (err) {
		console.error(err)
	}

}

const assignedTaskNotification = async (data, oldData) => {

	try {
		const newAssignedMembers = data._membersAssigned.filter(_mid => !oldData._membersAssigned.find(_m1 => _m1 == _mid))
		const removedMembers = oldData._membersAssigned.filter(_mid => !data._membersAssigned.find(_m1 => _m1 == _mid))

		await Promise.all(newAssignedMembers.map(async mID => {
			try {
				await Notifications.create({
					type:'task',
					text: trimString('Task Assigned - ' + oldData.clientName),
					id: oldData.taskID,
					_memberID: mID
				})
			}
			catch (err) {
				console.error('Error creating notification', err)
			}

		}))

		await Promise.all(removedMembers.map(async mID => {
			try {
				await Notifications.create({
					type:'task',
					text: trimString('Task Unassigned - ' + oldData.clientName),
					id: oldData.taskID,
					_memberID: mID
				})
			}
			catch (err) {
				console.error('Error creating notification', err)
			}

		}))
	}
	catch (err) {
		console.error(err)
	}

}


const newPackageAssignedNotification = async (data) => {

	try {
		await Promise.all(data._rmAssigned.map(async mID => {
			try {
				await Notifications.create({
					type:'package',
					text: trimString('New Package Added - ' + data.clientName),
					id: data.packageID,
					_memberID: mID
				})
			}
			catch (err) {
				console.error('Error creating notification', err)
			}
		}))
	}
	catch (err) {
		console.error(err)
	}

}

const assignedPackageNotification = async (data, oldData) => {

	try {
		const newAssignedMembers = data._rmAssigned.filter(_mid => !oldData._rmAssigned.find(_m1 => _m1 == _mid))
		const removedMembers = oldData._rmAssigned.filter(_mid => !data._rmAssigned.find(_m1 => _m1 == _mid))

		await Promise.all(newAssignedMembers.map(async mID => {
			try {
				await Notifications.create({
					type:'package',
					text: trimString('Package Assigned - ' + oldData.clientName),
					id: oldData.packageID,
					_memberID: mID
				})
			}
			catch (err) {
				console.error('Error creating notification', err)
			}

		}))

		await Promise.all(removedMembers.map(async mID => {
			try {
				await Notifications.create({
					type:'package',
					text: trimString('Package Unassigned - ' + oldData.clientName),
					id: oldData.packageID,
					_memberID: mID
				})
			}
			catch (err) {
				console.error('Error creating notification', err)
			}

		}))
	}
	catch (err) {
		console.error(err)
	}

}

const addedPaymentNotification = async (data) => {
	try {

		let id
		let members = [] 

		if (data.packageID) {
			id = data.packageID
			let pkg = await Packages.findOne({packageID: data.packageID})
			members = pkg._doc._rmAssigned
		} else if (data.taskID) {
			id = data.packageID
			let task = await Tasks.findOne({taskID: data.taskID})
			members = task._doc._membersAssigned
		}

		members = await Members.find({
			_id: {
				$in: members
			}
		})

		await Promise.all(members.map(async m => {
			m = m._doc
			try {
				if (data.packageID && m.activeNotifications.includes('Package RM - Added Payments'))
					await Notifications.create({
						type:'packageaccounts',
						text: trimString('Payment Added - ' + data.clientName),
						id: data.packageID,
						_memberID: m._id
					})
				else if (data.taskID && m.activeNotifications.includes('Assigned Task - Added Payments'))
					await Notifications.create({
						type:'taskaccounts',
						text: trimString('Payment Added - ' + data.clientName),
						id: data.taskID,
						_memberID: m._id
					})
			}
			catch (err) {
				console.error('Error creating notification', err)
			}

		}))

	}
	catch (err) {
		console.error(err)
	}
}

const STR_LEN = 40
const trimString = (st) => st.length > STR_LEN ? st.substring(0,STR_LEN) + '...' : st

module.exports = { 
	assignedPackageNotification, 
	newPackageAssignedNotification, 
	assignedTaskNotification, 
	newTaskAssignedNotification, 
	addedPaymentNotification 
}