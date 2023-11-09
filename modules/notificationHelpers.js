const moment = require("moment");
const { Notifications } = require("../models/Notifications");
const { Members } = require("../models/Members");
const { Packages } = require("../models/Packages");
const { Payments } = require("../models/Payments");
const { Tasks } = require("../models/Tasks");
const { getReadTime, getLastMessageTime, setReadTime } = require("./ticketHelper");
const client = require("../scripts/redisClient");

const newTaskAssignedNotification = async (data) => {

	try {
		await Promise.all(data._membersAssigned.map(async mID => {
			try {
				await Notifications.create({
					type:'task',
					text: trimString('New Task Added - ' + data.clientName),
					id: data.taskID,
					_memberID: mID
				})
				await setLastNotificationTime(mID)
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

const newTicketAssignedNotification = async (data, creator_id) => {

	try {
		await Promise.all(data._membersAssigned.map(async mID => {
			try {
				if (mID == creator_id) return
				await setReadTime(mID, data._id, +new Date - 5000) // Push old time so unread count is not updated for new messages  
				await Members.findOneAndUpdate({ _id: mID }, { $inc: { unread: 1 } }) //, { new: true })
				await Notifications.create({
					type:'tickets',
					text: trimString('Ticket Assigned - ' + data.subject),
					id: data.ticketID,
					_memberID: mID
				})
				await setLastNotificationTime(mID)
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

const newTicketMessageNotification = async (data, message_creater_id) => {

	try {
		const oldMessageTime = await getLastMessageTime(data._id)
		if (!data._membersAssigned?.length)
			return 
		data._membersAssigned.push(data.addedBy)
		data._membersAssigned = [...new Set(data._membersAssigned)].filter(m => String(m) !== String(message_creater_id))

		await Promise.all(data._membersAssigned.map(async mID => {
			try {
				let readTime = await getReadTime(mID, data._id)
				if (!readTime)
					await setReadTime(mID, data._id, +new Date - 2000) // Push old time so unread count is not updated for new messages  
				// console.debug(new Date(oldMessageTime) , new Date(readTime) , oldMessageTime < readTime, "Doing - " + (!oldMessageTime || !readTime || oldMessageTime < readTime))
				if (!oldMessageTime || !readTime || oldMessageTime < readTime) {
					await Members.findOneAndUpdate({ _id: mID }, { $inc: { unread: 1 } }) //, { new: true })
					// console.debug(m)
				}
				await Notifications.create({
					type:'tickets',
					text: trimString('Ticket - New Message - ' + data.subject),
					id: data.ticketID,
					_memberID: mID
				})
				await setLastNotificationTime(mID)
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
				await setLastNotificationTime(mID)
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
				await setLastNotificationTime(mID)
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
				await setLastNotificationTime(mID)
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
				await setLastNotificationTime(mID)
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
				await setLastNotificationTime(mID)
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

		// let id
		let members = [] 

		if (data.packageID) {
			// id = data.packageID
			let pkg = await Packages.findOne({packageID: data.packageID})
			members = pkg._doc._rmAssigned
		} else if (data.taskID) {
			// id = data.taskID
			let task = await Tasks.findOne({taskID: data.taskID})
			members = [...new Set([...task._doc._membersAssigned, ...task._doc._membersAllocated])]
		}

		members = members.filter(m => !m.includes('Department'))

		members = await Members.find({
			_id: {
				$in: members
			}
		})

		await Promise.all(members.map(async m => {
			m = m._doc
			try {
				if (data.packageID && m.activeNotifications.includes('Package RM - Added Payments')) {
					await Notifications.create({
						type:'packageaccounts',
						text: trimString('Payment Added - ' + data.clientName),
						id: data.packageID,
						_memberID: m._id
					})
					await setLastNotificationTime(m._id)
				}
				else if (data.taskID && m.activeNotifications.includes('Assigned Task - Added Payments')) {
					await Notifications.create({
						type:'taskaccounts',
						text: trimString('Payment Added - ' + data.clientName),
						id: data.taskID,
						_memberID: m._id
					})
					await setLastNotificationTime(m._id)
				}
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

const setLastNotificationTime = async (memberID) => {
    try {
        const currTime = +new Date
        // console.debug(String(_memberID), String(ticketID))
        const readTime = await client.hSet('NOTIF', String(memberID), currTime)
        return readTime
    }
    catch (err) {
        console.error(err)
    }
}

const STR_LEN = 35
const trimString = (st) => st.length > STR_LEN ? st.substring(0,STR_LEN) + '...' : st

module.exports = { 
	assignedPackageNotification, 
	newPackageAssignedNotification, 
	assignedTaskNotification, 
	newTaskAssignedNotification, 
	addedPaymentNotification,
	newTicketAssignedNotification,
	newTicketMessageNotification
}