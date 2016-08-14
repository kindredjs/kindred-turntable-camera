const Render = require('kindred-renderer')
const Geom = require('kindred-geometry')
const icosphere = require('icosphere')
const Plane = require('./plane')
const Node = require('kindred-node')
const Turntable = require('./')

const scene = Node()
const plane = Plane()
const camera = Node().use(Turntable, { distance: 15 })
const origin = Node({ scale: 2 }).use(Render, {
  shader: require('kindred-core-shaders/normal'),
  geometry: Geom(icosphere(1)).attrFaceNormals()
})

scene.add(origin.add(camera), plane)
scene.loop(function (gl, width, height) {
  origin.setPosition(Math.sin(Date.now() / 10000) * 50, 3, 0)
  origin.setEuler(0, Date.now() / 3000, 0)

  scene.step()
  scene.tick()
  scene.draw(gl, camera)
})
