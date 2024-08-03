#ifdef VERTEX_SHADER
// ------------------------------------------------------//
// ----------------- VERTEX SHADER ----------------------//
// ------------------------------------------------------//

attribute vec3 a_position; // the position of each vertex
attribute vec3 a_normal;   // the surface normal of each vertex
attribute vec2 a_texcoord;

uniform mat4 u_matrixM; // the model matrix of this object
uniform mat4 u_matrixV; // the view matrix of the camera
uniform mat4 u_matrixP; // the projection matrix of the camera
uniform mat3 u_matrixInvTransM;
varying vec3 v_normal;    // normal to forward to the fragment shader
varying vec2 v_texcoord;

varying vec4 v_fragmentWorldPosition;

void main() {
    v_normal = normalize(u_matrixInvTransM * a_normal); // set normal data for fragment shader
    v_texcoord = a_texcoord;
    v_fragmentWorldPosition = u_matrixM * vec4(a_position, 1.0);
    gl_Position = u_matrixP * u_matrixV * u_matrixM * vec4(a_position, 1);
}

#endif

#ifdef FRAGMENT_SHADER
// ------------------------------------------------------//
// ----------------- Fragment SHADER --------------------//
// ------------------------------------------------------//

precision highp float; // float precision settings
uniform vec3 u_tint; // the tint color of this object
uniform sampler2D u_mainTex;
varying vec2 v_texcoord;

const float brightness = 2.0;

void main(void) {
    vec3 textureColor = texture2D(u_mainTex, v_texcoord).rgb;
    vec3 baseColor = textureColor * u_tint * brightness;
    
    // Output the texture color without lighting
    gl_FragColor = vec4(baseColor, 1.0);
}

#endif
