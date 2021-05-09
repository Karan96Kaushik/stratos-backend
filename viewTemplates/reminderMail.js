const reminderMail = (data) => {
    // console.log(data)
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];;
    const today = new Date();
	currentMonth = months[today.getMonth()]

    return ["Rent Reminder", `
        <h3>Rentika</h3>
        <p><b>Hi ${data.firstName}</b>,<br>
            This is a Rent reminder for House number ${data.property} for the month of ${currentMonth}.<br>
            Total due is Ksh.${data.rent}/-
        </p>
        <p>If this email is a mistake, please get in touch with Rentika Support.</p>

        <p>Thanks, <br>
            Rentika Team
        </p>
    `]
}

module.exports = reminderMail