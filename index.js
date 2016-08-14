const normalize = require('gl-quat/normalize')
const Component = require('kindred-component')
const toMat3 = require('gl-mat3/from-mat4')
const toQuat = require('gl-quat/fromMat3')
const lookAt = require('gl-mat4/lookAt')
const invert = require('gl-mat4/invert')
const hook = require('./hook')

const scratchQuat = [0, 0, 0, 0]
const scratchMatrix = new Float32Array(16)
const scratchTarget = new Float32Array(3)

module.exports = class TurntableCamera extends Component('turntable-camera') {
  init (node, props) {
    this.node = node
    this.camera = null
    this.props = props || {}
  }

  preDraw (props) {
    if (!this.camera) this.camera = this.createCamera(props.gl)

    this.camera.tick()

    const ro = this.camera.ro
    const rd = this.camera.rd
    scratchTarget[0] = ro[0] + rd[0]
    scratchTarget[1] = ro[1] + rd[1]
    scratchTarget[2] = ro[2] + rd[2]

    // quaternion lookAt
    lookAt(scratchMatrix, this.camera.ro, scratchTarget, this.camera.up)
    invert(scratchMatrix, scratchMatrix)
    toMat3(scratchMatrix, scratchMatrix)
    toQuat(scratchQuat, scratchMatrix)
    normalize(scratchQuat, scratchQuat)

    this.node.setPosition(ro[0], ro[1], ro[2])
    this.node.setRotation(scratchQuat)
  }

  stop () {
    this.camera && this.camera.dispose()
    this.camera = null
    this.node = null
  }

  createCamera (gl) {
    var canvas = gl.canvas
    var camera = hook(canvas, this.props)
    this.props = null
    return camera
  }
}
