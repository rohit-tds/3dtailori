/*
 * jQuery tds.textronic plugin
 * Original Author:  @ Rohit Ghadigaonkar
 * Further Changes, comments:
 * Licensed under the Textronics Design System pvt.ltd.
 */

;(function(window, $){
	"use strict";

	var Plugin = function(element, options){
		this.element = element;
		this.$element = $(element);
		this.options = options;
		this.metadata = this.$element.data('plugin-options');
		this.init();
    };

	var _scene,_camera, _controls, _directionalLight,
		_dirLight1,_dirLight2,_dirLight3,
		_renderer,_composerBeckmann,_repeatCtrl,
	    _imgSource, _$imgSource, _selectedModel, _modals = [],
		_that, _keySize, _ivSize, _iterations,
		_getImageData,_imgData,IsBbox=true,
		_bbox = {
				"min" : {"x":0,"y":0,"z":0},
				"max" :	{"x":0,"y":0,"z":0},
				"width":0.0,
				"height":0.0,
				"length":0.0,
				"center":{"x":0,"y":0,"z":0}
				};

  Plugin.prototype = {

	_ProductData : [],
	_RenderObject : new Object,
	_CurrentContrastKey : "",
	_CurrentDetailId : "",
	_Swatch : "",

    defaults: {
		Product : "Men-Shirt",
		ServiceUrl : "http://localhost:8181",
		Key : "2532772400",
		ImgSource : "",
		ProductTemplate : "",
		IsOptionVisible : false,
    },
    init: function() {
		this.config = $.extend({}, this.defaults, this.options, this.metadata);
		this.pluginLoader(); // Load all required js files
		return this;
    },
		pluginLoader : function(){
			var that = this;
			$.getScript(that.Option("ServiceUrl")+"/js/three.js", function(data, textStatus, jqxhr) {
			    console.log(textStatus);
					$.getScript(that.Option("ServiceUrl")+"/js/OBJLoader.js", function(data, textStatus, jqxhr) {
					    console.log(textStatus);
							$.getScript(that.Option("ServiceUrl")+"/js/MTLLoader.js", function(data, textStatus, jqxhr) {
							    console.log(textStatus);
									$.getScript(that.Option("ServiceUrl")+"/js/DDSLoader.js", function(data, textStatus, jqxhr) {
									    console.log(textStatus);
											$.getScript(that.Option("ServiceUrl")+"/js/Detector.js", function(data, textStatus, jqxhr) {
											    console.log(textStatus);
													$.getScript(that.Option("ServiceUrl")+"/js/OrbitControls.js", function(data, textStatus, jqxhr) {
													    console.log(textStatus);
															$.getScript(that.Option("ServiceUrl")+"/js/ShaderSkin.js", function(data, textStatus, jqxhr) {
															    console.log(textStatus);
																	$.getScript(that.Option("ServiceUrl")+"/js/CopyShader.js", function(data, textStatus, jqxhr) {
																	    console.log(textStatus);
																			$.getScript(that.Option("ServiceUrl")+"/js/EffectComposer.js", function(data, textStatus, jqxhr) {
																			    console.log(textStatus);
																					$.getScript(that.Option("ServiceUrl")+"/js/RenderPass.js", function(data, textStatus, jqxhr) {
																					    console.log(textStatus);
																							$.getScript(that.Option("ServiceUrl")+"/js/ShaderPass.js", function(data, textStatus, jqxhr) {
																							    console.log(textStatus);
																									$.getScript(that.Option("ServiceUrl")+"/js/MaskPass.js", function(data, textStatus, jqxhr) {
																									    console.log(textStatus);
																											$.getScript(that.Option("ServiceUrl")+"/js/MaskPass.js", function(data, textStatus, jqxhr) {
																											    console.log(textStatus);
																													$.getScript(that.Option("ServiceUrl")+"/js/Projector.js", function(data, textStatus, jqxhr) {
																															console.log(textStatus);
																															$.getScript(that.Option("ServiceUrl")+"/js/dat.gui.min.js", function(data, textStatus, jqxhr) {
																																console.log(textStatus);
																																	$.getScript(that.Option("ServiceUrl")+"/js/OutlinePass.js", function(data, textStatus, jqxhr) {
																																			console.log(textStatus);
																																			$.getScript(that.Option("ServiceUrl")+"/js/modal3d.js", function(data, textStatus, jqxhr) {
																																					console.log(textStatus);
																																					$.getScript(that.Option("ServiceUrl")+"/js/zlib/inflate.js", function(data, textStatus, jqxhr) {
																																						console.log(textStatus);
																																						$.getScript(that.Option("ServiceUrl")+"/js/zlib/deflate.js", function(data, textStatus, jqxhr) {
																																							console.log(textStatus);

																																								if(textStatus == "success")
																																									that._createConfiguration();//configureScene [create scene , camere etc..]

																																						});
																																					});
																																			});
																																	});
																															});
																													});
																											});
																									});
																							});
																					});
																			});
																	});
															});
													});
											});
									});
							});
					});

			});
		},
    _createConfiguration: function() {
		_imgSource = this.Option("ImgSource"); // set image image container
		_$imgSource = $(_imgSource);
		this._LoadAllConfiguration(this.Option("Product"));
		configureScene();

    },
	_LoadAllConfiguration : function(type){
		$.getJSON({
			url: this.Option("ServiceUrl") + "/api/products/" + type +"/"+this.Option("Key"),
			context: this,
			success: function (data) {
				var that = this;
				var templateId = that.Option("ProductTemplate");
				that._ProductData = data.Product;

				var template = $.templates(templateId);
				var htmlOutput = template.render({
						"Product": that._ProductData
					});
				this.$element.html(htmlOutput);

				// Product Detail Click Event
				$("body").on("click","[data-tds-product]",function(){

					// if (e.target !== this)
						// return;
					//alert($(this).data("tds-product"));
					if(that.Option("IsOptionVisible")){
						var productId = $(this).data("tds-product");
						var optionTmpl = that.Option("OptionTemplate");
						var optionUiId = that.Option("OptionsPlace");
						if (optionTmpl != "" && optionUiId != "" && productId !== undefined && productId !== "") {
							var options = [];
							for (var dataIndex = 0; dataIndex < that._ProductData.length; dataIndex++)
								if (that._ProductData[dataIndex].Id == productId) {
									options = $.merge([], that._ProductData[dataIndex].Options);
									if (that._ProductData[dataIndex].Contrasts.length > 0)
										options.push({
											Id: "tds-contrast",
											Name: "Contrast",
											DataAttr: " data-tds-option='contrast' data-tds-key='" + productId + "'"
										});
									break;
								}
							if (options != null) {
								if (options.length > 1) {
									var template1 = $.templates(optionTmpl);
									var htmlOutput1 = template1.render({
											"Options": options
										});
									$(optionUiId).html(htmlOutput1);
									if(that._IsCustomizeOptions){
										if(that._CustomizeOptions[1].length > 0){
											for(var c=0 ; c < that._CustomizeOptions[1].length; c++){
												$("[data-tds-option='" + that._CustomizeOptions[1][c] + "']").addClass("selected");
											}
											for(var f=0;f < options.length;f++){
												if($("[data-tds-option='" + options[f].Id + "']").hasClass("selected")){
													$("[data-tds-option='" + options[f].Id + "']").removeClass("selected");
													continue;
												}
												$("[data-tds-option='" + options[f].Id + "']").remove();
											}
										}
									}
								} else {
									var features = options[0].Features;

									if (features != null) {
										var featureTmpl = that.Option("FeatureTemplate");
										var featureUiId = that.Option("FeaturesPlace");
										var template1 = $.templates(featureTmpl);
										var htmlOutput1 = template1.render({
												"Features": features
											});
										$(featureUiId).html(htmlOutput1);
										if(that._IsCustomizeOptions){
											if(that._CustomizeOptions[0].length > 0){
												for(var c=0 ; c < that._CustomizeOptions[0].length; c++){
													$("[data-tds-element='" + that._CustomizeOptions[0][c] + "']").addClass("selected");
												}
												for(var f=0;f < features.length;f++){
													if($("[data-tds-element='" + features[f].Id + "']").hasClass("selected")){
														$("[data-tds-element='" + features[f].Id + "']").removeClass("selected");
														continue;
													}
													$("[data-tds-element='" + features[f].Id + "']").remove();
												}
											}
										}
									}
								}
							}
						}
					}else{
						var productId = $(this).data("tds-product");
						var featureTemplateId = this.Option("FeatureTemplate");
						var featurePlaceId = this.Option("FeaturesPlace");
						if(productId != undefined && featureTemplateId != undefined && featurePlaceId != undefined){
							var features = [];

							for(var dataindex = 0 ; dataindex < this._ProductData.length ; dataindex++){
								if(productId == this._ProductData[dataindex].Id){
									for (var dataIndex1 = 0; dataIndex1 < that._ProductData[dataIndex].Options.length; dataIndex1++) {
										features = features.concat(that._ProductData[dataIndex].Options[dataIndex1].Features);
										break;
									}
								}
							}
							if(features != null){
								var template1 = $.templates(featureTemplateId);
								var htmlOutput1 = template1.render({
										"Features": features
									});
								$(featurePlaceId).html(htmlOutput1);
							}
						}
					}

					var callback = that.Option("OnProductDetailChange");
					if (typeof callback == 'function')
						callback.call(this, $(this).data("tds-product"));
				});

				// Product Option Click Event
				$("body").on("click","[data-tds-option]",function(e){
					e.stopPropagation();
					var productId = $(this).data("tds-key");
					var optionId = $(this).data("tds-option");
					var featureTmpl = that.Option("FeatureTemplate");
					var featureUiId = that.Option("FeaturesPlace");
					if (featureTmpl != "" && featureUiId != "" && productId !== undefined && productId !== "" && optionId !== undefined && optionId !== "") {
						var features = null;

						for (var dataIndex = 0; dataIndex < that._ProductData.length; dataIndex++)
							if (that._ProductData[dataIndex].Id == productId) {
								if (optionId == "contrast") {
									features = that._ProductData[dataIndex].Contrasts;
									break;
								} else {
									for (var dataIndex1 = 0; dataIndex1 < that._ProductData[dataIndex].Options.length; dataIndex1++)
										if (that._ProductData[dataIndex].Options[dataIndex1].Id == optionId) {
											features = that._ProductData[dataIndex].Options[dataIndex1].Features;
											break;
										}
								}
							}
						if (features != null) {
							var template1 = $.templates(featureTmpl);
							var htmlOutput1 = template1.render({
									"Features": features
								});
							$(featureUiId).html(htmlOutput1);
						}
					}

					var callback = that.Option("OnOptionChange");
					if (typeof callback == 'function')
						callback.call(this, $(this).data("tds-option"));
				});

				// Product Feature Click Event
				$("body").on("click","[data-tds-element]",function(e){
					e.stopPropagation();
					var productDetailId = $(this).attr("data-tds-key");
					var featureId = $(this).attr("data-tds-element");
					that._CreateRenderObject(productDetailId,featureId);
					//alert($(this).attr("data-tds-element"));

					var callback = that.Option("OnFeatureChange");
					if (typeof callback == 'function')
						callback.call(this, $(this).data("tds-element"));
				});

				//Contrast Click Event
				$("body").on("click","[data-tds-contrast]",function(e){
					e.stopPropagation();
					var productDetailId = $(this).attr("data-tds-key");
					var contrastId = $(this).attr("data-tds-contrast");
					that._setContrast(productDetailId,contrastId);

					var callback = that.Option("OnContrastChange");
					if (typeof callback == 'function')
						callback.call(this, $(this).data("tds-element"));
				});

				// Object Click Event
				 _$imgSource.mousedown(function(e){
					e.preventDefault();
					var mouseX = ((e.clientX - _$imgSource.offset().left) /_$imgSource.innerWidth()) * 2 - 1;
					var mouseY =-(((e.clientY - _$imgSource.offset().top) / _$imgSource.innerHeight())  * 2 - 1);
					var oldSelectedObject = _selectedModel;

					//Show Selection
					_setSelectedObject(mouseX,mouseY,function(){

						if(oldSelectedObject != undefined)
							if(that._RenderObject[oldSelectedObject.ProductDetailId].hasOwnProperty("obj"))
								that._RenderObject[oldSelectedObject.ProductDetailId].obj.IsSelected(false);

						that._RenderObject[_selectedModel.ProductDetailId].obj.IsSelected(true);
						var callback = that.Option("OnObjectSelect");
						if (typeof callback == 'function')
							callback.call(this, _selectedModel);
					});

				});

				//Create Render Object
				this._CreateRenderObject();
			},
			fail : function(){}
		});
	},
	_CreateRenderObject : function(key,value){
		if(key == undefined){

			for(var dataindex = 0 ; dataindex < this._ProductData.length ; dataindex++){
				this._RenderObject[this._ProductData[dataindex].Id] = {
					Id : this._ProductData[dataindex].Options[0].Features[0].Id,
					Swatch : "",
					Color : "",
					Contrast : []
				}
			}
			console.log(this._RenderObject);
			this._LoadObjects();

		}else if(key != ""){

			this._selectedModel = new Object();
			for (var i = 0; i < this._ProductData.length; i++) {
				if(this._ProductData[i].Id == key){
					for (var j = 0; j < this._ProductData[i].Options.length; j++){
						for (var k = 0; k < this._ProductData[i].Options[j].Features.length; k++){
							if(this._ProductData[i].Options[j].Features[k].Id == value){
								_selectedModel = {
									ProductDetailName  : this._ProductData[i].Name,
									ProductDetailId  : this._ProductData[i].Id,
									ProductFeatureId : this._ProductData[i].Options[j].Features[k].Id,
									ProductFeatureName : this._ProductData[i].Options[j].Features[k].Name
								}
							}
						}
					}
				}
			}
			if(this._RenderObject[_selectedModel.ProductDetailId].Id == value)
				return;
			if(this._RenderObject[_selectedModel.ProductDetailId].hasOwnProperty('obj')){
				_removeObjectFromScene(this._RenderObject[_selectedModel.ProductDetailId].obj.getObject());// Remove Selected object for Adding new object
				this._LoadObjects(value);
			}else
				this._LoadObjects(value);
		}
	},
	_LoadObjects : function(objectId){
		var that = this;
		if(objectId == undefined){


			var RenderObjectLength = Object.keys(this._RenderObject).length;
			var counts=0;
			$.each(this._RenderObject,function(key,value){
				// console.log(key);
				$.getJSON({
				url: that.Option("ServiceUrl")+'/v1/GetObjFile?Id='+that._RenderObject[key].Id+'&Key='+that.Option("Key"),
				context: this,
				success: function (data) {

						// if(data.toLowerCase == "no file exist")
							// continue;
						//data = removeDiacritics(data);
						var inflator = new Inflator(new Base64Reader(data));
						var textReader = new TextReader(new Utf8Translator(inflator));
						var Decompressed = textReader.readLine();
						Decompressed = Decompressed.replace(/\0/g, '');



						var jsondata = JSON.parse(Decompressed);
						var TexturePath,BumpImagePath,NormalImagePath;
						//TexturePath = "http://172.16.1.63/WEB_API_3D/v1/SwatchImage?DC698D79&key=2532772400&o";
						var mobj = new modal3d(that, jsondata ,TexturePath, BumpImagePath, NormalImagePath,function(modal){
							modal["ObjectFeatureId"] = that._RenderObject[key].Id;
							modal["ObjectFeatureName"] = "FULL SLEEVE";
							modal["ObjectProductDetailId"] = key;

							_addObjectToScene(modal);
						});
						that._RenderObject[key].obj = mobj;

						var bbox = mobj.getBoundingBox();
						if(IsBbox){

							_bbox.min.x = bbox.min.x;
							_bbox.min.y = bbox.min.y;
							_bbox.min.z = bbox.min.z;

							_bbox.max.x = bbox.max.x;
							_bbox.max.y = bbox.max.y;
							_bbox.max.z = bbox.max.z;

							IsBbox = false;
						}else{

							_bbox.min.x = Math.min(bbox.min.x,_bbox.min.x);
							_bbox.min.y = Math.min(bbox.min.y,_bbox.min.y);
							_bbox.min.z = Math.min(bbox.min.z,_bbox.min.z);

							_bbox.max.x = Math.max(bbox.max.x,_bbox.max.x);
							_bbox.max.y = Math.max(bbox.max.y,_bbox.max.y);
							_bbox.max.z = Math.max(bbox.max.z,_bbox.max.z);
						}
						_bbox.width  = _bbox.max.x - _bbox.min.x;
						_bbox.height = _bbox.max.y - _bbox.min.y;
						_bbox.length = _bbox.max.z - _bbox.min.z;

						_bbox.center.x = (_bbox.max.x - _bbox.min.x) /2;
						_bbox.center.y = (_bbox.max.y - _bbox.min.y) /2;
						_bbox.center.z = (_bbox.max.z - _bbox.min.z) /2;
						// console.log(_bbox);

						counts++;
						if(counts == RenderObjectLength)
							that.Texture("DC698D79");

					}
				});


			});

			// $.getJSON({
				// url: 'http://172.16.10.69/DemoService/v1/GetObjFile1',
				// context: this,
				// success: function (data) {

						// var inflator = new Inflator(new Base64Reader(data));
						// var textReader = new TextReader(new Utf8Translator(inflator));
						// var Decompressed = textReader.readLine();
						// Decompressed = Decompressed.replace(/\0/g, '');

						// var jsondata = JSON.parse(Decompressed);
						// var TexturePath,BumpImagePath,NormalImagePath;
						// var mobj = new modal3d(this, jsondata ,TexturePath, BumpImagePath, NormalImagePath,function(modal){
							// modal["ObjectFeatureId"] = "FULLSLEEVE";
							// modal["ObjectFeatureName"] = "FULL SLEEVE";
							// modal["ObjectProductDetailId"] = "7FD65341";

							// _addObjectToScene(modal);
						// });
						// that._RenderObject["7FD65341"].obj = mobj;


					// }
				// });
				// $.getJSON({
				// url: 'date2.json',
				// context: this,
				// success: function (data) {
					// console.log(data);
					// var TexturePath,BumpImagePath,NormalImagePath;
					// var mobj = new modal3d(this, data ,TexturePath, BumpImagePath, NormalImagePath,function(modal){
							// modal["ObjectFeatureId"] = "7D92DA97";
							// modal["ObjectProductDetailId"] = "462D27B6";
							// _scene.add(modal);
							// _getImageData = true;
							// console.log(_imgData);
					// });
					// that._RenderObject["462D27B6"].obj = mobj;
				// },
				// fail : function(){}
				// });


		}else{
			$.getJSON({
				url: this.Option('ServiceUrl')+'/v1/GetObjFile?Id='+objectId+'&Key='+that.Option("Key") ,
				context: this,
				success: function (data) {

					var inflator = new Inflator(new Base64Reader(data));
					var textReader = new TextReader(new Utf8Translator(inflator));
					var Decompressed = textReader.readLine();
					Decompressed = Decompressed.replace(/\0/g, '');

					var jsondata = JSON.parse(Decompressed);
					var TexturePath,BumpImagePath,NormalImagePath;



					var mobj = new modal3d(this, jsondata ,TexturePath, BumpImagePath, NormalImagePath,function(modal){
						modal["ObjectFeatureId"] = _selectedModel.ProductFeatureId;
						modal["ObjectFeatureName"] = _selectedModel.ProductFeatureName;
						modal["ObjectProductDetailId"] = _selectedModel.ProductDetailId;
						_addObjectToScene(modal);
					});
					if(this._RenderObject[_selectedModel.ProductDetailId].Swatch != "")
						TexturePath = this.Option("ServiceUrl")+"/v1/SwatchImage?"+this._RenderObject[_selectedModel.ProductDetailId].Swatch+"&key="+this.Option("Key")+"&o";
					else
						TexturePath = this.Option("ServiceUrl")+"/v1/SwatchImage?DC698D79"+"&key="+this.Option("Key")+"&o";
					mobj.setTextureWithPath(TexturePath,_bbox);
					that._RenderObject[_selectedModel.ProductDetailId].Id = _selectedModel.ProductFeatureId;
					that._RenderObject[_selectedModel.ProductDetailId].obj = mobj;

				}
			});
		}

		var callback = that.Option("OnObjectChange");
		if (typeof callback == 'function')
			callback.call(this);
	},
	_setContrast : function(key,val){
		this._CurrentContrastKey = val;
		this._CurrentDetailId = key;
	},
	Option: function (key, val) {
		if (val) {
			this.config[key] = val;
		} else if (key) {
			return this.config[key];
		}
	},
	_unRegisterEvents : function(){
		$("body").off('click', "[data-tds-element]");
		$("body").off('click', "[data-tds-option]");
		$("body").off('click', "[data-tds-product]");
	},
	getComposer : function (){
		return _composerBeckmann;
	},
	getScreenDpi : function (){
		$("body").append("<div style='poosition:fixed;width:1cm;height:1cm;'class='SCREENDPITEST'></div>")
		screen.dpi = Math.floor($(".SCREENDPITEST").width() * 2.54);
		//alert();
		$(".SCREENDPITEST").remove()
		return screen.dpi;
	},
	SelectedDetail : function(){
		return _selectedModel;
	},
	Product : function(type){
		if(type == undefined)
			return;

		this._unRegisterEvents();
		this._RenderObject = new Object();
		this._LoadAllConfiguration(type);
		this._Product = type;
	},
	Texture : function(id){
		if(id == undefined)
			return;

		var imagePath = this.Option("ServiceUrl")+"/v1/SwatchImage?"+id+"&key="+this.Option("Key")+"&o";
		this._Swatch = id;
		//var imagePath = "http://172.16.10.160/WEB_API/v1/SwatchImage?"+id+"&o";
		//var imagePath = "icon.png";
		// var theImage = new Image();
        // theImage.src = imagePath;



		for (var key in this._RenderObject){
			//console.log(key);

			if(!this._RenderObject[key].hasOwnProperty("obj"))
				continue;

			this._RenderObject[key].Swatch = id;
			// this._RenderObject[_selectedModel.ProductDetailId].obj.setTextureWithPath(imagePath,function(){
				// if(this._RenderObject[_selectedModel.ProductDetailId].Contrast != undefined){
					// if(this._RenderObject[_selectedModel.ProductDetailId].Contrast.length > 0){
						// for(var c = 0 ; c < this._RenderObject[_selectedModel.ProductDetailId].Contrast.length ; c++){
							// if(this._RenderObject[_selectedModel.ProductDetailId].Contrast[c] == undefined)
								// continue;

							// var cimagePath = this.Option("ServiceUrl")+"/v1/SwatchImage?"+this._RenderObject[_selectedModel.ProductDetailId].Contrast[c].Swatch+"&o";
							// this._RenderObject[this._CurrentDetailId].obj.setTextureOnPartWithPartNo(cimagePath,c);
						// }
					// }
				// }
			// });

			// this._RenderObject[key].obj.setTextureWithPath(imagePath,function(){
				// if(this._RenderObject[key].Contrast != undefined){
					// if(this._RenderObject[key].Contrast.length > 0){
						// for(var c = 0 ; c < this._RenderObject[key].Contrast.length ; c++){
							// if(this._RenderObject[key].Contrast[c] == undefined)
								// continue;

							// var cimagePath = this.Option("ServiceUrl")+"/v1/SwatchImage?"+this._RenderObject[key].Contrast[c].Swatch+"&o";
							// this._RenderObject[key].obj.setTextureOnPartWithPartNo(cimagePath,c);
						// }
					// }
				// }
			// },_bbox);
			this._RenderObject[key].obj.setTextureWithPath(imagePath,_bbox);


		}
	},
	ContrastTexture : function(id){
		if(id == undefined)
			return;

		var imagePath = this.Option("ServiceUrl")+"/v1/SwatchImage?"+id+"&o";
		//var imagePath = "icon.png";
		var theImage = new Image();
        theImage.src = imagePath;

		if(this._RenderObject[this._CurrentDetailId].hasOwnProperty("obj")){
			this._RenderObject[this._CurrentDetailId].obj.setTextureOnPartWithPartNo(imagePath,this._CurrentContrastKey);

			if(this._RenderObject[this._CurrentDetailId].Contrast.hasOwnProperty(this._CurrentContrastKey)){
				this._RenderObject[this._CurrentDetailId].Contrast[this._CurrentContrastKey].Swatch = id;
			}else{
				this._RenderObject[this._CurrentDetailId].Contrast[this._CurrentContrastKey] = {
					"Swatch" : id,
					"Color" : ""
				}
			}
		}
	},
	Options: function (productId) {
			if (productId !== undefined && productId !== "")
				for (var dataIndex = 0; dataIndex < this._ProductData.length; dataIndex++)
					if (this._ProductData[dataIndex].Id == productId) {
						var options = $.merge([], this._ProductData[dataIndex].Options);
						return options;
					}

			return null;
	},
	Contrasts: function (productId) {
		if (productId !== undefined && productId !== "")
			for (var dataIndex = 0; dataIndex < this._ProductData.length; dataIndex++)
				if (this._ProductData[dataIndex].Id == productId) {
					var contrast = this._ProductData[dataIndex].Contrasts;
					return contrast;
				}

		return null;
	},
	Look : function(type){
		if(type.toLowerCase() == "image"){
			var imgData = _renderer.domElement.toDataURL();
			console.log(imgData);
		}else if(type === undefined){
			var lookdata = {
				'RO' : this._RenderObject,
				'SW' : this._Swtch
			}

			return {
				'Data' : btoa(JSON.stringify(lookData))
			}

		}else{
			var lookdata = JSON.parse(atob(rawRenderData));
			this._RenderObject = lookData.RO;
			this._Swatch = lookData.SW;
		}
	},
	Summary: function () {

		var selectedElements = new Array();

		var selectedContrast = new Array();

		var selectedTextures = new Array();

		var selectedMonogram = new Array();

		var monogram = false;

		// if(this._MonogramPlacement != "" && this._MonogramColor != "" && this._MonogramFont != "" && this._MonogramText != "")
		// {
			// selectedMonogram.push({
				// 'MonogramText' : this._MonogramText.toString(),
				// 'MonogramPlacement' : this._MonogramFont.toString(),
				// 'MonogramFont' : this._MonogramPlacement.toString(),
				// 'MonogramColor' : this._MonogramColor.toString()
			// });
			// monogram = true;
		// }

		selectedTextures.push({
			'Detail': 'All',
			'ContrastNo': '0',
			'FabricId': this._Swatch,
			'Color': ""
		});


		// for (var key=0; key < this._LibConfig.length;key++){
			// if(this._LibConfig[key].swatch != undefined || this._LibConfig[key].swatch != ""){
				// selectedTextures.push({
					// 'Detail' : this._LibConfig[key].Name,
					// 'ContrastNo': '0',
					// 'FabricId': this._LibConfig[key].Swatch,
					// 'Color': this._Color
				// })
			// }
		// }

		for (var key in this._RenderObject) {
			selectedElements.push(this._RenderObject[key].Id);
			for (var contrastKey=0; contrastKey < this._RenderObject[key].Contrast.length;contrastKey++) {
				selectedContrast.push({
					'Detail': key,
					'ContrastNo': contrastKey,
					'FabricId': this._RenderObject[key].Contrast[contrastKey].Swatch,
					'Color': this._RenderObject[key].Contrast[contrastKey].Color
				});

			}

		}
		var a = {
			"Product": selectedElements,
			"Contrast": selectedContrast,
			"Swatch": selectedTextures,
			"Monogram" : selectedMonogram
		};

		var returnData = null;

		$.ajax({
			type: 'POST',
			url: this.Option("ServiceUrl") + "/api/products",
			data: a,
			async: false,
			success: function (data1) {
				returnData = data1;
			},
			fail: function () {
				//alert(0);
			}
		});
		return returnData;

	},
	ImageObj : function(){
		var objs = new OBJImg({
					image: "shirt.obj.png",
					receiveShadow: false,
					castShadow: false,
					useWorker: false,
					renderer: _renderer,
					onComplete: function( event ){

						console.log("RAW datas:", event.detail, " (usefull for vanilla WebGL)");
						var object3d = objs.getObject3D();
						//object3d.position.set(0, 0, 0);
						_scene.add(object3d);

					},
					onError: function( event ){

						console.error(event);

					}
				});

				//scene.remove(object3d);
				//controls.reset();


	},
	ChildrenParts : function(){
		for (var key in this._RenderObject){


			if(!this._RenderObject[key].hasOwnProperty("obj"))
				continue;

			console.log(this._RenderObject[key].obj.getChildParts());


		}
	}
	};
	Plugin.defaults = Plugin.prototype.defaults;
	var pluginName = "tailori";
	$.fn[pluginName] = function ( options ) {
		return this.each(function () {
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName,
				new Plugin( this, options ));
			}
		}).data('plugin_' + pluginName);
	}
	var p = this;
	var configureScene = function(){
		var that = this;
		_scene = new THREE.Scene();// create Scene

	    //create Camera
	    _camera = new THREE.PerspectiveCamera( 45, _$imgSource.width() / _$imgSource.height() , 1 , 10000 );
	    _camera.position.z = 100;



	    //Adding Lights in the Scene
	    // _scene.add(new THREE.AmbientLight(0x3C3C3C));

	    // _directionalLight = new THREE.DirectionalLight(0xFEFEF7, 1.0);
	    // _directionalLight.position.set( 500, 500, 500);
	    // _directionalLight.castShadow = true;
	    // _directionalLight.shadow.mapSize.width = 2048;
	    // _directionalLight.shadow.mapSize.height = 2048;
	    // _directionalLight.shadow.camera.near = 500;
	    // _directionalLight.shadow.camera.far = 1500;
	    // _directionalLight.shadow.camera.top = 500;
	    // _directionalLight.shadow.camera.bottom = -500;
	    // _directionalLight.shadow.camera.left = 500;
	    // _directionalLight.shadow.camera.right = -500;
	    // _directionalLight.shadow.bias = -0.001;

	    // _scene.add( _directionalLight );

	    // _dirLight1 = new THREE.DirectionalLight(0xFEFEF7, 1.0);
	    // _dirLight1.position.set(0.2,1,-0.7);
	    // _dirLight1.shadow.bias = -0.001;
	    // _scene.add(_dirLight1);

	    // _dirLight2 = new THREE.DirectionalLight(0xFEFEF7, 0.4);
	    // _dirLight2.position.set(-1,0.4,0.4);
	    // _dirLight2.shadow.bias = -0.001;
	    // _scene.add(_dirLight2);

	    // _dirLight3 = new THREE.DirectionalLight(0xFFFFFF, 0.4);
	    // _dirLight3.position.set(1,1,1);
	    // _dirLight3.shadow.bias = -0.001;
	    // _camera.add(_dirLight3);


		_scene.add(new THREE.AmbientLight(0x878787, 1.0));


		var  FrontLight = new THREE.DirectionalLight(0xffffff, 0.7);
        FrontLight.position.set(15, 100, 200);
		_scene.add( FrontLight );

		var helper = new THREE.DirectionalLightHelper( FrontLight, 5, 0xd02001);
		//_scene.add( helper );



		var  FrontCenterLight = new THREE.DirectionalLight(0xffffff, 0.3);
        FrontCenterLight.position.set(0, 0, 200);
		_scene.add( FrontCenterLight );

		var helper = new THREE.DirectionalLightHelper( FrontCenterLight, 5, 0xd02001);
		//_scene.add( helper );

		 var  BackCenterLight = new THREE.DirectionalLight(0xffffff, 0.3);
        BackCenterLight.position.set(0, 0, -200);
		_scene.add( BackCenterLight );

		var helper = new THREE.DirectionalLightHelper( BackCenterLight, 5, 0xd02001);
		//_scene.add( helper );

		 var  BackLight = new THREE.DirectionalLight(0xffffff, 0.7);
        BackLight.position.set(150, 500, -200);
		_scene.add( BackLight );

		var helper = new THREE.DirectionalLightHelper( BackLight, 5, 0xd02001);
		//_scene.add( helper );


	    // Create and Configure render
	    _renderer = new THREE.WebGLRenderer( { antialias: true,preserveDrawingBuffer: true  } );
	    // _renderer.setClearColor(0xEFF0F0);
		_renderer.setClearColor(0xFFFFFF);
	    _renderer.setPixelRatio( window.devicePixelRatio );
	    _renderer.setSize( _$imgSource.width(), _$imgSource.height() );
	    _renderer.shadowMap.enabled = true;
	    _renderer.shadowMap.renderReverseSided = false;
	    _renderer.autoClear = false;
	    _renderer.gammaInput = true;
	    _renderer.gammaOutput = true;
	    _renderer.shadowMapSoft = true;
	    _renderer.shadowMapType = THREE.PCFSoftShadowMap;

	    _$imgSource.html(_renderer.domElement);

	    // EffectComposer for Shading
	    var effectBeckmann = new THREE.ShaderPass( THREE.ShaderSkin[ "beckmann" ] );
	    var effectCopy = new THREE.ShaderPass( THREE.CopyShader );

	    effectCopy.renderToScreen = true;

	    var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
	    var rtwidth = 512, rtheight = 512;

	    _composerBeckmann = new THREE.EffectComposer( _renderer, new THREE.WebGLRenderTarget( rtwidth, rtheight, pars ) );
	    _composerBeckmann.addPass( effectBeckmann );
	    _composerBeckmann.addPass( effectCopy );


	    // _$imgSource.mousedown(function(e){
	        // e.preventDefault();
			// var mouseX = ((e.clientX - _$imgSource.offset().left) /_$imgSource.innerWidth()) * 2 - 1;
      		// var mouseY =-(((e.clientY - _$imgSource.offset().top) / _$imgSource.innerHeight())  * 2 - 1);
	        // _setSelectedObject(mouseX,mouseY);

	    // });


	    // Adding Events
	    window.addEventListener( 'resize',_onWindowResize , false );

	    _controls = new THREE.OrbitControls( _camera, _renderer.domElement );
	    _controls.target.set( 0, 1, 0);
	    _controls.rotateSpeed = 0.9;
	    _controls.zoomSpeed = 1.4;
	    _controls.enableDamping = true;
	    _controls.dampingFactor = 0.151;
	    _controls.minPolarAngle = Math.PI / 2;
	    _controls.maxPolarAngle = Math.PI / 2;

	    _controls.update();

	    _repeatCtrl = new function () {
	        this.repeats = 10;
	    };

		// var axes = new THREE.AxisHelper(1000);
		// axes.position.set(0,0,0);
		// _scene.add(axes);

		_getImageData = true;
	    _animate();
		//console.log(_imgData)
	},


	_onWindowResize = function(event) {

		_renderer.setSize(_$imgSource.width(), _$imgSource.height());
		_camera.aspect = _$imgSource.width() / _$imgSource.height();
		_camera.updateProjectionMatrix();
	},
	_animate = function() {

		requestAnimationFrame(_animate);
		_rendering();

	},
	_rendering = function() {

		_renderer.clear();
		_renderer.render(_scene, _camera);
		if(_getImageData == true){
            _imgData = _renderer.domElement.toDataURL();
            _getImageData = false;
        }
	},

    ///////////////////////////////////////////////

    _setSelectedObject = function(mouseX,mouseY,callback){

        var projector = new THREE.Projector();
        var mouse = new THREE.Vector2();
        mouse.x = mouseX;
        mouse.y = mouseY;

        // Raycaster For Selection of Object
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse.clone(), _camera);
        var intersects = raycaster.intersectObjects(_scene.children,true);

        for (var i = 0; i < intersects.length; i++) {
            //console.log(intersects.length);
            if(i == 0){
                var intersection = intersects[i],
                obj = intersection.object.parent;
				var activeMesh = intersection.object.name;

                //console.log("Parent Name : "+obj.name);

                _showObjectSelection(obj,activeMesh);
				callback(_selectedModel);
            }
        }

    },
    _showObjectSelection = function(ModelObj,activeMesh){

        if(_selectedModel){
			//_selectedModel.IsSelected(false);
			_selectedModel = new Object;
        }

        //_selectedModel = ModelObj.GetParent();
		//_selectedModel.setActiveMesh(activeMesh);
		//_selectedModel.ObjectProductDetailId = ModelObj.ObjectProductDetailId;
      	//_selectedModel.IsSelected(true);
		var featureName = ModelObj.ObjectFeatureName;
		// var Options = Plugin.prototype.Options(ModelObj.ObjectProductDetailId);
		// for(var i = 0 ; i < Options.length;i++){
			// for(var j = 0 ; j < Options[i].Features.length;j++){
				// if(ModelObj.ObjectFeatureId = Options[i].Features[j].Id){
					// featureName = Options[i].Features[j].Name;
				// }
			// }
		// }
		_selectedModel = {
			ProductDetailId  : ModelObj.ObjectProductDetailId,
			ProductDetailName  : ModelObj.name,
			ProductFeatureId : ModelObj.ObjectFeatureId,
			ProductFeatureName : featureName
		}

		// console.log(ModelObj.ObjectFeatureId);
		// console.log(ModelObj.ObjectProductDetailId);
        // console.log(ModelObj.name);
    },
	_addObjectToScene = function(obj){
		_scene.add(obj);
	},
	_removeObjectFromScene = function(obj){
		_scene.remove(obj);
	};

})(window, jQuery);
