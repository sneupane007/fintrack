function currTime() {
  var currentdate = new Date();
  var time =
    currentdate.getDay() +
    "/" +
    currentdate.getMonth() +
    "/" +
    currentdate.getFullYear() +
    " @ " +
    currentdate.getHours() +
    ":" +
    currentdate.getMinutes() +
    ":"

  return time;
}

module.exports = { currTime };
