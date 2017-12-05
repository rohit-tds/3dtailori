function modal3d(mainPlugin, objectPath, TexturePath, bumpImagePath, normalImagePath,callback)
{
    var myPrivateVar,_modelObj,_repeat=10,
        _textureLoader,_bbox,_boxWidth,
        _boxHeight,_boxLength,_screenDpi,_activeMesh,
		_radius,_scale;

    this.showSubParts = new Boolean();
    this.showSubParts = false;

    // Create Object Loader to Load Json Model
    var loader = new THREE.ObjectLoader();
    _modelObj = new THREE.Object3D();
    var that = this;

    // fuction returns parent of creating object
    _modelObj.GetParent = function()
    {
        return that;
    };
	
    var obj = loader.parse(objectPath);

    abc = mainPlugin.getComposer();
    var objectName = obj.name;
   
    var texture, bumpmap, normalmap;
    _textureLoader = new THREE.TextureLoader();
    count = 1;
            
	_bbox = new THREE.Box3().setFromObject(obj);
	_boxWidth = (_bbox.max.x - _bbox.min.x);
	_boxHeight = (_bbox.max.y - _bbox.min.y);
	_boxLength = (_bbox.max.z - _bbox.min.z);
	_screenDpi = mainPlugin.getScreenDpi();
			
    if(TexturePath != undefined )
    {
        texture = _textureLoader.load(TexturePath);
        texture.anisotropy = 16;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.format = THREE.RGBFormat;
        texture.needsUpdate = true;
		
		var theImage = new Image();
		theImage.onload = function(){
			
			var imageWidth = theImage.naturalWidth;
			var wdt = _boxWidth * _screenDpi * 2.54;
			var imageHeight = theImage.naturalHeight;
			_repeat = Math.round(wdt / (imageWidth))* 2.54;
		}
		theImage.src = TexturePath;
		
    }
    if(bumpImagePath != undefined){
        bumpmap = _textureLoader.load(bumpImagePath);
        bumpmap.anisotropy = 16;
        bumpmap.wrapS = bumpmap.wrapT = THREE.RepeatWrapping;
        bumpmap.format = THREE.RGBFormat;
        bumpmap.needsUpdate = true;
    }
    if(normalImagePath != undefined){
        normalmap = _textureLoader.load(normalImagePath);
        normalmap.anisotropy = 16;
        normalmap.wrapS = normalmap.wrapT = THREE.RepeatWrapping;
        normalmap.format = THREE.RGBFormat;
        normalmap.needsUpdate = true;
    }
    
	
	
    obj.traverse( function ( child )
    {
        if ( child instanceof THREE.Mesh )
        {
            var ChildGeometry = child.geometry;
          
            //var ObjGeometry = child.geometry;

            var shader = THREE.ShaderSkin[ "skinSimple" ];

            var fragmentShader = shader.fragmentShader;
            var vertexShader = shader.vertexShader;

            var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

            uniforms[ "enableBump" ].value = true;
            uniforms[ "enableSpecular" ].value = true;

            uniforms[ "tBeckmann" ].value = abc.renderTarget1.texture;
            uniforms[ "tDiffuse" ].value = texture;


            uniforms[ "bumpMap" ].value = bumpmap;
            uniforms[ "specularMap" ].value = normalmap; //

            uniforms[ "diffuse" ].value.setHex( 0xa0a0a0 );
            uniforms[ "specular" ].value.setHex( 0xa0a0a0 );

            uniforms[ "uRoughness" ].value = 10.0;
            uniforms["uSpecularBrightness"].value = 0.01; // 1.5

            uniforms[ "bumpScale" ].value = 35.0;
            uniforms["TexReapts"].value = _repeat;

            // get original materials
            //  var materials = new THREE.MeshFaceMaterial(obj.material);

            var Childmaterial = new THREE.ShaderMaterial({
                fragmentShader: fragmentShader,
                vertexShader: vertexShader,
                uniforms: uniforms,
                lights: true
            });
			
			

            Childmaterial.extensions.derivatives = true;

            var mesh = new THREE.Mesh( ChildGeometry, Childmaterial );
            mesh.geometry.uvsNeedUpdate = true;
            mesh.material.needsUpdate = true;
            mesh.magFilter = THREE.NearestFilter;
            mesh.minFilter = THREE.LinearMipMapLinearFilter;
            mesh.position.y = - 130;
			//mesh.scale.set( 3,3,3 );
            mesh.material.side = THREE.DoubleSide;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.name = child.name;
			mesh.meshWidth = child.meshWidth;
			mesh.meshHeight = child.meshHeight;
			
			// _bbox = new THREE.Box3().setFromObject(mesh);
            // _boxWidth = (_bbox.max.x - _bbox.min.x);
            // _boxHeight = (_bbox.max.y - _bbox.min.y);
            // _boxLength = (_bbox.max.z - _bbox.min.z);
			//console.log("mesh width : "+_boxWidth);
			
			mesh.width = _boxWidth;
			mesh.objwidth = boxWidth;
           
            _modelObj.add(mesh);
            count++;
        }

    });
    
    _modelObj.name = objectName;
	var bbox = new THREE.Box3().setFromObject(_modelObj);
    var boxWidth = (bbox.max.x - bbox.min.x);
    var boxHeight = (bbox.max.y - bbox.min.y);
    var boxLength = (bbox.max.z - bbox.min.z);
    //mainPlugin.callAnimate();
	_modelObj.width = boxWidth;
    callback(_modelObj);
		
    var private_stuff = function()   // Only visible inside Restaurant()
    {
        myPrivateVar = "I can set this here!";
		//console.log(myPrivateVar);
    }

    ///////////////////////////////////////
    this.setScale = function(scale)
    {
        //console.log("scale : "+scale);
        var Obj = getObject();
        //console.log(obj);
        Obj.traverse(function (node) {
            if (node.material) {
                node.scale.set(scale, scale, scale);
                node.geometry.uvsNeedUpdate = true;
            }
        });
       // mainPlugin.callAnimate();
    }

    this.setBumpScale = function(scale)
    {
        var Obj = this.getObject()
        Obj.traverse(function (node) {
            if (node.material) {
                node.material.uniforms.bumpScale.value = scale;
            }
        });
       // mainPlugin.callAnimate();
    }

    this.setBrightness = function(scale)
    {
        var Obj = this.getObject();

        Obj.traverse(function (node) {
            if (node.material) {
                node.material.uniforms.uSpecularBrightness.value = value;
            }
        });
        //mainPlugin.callAnimate();
    }

    this.setDiffuseColor = function(HexColor)
    {
        var Obj = this.getObject();

        Obj.traverse(function (node) {
            if (node.material) {
                node.material.uniforms.diffuse.value = HexColor;
            }
        });
        //mainPlugin.callAnimate();
    }

    this.setSpecularColor = function(HexColor)
    {
        var Obj = this.getObject();

        Obj.traverse(function (node) {
            if (node.material) {
                node.material.uniforms.specular.value = HexColor;
            }
        });
       // mainPlugin.callAnimate();
    }



    ////////////////////////////////////////////////////
    this.getObject = function()   // use_restroom is visible to all
    {
		return _modelObj;
    }

	this.setTextureWithPath = function (texturePath,box,IsMeshScale)
	{
		this.IsSelected(false);
		var boxWidth;
		
		if(box == undefined)
			return;
		else
			boxWidth = box.width;
		
		var theImage = new Image();
		theImage.onload = function(){
			
			if(IsMeshScale == undefined){
				var imageWidth = theImage.naturalWidth;
				var wdt = boxWidth * _screenDpi * 2.54;
				var imageHeight = theImage.naturalWidth ;
				_repeat = Math.round(wdt / imageWidth)* 2.54;
				// this._control.repeats = repeat;
				//console.log("repeats:" + _repeat);
			}
			
			///

			_modelObj.traverse(function (node) {
					if (node.material) {
						
							if(IsMeshScale){
								var imageWidth = theImage.naturalWidth;
								var wdt = node.meshWidth * _screenDpi * 2.54;
								var imageHeight = theImage.naturalWidth ;
								_repeat = Math.round(wdt / imageWidth)* 2.54;
								console.log("repeats:" + _repeat);
							}
							//var repeat = node.objwidth / _repeat;
							//var mrepeat = node.width / repeat;
							var Textr = _textureLoader.load(texturePath);
							Textr.anisotropy = 16;
							Textr.image.crossOrigin = '';
							Textr.wrapS = Textr.wrapT = THREE.RepeatWrapping;
							Textr.format = THREE.RGBFormat;
							Textr.needsUpdate = true;
							node.material.uniforms.tDiffuse.value = Textr;//textureLoader.load(texturePath);;
							node.material.uniforms.TexReapts.value = Math.round(_repeat);//_repeat;
							node.material.uniforms.tDiffuse.value.needsUpdate = true;
					}
			});
			//callback();
		};
		theImage.crossOrigin = "anonymous";
		theImage.src = texturePath;
		
		// mainPlugin.callAnimate();
	}

    this.setTextureWithImage = function(image){

      this.IsSelected(false);
      var imageWidth = image.naturalWidth;
      var imageHeight = image.naturalHeight;

      var hRepeats = _boxWidth * _screenDpi * 2.54;
      var Hrepeat = Math.round(hRepeats / imageWidth);

      var vRepeats = _boxHeight * _screenDpi * 2.54;
      var Vrepeat = Math.round(vRepeats / imageHeight);


      _modelObj.traverse(function (node) {
               if (node.material) {
                  that._mesh.material.uniforms.tDiffuse.value.image = image;
                  that._mesh.material.uniforms.bumpMap.value.repeat.set(Hrepeat,Vrepeat);
                  that._mesh.material.uniforms.tDiffuse.value.needsUpdate = true;
               }
              // mainPlugin.callAnimate();
           });
    },
    this.getRepeat = function(){
      return _repeat;
    }

    this.setRepeat = function(repeat){
      _repeat = repeat;
      _modelObj.traverse(function (node) {
          if (node.material) {
                node.material.uniforms.TexReapts.value = _repeat;
                node.material.uniforms.tDiffuse.value.needsUpdate = true;
              }
          });

         // mainPlugin.callAnimate();
    }

    this.IsSelected = function(flag = false){
      //console.log(flag,_activeMesh.toLowerCase());
      if(flag && this.showSubParts){
        console.log("in");
        _modelObj.traverse(function (node) {
            if (node.material) {
              if(node.name.toLowerCase() == _activeMesh.toLowerCase()){
                var diffuse = node.material.uniforms.diffuse.value ;
                diffuse.setHex(0xff5959);
                node.material.uniforms.diffuse.value.needsUpdate = true;
              }
            }
        });
      }else if(flag){
        _modelObj.traverse(function (node) {
            if (node.material) {
                var diffuse = node.material.uniforms.diffuse.value ;
                diffuse.setHex(0xff5959);
                node.material.uniforms.diffuse.value.needsUpdate = true;
            }
        });
      }else{
        _modelObj.traverse(function (node) {
            if (node.material) {
                var diffuse = node.material.uniforms.diffuse.value ;
                diffuse.setHex(0xa0a0a0);
                node.material.uniforms.diffuse.value.needsUpdate = true;
            }
        });
      }
    }

    this.getChildParts = function() {
      var child = [];
      if(_modelObj.children.length > 0){
        _modelObj.traverse(function (node) {
            if (node.material) {
                child.push(node.name);
            }
        });
      }
      return child;
    }

    this.setTextureOnPart = function(texturePath,partName) {
		console.log(partName);
		this.IsSelected(false);
		var theImage = new Image();
		theImage.src = texturePath;
		var imageWidth = theImage.naturalWidth;
		var wdt = _boxWidth * _screenDpi * 2.54;
		var imageHeight = theImage.naturalHeight;
		_repeat = Math.round(wdt / imageWidth);
		// this._control.repeats = repeat;
		//console.log("repeats:" + _repeat);
		///

		_modelObj.traverse(function (node) {
			if (node.material) {
				if(node.name.toLowerCase() == partName.toLowerCase()){
					var Textr = _textureLoader.load(texturePath);
					Textr.anisotropy = 16;
					Textr.wrapS = Textr.wrapT = THREE.RepeatWrapping;
					Textr.format = THREE.RGBFormat;
					Textr.needsUpdate = true;
					node.material.uniforms.tDiffuse.value = Textr;//textureLoader.load(texturePath);;
					node.material.uniforms.TexReapts.value = _repeat;
					node.material.uniforms.tDiffuse.value.needsUpdate = true;
				}
			}
		});
    }

	this.setTextureOnPartWithPartNo = function(texturePath,partNo) {
		console.log(partNo);
		this.IsSelected(false);
		var theImage = new Image();
		theImage.src = texturePath;
		var imageWidth = theImage.naturalWidth;
		var wdt = _boxWidth * _screenDpi * 2.54;
		var imageHeight = theImage.naturalHeight;
		_repeat = Math.round(wdt / imageWidth) * 2.54 ;
		// this._control.repeats = repeat;
		//console.log("repeats:" + _repeat);
		///
		var id = _modelObj.children[Number(partNo)].uuid
		_modelObj.traverse(function (node) {
			if (node.material) {
				if(node.uuid == id){
					var Textr = _textureLoader.load(texturePath);
					Textr.anisotropy = 16;
					Textr.wrapS = Textr.wrapT = THREE.RepeatWrapping;
					Textr.format = THREE.RGBFormat;
					Textr.needsUpdate = true;
					node.material.uniforms.tDiffuse.value = Textr;//textureLoader.load(texturePath);;
					node.material.uniforms.TexReapts.value = _repeat;
					node.material.uniforms.tDiffuse.value.needsUpdate = true;
				}
			}
		});
    }
	
    this.setActiveMesh = function(activeMeshName){
      _activeMesh = activeMeshName;
    }
	
	this.getBoundingBox = function()
    {
        return _bbox;
    }
}
