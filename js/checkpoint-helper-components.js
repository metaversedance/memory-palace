(function(){

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
				console.log("checkpoint-e",e)
				var checkpoint = e.detail;

				//make checkpoint visible, & add checkpoint class to include in raycast
				checkpoint.setAttribute("visible",true);
				checkpoint.setAttribute("class","checkpoint")
				//refresh raycast object arr
				var raycasterEl = AFRAME.scenes[0].querySelector('[raycaster]');
				raycasterEl.components.raycaster.refreshObjects();

			})

		}
	});



	AFRAME.registerComponent("scene-timer-controller",{
		schema: {
			"seconds-per-checkpoint": {
				default: 2
			}
		},
		init: function() {

			var checkpoints = ["#checkpoint-1","#checkpoint-2","#checkpoint-3","#checkpoint-4"];
			var textEls = ["#dog-text", "#bike-text", "#shoe-text", "#tire-text", "#lightning-text"];
			var idx = 0;
			var self = this;
			var onNavEnd = this.el.sceneEl.addEventListener("navigation-end", function(e){
				//init textEl event
				if(idx < textEls.length) {
					var textEl = AFRAME.scenes[0].querySelector(textEls[idx]);
					textEl.setAttribute("visible",true)
				}


				setTimeout(function(){
					console.log("idx",idx)
					//handle checkpoint init
					if(idx < checkpoints.length) {
						var checkpoint = AFRAME.scenes[0].querySelector(checkpoints[idx]);
						self.el.emit("init-checkpoint", checkpoint);

					}
					//handle text removal
					if(idx < textEls.length) {
						textEl.parentNode.removeChild(textEl);

					}					

					
					idx++;
					// if(idx>checkpoints.length - 1) {
					// 	self.el.sceneEl.removeEventListener("navigation-end",onNavEnd)
					// }



				},self.data["seconds-per-checkpoint"] * 1000)

			});
			this.el.sceneEl.emit("navigation-end")


		}
	});




})()