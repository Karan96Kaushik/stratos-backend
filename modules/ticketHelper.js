const client = require("../scripts/redisClient")

const getAllReadTime = async (_memberID) => {
    try {
        // console.debug(String(_memberID))
        const readTimes = await client.hGetAll('TKS-' + String(_memberID))
        return readTimes
    }
    catch (err) {
        console.error(err)
    }
}

const setReadTime = async (_memberID, ticketID, time=+new Date) => {
    try {
        // console.debug('TKS-' + String(_memberID), String(ticketID))
        await client.hSet('TKS-' + String(_memberID), String(ticketID), time)
    }
    catch (err) {
        console.error(err)
    }
}

const getReadTime = async (_memberID, ticketID) => {
    try {
        // console.debug('TKS-' + String(_memberID), String(ticketID))
        const readTime = await client.hGet('TKS-' + String(_memberID), String(ticketID))
        return Number(readTime)
    }
    catch (err) {
        console.error(err)
    }
}

const setLastMessageTime = async (ticketID) => {
    try {
        const currTime = +new Date
        // console.debug(String(_memberID), String(ticketID))
        const readTime = await client.hSet('MSG', String(ticketID), currTime)
        return readTime
    }
    catch (err) {
        console.error(err)
    }
}

const getLastMessageTime = async (ticketID) => {
    try {
        // console.debug(String(_memberID), String(ticketID))
        const msgTime = await client.hGet('MSG', String(ticketID))
        return Number(msgTime)
    }
    catch (err) {
        console.error(err)
    }
}

module.exports = {
    setReadTime,
    getAllReadTime,
    getReadTime,
    setLastMessageTime,
    getLastMessageTime,
}