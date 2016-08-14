const test = require('tape')
const Node = require('kindred-node')
const Turntable = require('./')

const gl = require('gl')(500, 300)
gl.canvas = gl.canvas || {}
gl.canvas.width = 500
gl.canvas.height = 500

test('kindred-turntable-component: no parent', function (t) {
  const camera = Node().use(Turntable, { distance: 15 })
  const scene = Node()

  camera.component(Turntable).preDraw({ gl: gl })
  scene.step()

  t.doesNotThrow(function () {
    scene.draw(gl, camera)
  }, 'safely runs if camera does not have a parent')

  t.end()
})
