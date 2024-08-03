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
    gl_Position = u_matrixP * u_matrixV * u_matrixM * vec4 (a_position, 1);
}

#endif
#ifdef FRAGMENT_SHADER
// ------------------------------------------------------//
// ----------------- Fragment SHADER --------------------//
// ------------------------------------------------------//

precision highp float; // float precision settings
uniform vec3 u_tint;            // the tint color of this object
uniform vec3 u_pointLightPos;   // position of the point light in world space
uniform vec3 u_pointLightColor; // color of the point light
uniform float u_pointLightStrength; // strength of the point light
uniform vec3 u_ambientColor;    // intensity of ambient light
varying vec3 v_normal;  // normal from the vertex shader
varying vec2 v_texcoord;

uniform sampler2D u_mainTex;
varying vec4 v_fragmentWorldPosition;

void main(void){
    vec3 normal = normalize(v_normal);
    vec3 lightDirection = normalize(u_pointLightPos - v_fragmentWorldPosition.xyz);

    float constant = 1.0;
    float linear = 0.09;
    float quadratic = 0.032;
    float distance = length(u_pointLightPos - v_fragmentWorldPosition.xyz);
    float attenuation = 1.0 / (constant + linear * distance + quadratic * (distance * distance));

    // calculate diffuse reflection
    float diffuse = max(0.0, dot(normal, lightDirection));
    vec3 diffuseColor = u_pointLightColor * diffuse * u_pointLightStrength * attenuation;

    // combine ambient and diffuse reflection
    vec3 ambientDiffuse = u_ambientColor + diffuseColor;

    vec3 textureColor = texture2D(u_mainTex, v_texcoord).rgb;
    vec3 baseColor = textureColor * u_tint;

    // final color with lighting
    vec3 finalColor = ambientDiffuse * baseColor;
    gl_FragColor = vec4(finalColor, 1.0);
}

#endif

