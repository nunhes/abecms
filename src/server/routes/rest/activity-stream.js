import {
  abeExtend
} from '../../../cli'

var eventOnActivity = function(data) {
  this.write('data: {\n')
  var i = 0
  var size = Object.keys(data).length
  Array.prototype.forEach.call(Object.keys(data), (key) => {
    i++
    if (size == i) {
      this.write('data: "' + key + '": "' + data[key] + '"\n')
    }else {
      this.write('data: "' + key + '": "' + data[key] + '",\n')
    }
  })
  this.write('data: }\n\n')
}

var count = 0
var route = function(req, res) {
  // if event-stream
  if (req.accepts('text/event-stream')) {
    // Approximately 24 days...
    req.socket.setTimeout(0x7FFFFFFF);
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    })

    let evt = eventOnActivity.bind(res)
    res.app.on("activity-stream", evt)

    res.write('data: {\n')
    res.write(`data: "msg": "open"\n`)
    res.write('data: }\n\n')

    req.connection.addListener("close", function () {
      res.app.removeListener("activity-stream", evt)
    }, false);

  } else { // if get
    var result = {
      success: 0,
      msg: 'no event-stream configured'
    }
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  }
}

export default route