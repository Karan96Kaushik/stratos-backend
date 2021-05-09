const credentials = {
    apiKey: '95a0057a853c8d92eb32ec0b6aaeb4b94a50fa9a2e357687c4317c2229f273c9',         // use your sandbox app API key for development in the test environment
    // apiKey: 'c338c2d3952c2df14276eea998096e2351686b2e17a98e588e289cddca3b3ff1',         // use your sandbox app API key for development in the test environment
    // username: 'karankshk96@gmail.com',      // use 'sandbox' for development in the test environment
    username: 'sandbox',      // use 'sandbox' for development in the test environment
    // username: 'Backend',      // use 'sandbox' for development in the test environment
};

const Africastalking = require('africastalking')(credentials);

// Initialize a service e.g. SMS
const sms = Africastalking.SMS

// Use the service
const options = {
    to: ['+919990009329'],
    message: "I'm a lumberjack and its ok, I work all night and sleep all day"
}

// Send message and capture the response or error
sms.send(options)
    .then( response => {
        console.log(JSON.stringify(response));
    })
    .catch( error => {
        console.log(error);
    });