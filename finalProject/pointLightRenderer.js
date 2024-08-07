"use strict";

class PointLightRenderer{

    /**
    * Creates a new instance of Renderer. The given source code will be compiled
    * and assembled into a WebGL ShaderProgram used by this shader to draw models.
    * @param {string} shaderName the source code (text) of this shader programs shader.
    */
	constructor(shaderName){
		this.program = GLUtils.createShaderProgram(shaderName);
	}

    /**
    * Draws a model using this Renderers ShaderProgram.
    * @param {ModelTransform} model the model to draw.
    * @param {Object} shaderData whatever other data the ShaderProgram needs for drawing.
    */
    drawModel(model, camera, shaderData){

        // don't draw if the model hasn't been fully loaded yet (vertex count is 0)
        if(model.mesh.indexCount === 0) return;

        // activate this shader program
        gl.useProgram(this.program);

        // set the arrtibute arrays and uniform data for this programs vertex and
        // fragment shader based on the models buffer data and material
        this.setVertexAttributeArrays(model);
        this.setUniformData(model, camera, shaderData);

        // draw call using index based triangle assembly (elements)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.mesh.bufIndex);
        gl.drawElements(model.mesh.drawMode, model.mesh.indexCount, gl.UNSIGNED_SHORT, 0);

        return this;
	}

    /**
    * Sets ALL attributes for the vertex shader of this renderers shader program before drawing.
    * @param {ModelTransform} model the model to draw.
    */
    setVertexAttributeArrays(model){
        // position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.positionBuffer);
        let posAttribLoc = gl.getAttribLocation(this.program, "a_position");
        gl.enableVertexAttribArray(posAttribLoc);
        gl.vertexAttribPointer(posAttribLoc,3,gl.FLOAT,false,0,0);

        // normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.normalBuffer);
        let normalAttribLoc = gl.getAttribLocation(this.program, "a_normal");
        gl.enableVertexAttribArray(normalAttribLoc);
        gl.vertexAttribPointer(normalAttribLoc,3,gl.FLOAT,false,0,0);

        //TODO: Link up texcoord-buffer (model.mesh.texcoordBuffer) and
        // a_texcoord attribute in vertex shader. See normal and position setup
        // above for reference.
        gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.texcoordBuffer);
        let texcoordAttribLoc = gl.getAttribLocation(this.program, "a_texcoord");
        gl.enableVertexAttribArray(texcoordAttribLoc);
        gl.vertexAttribPointer(texcoordAttribLoc,2,gl.FLOAT,false,0,0);
    }

    /**
    * Sets ALL uniforms for the vertex and fragment shader of this renderers shader program before drawing.
    * @param {ModelTransform} model the model to draw.
    * @param {Object} shaderData whatever other data the Shader needs for drawing.
    */
setUniformData(model, camera, shaderData) {
    let viewMatrix = camera.viewMatrix;
    let projectionMatrix = camera.projectionMatrix;

    // Set model, view, and projection matrices in the vertex shader
    let modelMatrixLoc = gl.getUniformLocation(this.program, "u_matrixM");
    gl.uniformMatrix4fv(modelMatrixLoc, false, model.modelMatrix.toFloat32());
    let viewMatrixLoc = gl.getUniformLocation(this.program, "u_matrixV");
    gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix.toFloat32());
    let projMatrixLoc = gl.getUniformLocation(this.program, "u_matrixP");
    gl.uniformMatrix4fv(projMatrixLoc, false, projectionMatrix.toFloat32());

    // Set tint color data
    let colorLoc = gl.getUniformLocation(this.program, "u_tint");
    gl.uniform3fv(colorLoc, model.material.tint.toFloat32());

    // Set model inverse transpose to enable lighting calculations using normals
    let invtransLoc = gl.getUniformLocation(this.program, "u_matrixInvTransM");
    gl.uniformMatrix3fv(invtransLoc, false, M4.inverseTranspose3x3(model.modelMatrix).toFloat32());

    // Point light data for fragment shader
    let pointLightPosLoc = gl.getUniformLocation(this.program, "u_pointLightPos");
    gl.uniform3fv(pointLightPosLoc, shaderData.lightingData.pointLightPos.toFloat32());

    let pointLightColLoc = gl.getUniformLocation(this.program, "u_pointLightColor");
    gl.uniform3fv(pointLightColLoc, shaderData.lightingData.pointLightColor.toFloat32());

    let pointLightStrengthLoc = gl.getUniformLocation(this.program, "u_pointLightStrength");
    gl.uniform1f(pointLightStrengthLoc, shaderData.lightingData.pointLightStrength);

    // Ambient color remains the same
    let ambColLoc = gl.getUniformLocation(this.program, "u_ambientColor");
    gl.uniform3fv(ambColLoc, shaderData.lightingData.ambientColor.toFloat32());

    // Texturing
    gl.activeTexture(gl.TEXTURE0);

    let mainTexture = TextureCache[model.material.mainTexture];
    gl.bindTexture(gl.TEXTURE_2D, mainTexture);

    let maintexLoc = gl.getUniformLocation(this.program, "u_mainTex");
    gl.uniform1i(maintexLoc, 0);
}
  
}
