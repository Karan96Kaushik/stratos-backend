const onBoardingMail = (data) => {
    // console.log(data)
    return ["Welcome to Rentika", `
        <h3>Rentika</h3>
        <p><b>Hi ${data.userName}</b>,<br>
            Welcome to <b>Rentika</b>!
        </p>

        <p>Thanks, <br>
            Rentika Team
        </p>
    `]
}

module.exports = onBoardingMail