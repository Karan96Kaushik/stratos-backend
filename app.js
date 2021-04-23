const mongoose = require("mongoose");

mongoose
  .connect(config.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(
    () => {
      console.log("[Project] Database successfully connected!");
    },
    error => {
      console.log("[Project] Database could not connected", error);
    }
  );
