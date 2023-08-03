const moment = require("moment");
const { Notifications } = require("../models/Notifications");
const { Members } = require("../models/Members");

const newTaskAssignedNotification = async (data) => {

	try {
		await Promise.all(data._membersAssigned.map(async mID => {
			try {
				await Notifications.create({
					type:'task',
					text: 'New Task Added',
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
					text: 'New Task Assigned',
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
					text: 'Task Unassigned',
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

module.exports = { assignedTaskNotification, newTaskAssignedNotification }