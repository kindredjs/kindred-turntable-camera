var normalize = require('gl-vec3/normalize')
var Cursor = require('touch-position')
var Wheel = require('mouse-wheel')

module.exports = function hook (canvas, props) {
  var camera = {
    lookSpeed: props.lookSpeed || 0.008,
    zoomSpeed: props.zoomSpeed || 0.01,
    moveSpeed: props.moveSpeed || 0.05,
    dragRate: props.dragRate || 0.1,
    distance: props.distance || 5,
    height: props.height || 5,
    forward: new Float32Array([0, 0, 1]),
    up: new Float32Array([0, 1, 0]),
    ro: new Float32Array(3),
    rd: new Float32Array(3),
    dispose: dispose,
    tick: tick
  }

  var touchCount = 0
  var grabbing = false
  var grabStart = false
  var prevPosition = new Float32Array(2)
  var currPosition = [0, 0]
  var currRotation = new Float32Array(2)
  var goalRotation = new Float32Array(2)
  var goalHeight = camera.height

  if (typeof window !== 'undefined') {
    var cursor = Cursor.emitter({ element: canvas })
    setGrab(false)
    currPosition = cursor.position
    canvas.addEventListener('touchstart', touchstart, false)
    canvas.addEventListener('mousedown', touchstart, false)
    canvas.addEventListener('touchmove', touchmove, false)
    window.addEventListener('touchend', touchend, false)
    window.addEventListener('mouseup', touchend, false)

    var onscroll = Wheel(canvas, function (dx, dy) {
      camera.distance = Math.max(0.00001, camera.distance + dy * camera.zoomSpeed)
    }, true)
  }

  return camera

  function touchstart () {
    touchCount++
    grabStart = grabStart || !!setGrab(true)
  }

  function touchmove (e) {
    if (e) e.preventDefault()
  }

  function touchend () {
    touchCount = Math.max(0, touchCount - 1)
    if (touchCount) return
    setGrab(false)
    grabStart = false
  }

  function tick () {
    var dx = currPosition[0] - prevPosition[0]
    var dy = currPosition[1] - prevPosition[1]

    prevPosition[0] = currPosition[0]
    prevPosition[1] = currPosition[1]

    if (grabStart) {
      grabStart = false
      dx = dy = 0
    }

    if (grabbing) {
      goalRotation[0] += dx * camera.lookSpeed
      goalHeight += dy * camera.moveSpeed
    }

    camera.height += (goalHeight - camera.height) * camera.dragRate
    currRotation[0] += (goalRotation[0] - currRotation[0]) * camera.dragRate
    currRotation[1] += (goalRotation[1] - currRotation[1]) * camera.dragRate

    camera.ro[0] = camera.distance * (Math.cos(currRotation[0]) * Math.cos(0))
    camera.ro[1] = camera.height
    camera.ro[2] = camera.distance * (Math.sin(currRotation[0]) * Math.cos(0))

    camera.rd[0] = -camera.ro[0]
    camera.rd[1] = -camera.ro[1]
    camera.rd[2] = -camera.ro[2]
    normalize(camera.rd, camera.rd)
  }

  function setGrab (isGrabbing) {
    if (grabbing === isGrabbing) return

    grabbing = isGrabbing

    if (isGrabbing) {
      canvas.style.cursor = '-webkit-grabbing'
      canvas.style.cursor = '-moz-grabbing'
      canvas.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
      document.body.style.mozUserSelect = 'none'
      document.body.style.webkitUserSelect = 'none'
    } else {
      canvas.style.cursor = '-webkit-grab'
      canvas.style.cursor = '-moz-grab'
      canvas.style.cursor = 'grab'
      document.body.style.userSelect = null
      document.body.style.mozUserSelect = null
      document.body.style.webkitUserSelect = null
    }

    return true
  }

  function dispose () {
    cursor.dispose()
    canvas.style.cursor = null
    canvas.removeEventListener('touchstart', touchstart, false)
    canvas.removeEventListener('mousedown', touchstart, false)
    canvas.removeEventListener('touchmove', touchmove, false)
    window.removeEventListener('touchend', touchend, false)
    window.removeEventListener('mouseup', touchend, false)
    canvas.removeEventListener('wheel', onscroll, false)
  }
}
