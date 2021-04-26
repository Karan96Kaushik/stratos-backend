const messagebird = require('messagebird')('XegHwAQ2UpoxA4gZ7Tyv43ico', null, [
    'ENABLE_CONVERSATIONSAPI_WHATSAPP_SANDBOX',
  ]);
  messagebird.conversations.reply(
    '3be10ef7bd104d3ba979a967d9235af5',
    {
      type: 'text',
      content: {
        text: 'fweefewfewfewewf',
      },
    },
    function(err, response) {
      if (err) {
        return console.log(err);
      }
      console.log(response);
    },
  );
  