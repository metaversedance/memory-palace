(function(){

AFRAME.registerComponent("memory-test", {
	init: function() {

		function getRandomInt(min, max) {
		  min = Math.ceil(min);
		  max = Math.floor(max);
		  return Math.floor(Math.random() * (max - min + 1)) + min;
		}
		function getTestChoices() {
			
		}

		var idx = 0;
		var self = this;

		// var interval = setInterval(function(){
		// 	console.log(self.testArr[idx]);


		// 	idx++;
		// 	if(idx>self.testArr.length) clearInterval(interval);
		// },2000)
	},
	testArr: [		
		{engWord:"tree",frWord:"arbre",VR:false,correct:null},
		{engWord:"dog",frWord:"chien",VR:true, correct: null},
		{engWord:"bicycle",frWord:"vélo",VR:true, correct: null},
		{engWord:"arch",frWord:"cambre",VR:false, correct: null},
		{engWord:"shirt",frWord:"chemise",VR:true, correct: null},
		{engWord:"shoe",frWord:"chaussure",VR:false, correct: null},
		{engWord:"car",frWord:"voiture",VR:false, correct: null},
		{engWord:"tire",frWord:"pneu",VR:true, correct: null},
		{engWord:"cloud",frWord:"nuage",VR:false, correct: null},
		{engWord:"lightning",frWord:"foudre",VR:true, correct: null}
	]
})


})()

