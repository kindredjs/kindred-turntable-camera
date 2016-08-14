const Render = require('kindred-renderer')
const Geom = require('kindred-geometry')
const Shader = require('kindred-shader')
const Plane = require('primitive-plane')
const Node = require('kindred-node')

module.exports = create

function create () {
  return Node().use(Render, props)
}

const props = {
  geometry: Geom(PlaneMesh()),
  shader: Shader`
    #extension GL_OES_standard_derivatives : enable
    precision highp float;

    #pragma glslify: aastep = require('glsl-aastep')
    #pragma glslify: pi = require('glsl-pi')

    attribute vec3 position;

    varying vec3 vPos;

    uniform mat4 uProj;
    uniform mat4 uView;
    uniform mat4 uModel;

    void vert() {
      vPos = position;
      gl_Position = uProj * uView * uModel * vec4(position, 1.0);
    }

    void frag() {
      float mag = aastep(0.0, sin(vPos.x * pi / 10.0) * sin(vPos.z * pi / 10.0));
      vec3 color = mix(vec3(0.15), vec3(0.2), mag);
      gl_FragColor = vec4(color, 1.0);
    }
  `
}

function PlaneMesh () {
  var mesh = Plane(1000, 1000, 2, 2)
  var pos = mesh.positions
  var cel = mesh.cells

  for (var i = 0; i < pos.length; i++) {
    var p = pos[i]
    var t = p[2]
    p[2] = p[1]
    p[1] = t
  }

  for (var i = 0; i < cel.length; i += 2) {
    var c = cel[i]
    var t = c[0]
    c[0] = c[1]
    c[1] = t
  }

  return mesh
}
