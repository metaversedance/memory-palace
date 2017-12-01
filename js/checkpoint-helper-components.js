(function(){




	AFRAME.registerComponent("emit-on-event", {
		schema: {
			event: {
				type: "string"
			},
			emit: {
				type: "string"
			}
		},
		init: function() {
			var self = this
			this.el.addEventListener(self.data.event, function(){
				self.el.sceneEl.emit(self.data.emit);
			});
		}
	})
	AFRAME.registerComponent("remove-on-event",{
		schema: {
			event: {
				type: "string"
			}
		},
		init: function() {
			var self = this;
			this.el.sceneEl.addEventListener(this.data.event, function onEvent(){
				self.el.parentNode.removeChild(self.el);
				self.el.sceneEl.removeEventListener(self.data.event,onEvent);
			})
		}

	});



	AFRAME.registerComponent("remove-checkpoint",{

		init: function() {
			console.log("nav-start")
			var self = this;
			// to not mess up navigation, destroy checkpoint after navigation ends,
			this.el.sceneEl.addEventListener("navigation-end",function(e){
				var removeEl = e.detail.checkpoint;
				removeEl.parentNode.removeChild(removeEl);
			});
			//set visibility to false on navigation-start
			this.el.addEventListener("navigation-start",function(e){
				var removeEl = e.detail.checkpoint;
				removeEl.setAttribute("visible",false);

			});
		}
	});


	AFRAME.registerComponent("init-checkpoint",{
		init: function() {

			var self = this;

			this.el.sceneEl.addEventListener("init-checkpoint",function(e){
				var checkpoint = e.detail;

				//make checkpoint visible, & add checkpoint class to include in raycast
				checkpoint.setAttribute("visible",true);
				checkpoint.setAttribute("class","clickable")
				//refresh raycast object arr so raycast will include checkpoint
				var raycasterEl = AFRAME.scenes[0].querySelector('[raycaster]');
				raycasterEl.components.raycaster.refreshObjects();

			})

		}
	});



	AFRAME.registerComponent("3d-palace-controller",{
		schema: {
			"seconds-per-checkpoint": {
				default: 2
			}
		},
		init: function() {
			var arrowSigns = ["#arrow-1","#arrow-2","#arrow-3","#arrow-4"]

			var checkpoints = ["#checkpoint-1","#checkpoint-2","#checkpoint-3","#checkpoint-4"];
			var textEls = ["#tree-text", "#bicycle-text", "#shoe-text", "#tire-text", "#lightning-text"];
			var idx = 0;
			var self = this;
			var onNavEnd = this.el.sceneEl.addEventListener("navigation-end", function(){
				//init textEl event
				if(idx < textEls.length) {
					var textEl = self.el.sceneEl.querySelector(textEls[idx]);
					textEl.setAttribute("visible",true)
				}



				setTimeout(function(){
					//emit checkpoint init event, handled by init-checkpoint
					if(idx < checkpoints.length) {
						var checkpoint = AFRAME.scenes[0].querySelector(checkpoints[idx]);
						self.el.emit("init-checkpoint", checkpoint);

					}

					if(idx < arrowSigns.length) {
						console.log("arrowSign",arrowSigns[idx])
						var arrowEl = self.el.sceneEl.querySelector(arrowSigns[idx]);
						arrowEl.setAttribute("visible",true)
					}
					//handle text removal
					if(idx < textEls.length) {
						textEl.parentNode.removeChild(textEl);

					}					

					
					idx++;
					//remove event listener after all checkpoints are finished
					if(idx>checkpoints.length) {
						self.el.sceneEl.removeEventListener("navigation-end",onNavEnd);
						//communicate that palace sequence has ended
						self.el.emit("palace-sequence-end");
					}



				},self.data["seconds-per-checkpoint"] * 1000)

			});
			//event that starts 3D palace sequence
			this.el.sceneEl.addEventListener("3d-palace-start", function onPalaceStart(){
				self.el.sceneEl.emit("navigation-end");
				//remove event listener after fired
				self.el.sceneEl.removeEventListener("3d-palace-start",onPalaceStart)
			})


		}
	});


	AFRAME.registerComponent("2d-palace-controller",{
		schema: {
			"seconds-per-checkpoint": {
				default: 2
			}
		},
		init: function() {
			var textEls = ["#dog-text", "#arch-text", "#shirt-text", "#car-text", "#cloud-text"];
			var idx = 0;
			var self = this;
			this.el.sceneEl.addEventListener("2d-palace-start", function onPalaceStart(){
				var textEl = self.el.sceneEl.querySelector(textEls[idx]);
				textEl.setAttribute("visible",true);
				idx++;

				//init textEl event
				var interval = setInterval(function(){
					//set current textEl visible to true
					if(textEls[idx]) {
						var textEl = self.el.sceneEl.querySelector(textEls[idx]);
						textEl.setAttribute("visible",true)
					}
					//set previous textEl visible false
					if(textEls[idx - 1]) {
						var prevTextEl = self.el.sceneEl.querySelector(textEls[idx -1]);
						prevTextEl.setAttribute("visible",false);
					}
					idx++;
					if(idx>textEls.length) {
						//communicate that palace sequence has ended
						self.el.emit("palace-sequence-end");
						clearInterval(interval);
					}



				},self.data["seconds-per-checkpoint"] * 1000);
				//remove event listener as it is no longer needed
				self.el.sceneEl.removeEventListener("2d-palace-start",onPalaceStart);


			});


		}
	});

	AFRAME.registerComponent("2d-3d-palace-start-randomizer", {
		init: function() {

			var self = this;
			// this.startCoords =[
			// 	{x:5.485,y:3, z:32.732},
			// 	{x:0.347, y:3, z:-34.268}
			// ];

			this.startPositions =[
				{x:5.485,y:3, z:32.732},
				{x:0.000, y:-20.216, z:-33.172}
			];


			   

			//generate random number between 0 & 1 to randomize start of either 2D/3D mind palace 
			var firstStop = Math.floor(Math.random() * 2);
			//keep track of which palace user is on
			this.palaceNum = 1;

			this.el.sceneEl.addEventListener("palace-sequence-start", function(){
				self.el.setAttribute("position",self.startPositions[firstStop]);
				//remove coordinate at idx firstStop
				self.startPositions.splice(firstStop,1);

			})

			this.el.sceneEl.addEventListener("move-to-test-position", function(){
					//moves camera to test start position
					var testPosition = {x:-0.944, y: -19.350, z:21.852}
					self.el.setAttribute("position",testPosition)

			})


			this.el.sceneEl.addEventListener("palace-sequence-end", function(){
				if(self.placeNum > 2) return;
				//hackish way keeping track of if user is 2d palace, 3d palace, or test sequence 
				if(self.palaceNum===2) {
					self.el.emit("move-to-test-position")
					return;
				} 
				//with first coord position removed, startPositions[0] will be the next position
				//moves camera to new position
				self.el.setAttribute("position",self.startPositions[0]);
				self.palaceNum++;


			})




		}
	});




})()