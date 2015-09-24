module.exports = {
  healthcheck: function (req, res) {
    var everything_is_cool = true; //TODO: compute me

    if (everything_is_cool) {
      res.status(200); //Only 200 is considered healthy
    }
    else {
      res.status(417); //HTTP code 417 = Expectation Failed
    }
    return res.send();
  }
};
