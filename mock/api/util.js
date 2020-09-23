const request = require('request')
function sendRequest (req, res, url) {
  const method = req.method
  const options = {
    method,
    url: url,
    headers: {
      'content-type': 'application/json',
      cookies: req.cookies || ''
    }
  }
  if (method == 'GET') {
    options.qs = req.query
  } else {
    options.body = req.body
  }
  request(options, function (err, response) {
    if (err) {
      res.json(err)
    }
    //   console.log(response);
    if (response && response.statusCode == 200) {
      try {
        const body = JSON.parse(response.body)

        res.json(body)
      } catch (e) {
        //   console.log(e);
      }
    }
  })
}

module.exports = { sendRequest }
