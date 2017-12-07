(function(){
// -test sequence
// 	-it should start on "test-start" event
// 	-it should test user on all 10 words in random order
// 		-each english word should have 1 correct french word, and two random incorrect french words
// 		-french words should have random positions
		//generate random position 
// 	-


AFRAME.registerComponent("test-results", {
	init: function() {
		var self = this;
		// captures new test recored
		this.el.sceneEl.addEventListener("new-test-result", function(e){
			var newTestRecord = e.detail.testResult;
			self.testResults.push(newTestRecord);
			console.log("new test record added", newTestRecord)

		});
		//when memory test is finished, communicate results to be pushed to firebase database
		this.el.sceneEl.addEventListener("test-end",function(){
			//
			self.el.emit("push-results-firebase", {
				testResults: self.testResults
			});

		});

	},
	testResults: []
});
AFRAME.registerComponent("emit-test-answer-selected-onclick",{
	init: function() {
		var self =  this;
		this.el.addEventListener("click", function(){
			var selectedWord = self.el.getAttribute("text").value;
			self.el.emit("test-answer-selected",{selectedWord: selectedWord});
		})
	}
})
//it should render a new word set on initialization
//on select:
	//it should communicate english word, selected  french word, correct french word,
	//it should render a new word set 
	//
//each word set should have:
	// one english word, one correct french word, two incorrect french words
	//each french word should be unique
// 
AFRAME.registerComponent("test-sequence",{
	init: function() {
		var self = this;

		function getRandomInt(min, max) {
		  min = Math.ceil(min);
		  max = Math.floor(max);
		  return Math.floor(Math.random() * (max - min + 1)) + min; 
		}
		//https://github.com/Daplie/knuth-shuffle
		function shuffleArr(array) {
		  var array = array.map(function(x){return x});
		  var currentIndex = array.length, temporaryValue, randomIndex;

		  // While there remain elements to shuffle...
		  while (0 !== currentIndex) {

		    // Pick a remaining element...
		    randomIndex = Math.floor(Math.random() * currentIndex);
		    currentIndex -= 1;

		    // And swap it with the current element.
		    temporaryValue = array[currentIndex];
		    array[currentIndex] = array[randomIndex];
		    array[randomIndex] = temporaryValue;
		  }

		  return array;
		}
		function getShuffledIdices(length) {
		  //create new array 0 to length
		  var array = Array.apply(null, {length: length }).map(Function.call, Number);
		  return shuffleArr(array);
		}
		//get two unique indices from array excluding current idx
		function getUniqueIndices(array,exclude) {
			//create new array
			var array = array.map(function(x){
				return x;
			});
			//remove excluded idx (correct word choice idx) from array
			array.splice(exclude,1);
			var firstIdx = getRandomInt(0,array.length - 1);
			var firstIdxVal = array[firstIdx];
			//remove item at firstIdx so it won't be picked again
			array.splice(firstIdx,1);
			var secondIdx = getRandomInt(0, array.length-1);
			var secondIdxVal = array[secondIdx];

			return [firstIdxVal, secondIdxVal]

		}
		//create convenience object to reference testWords by their engWord key
		this.testWordsByEngKeys = {}
		this.testWords.forEach(function(wordObj){
			self.testWordsByEngKeys[wordObj.engWord] = wordObj;
		});

		//create randomized array sequence 0-testWords.length to instead useof testWords
		this.testWordIdxArr = getShuffledIdices(this.testWords.length);

		var idx = 0;

		this.el.sceneEl.addEventListener("test-answer-selected", function(e){

			if(idx > self.testWords.length + 1) return;


			var engWordEl = self.el.querySelector("#eng-word");
			var frWord1El =  self.el.querySelector("#fr-word-1");
			var frWord2El =  self.el.querySelector("#fr-word-2");
			var frWord3El =  self.el.querySelector("#fr-word-3");

			//save last 

			// if(idx > 0) {
				//save results
				var selectedWord = e.detail.selectedWord;
				// var lastEngWord =  engWordEl.getAttribute("text").value;
				var lastEngWord =  self.testWords[self.testWordIdxArr[idx]].engWord;
				var correctWordObj = self.testWordsByEngKeys[lastEngWord];
				self.el.emit("new-test-result", {
					testResult: {
						englishWord: lastEngWord,
						selectedWord: selectedWord,
						correctFrWord: correctWordObj.frWord,
						correctWordObj: correctWordObj
					}
				})

			// }



				if(idx < self.testWords.length) {


				console.log("testWordIdxArr",self.testWordIdxArr[idx])
				var wordObj = self.testWords[self.testWordIdxArr[idx]];
				var engWord = wordObj.engWord;
				var correctFrWord = wordObj.frWord;
				//get two unique idices excluding current idx
				var uniqueWordIdices = getUniqueIndices(self.testWordIdxArr,idx);
				var incorrectFrWord1 = self.testWords[uniqueWordIdices[0]].frWord;
				var incorrectFrWord2 = self.testWords[uniqueWordIdices[1]].frWord;
				//shuffle so that correct word position will be random
				var shuffledWords = shuffleArr([correctFrWord, incorrectFrWord1, incorrectFrWord2]);

				engWordEl.setAttribute("text",{
					value: engWord
				})
				frWord1El.setAttribute("text",{
					value: shuffledWords[0]
				});
				frWord2El.setAttribute("text",{
					value: shuffledWords[1]
				});

				frWord3El.setAttribute("text",{
					value: shuffledWords[2]
				});

				if(idx === self.testWords.length - 1) {
					self.el.emit("test-end");
					console.log("test-end")

				}

			}
			idx++;
		});

		self.el.emit("test-answer-selected")



	},
	testWords: [		
		{engWord:"tree",frWord:"arbre",VR:false},
		{engWord:"bicycle",frWord:"velo",VR:true},
		{engWord:"arch",frWord:"cambre",VR:false},
		{engWord:"dog",frWord:"chien",VR:true},
		{engWord:"arch",frWord:"cambre",VR:false},
		{engWord:"shirt",frWord:"chemise",VR:true},
		{engWord:"shoe",frWord:"chaussure",VR:false},
		{engWord:"tire",frWord:"pneu",VR:true},
		{engWord:"cloud",frWord:"nuage",VR:false},
		{engWord:"lightning",frWord:"foudre",VR:true},
		{engWord:"car",frWord:"voiture",VR:false}

	]
});

AFRAME.registerComponent("push-test-results-firebase",{
	init: function() {
	   var self = this;
	   firebase.initializeApp({
	    apiKey: "AIzaSyB5F4czc_XZHZXqUdIOH3XYfm_VJWDowTk",
	    authDomain: "memory-palace-7448e.firebaseapp.com",
	    databaseURL: "https://memory-palace-7448e.firebaseio.com",
	    projectId: "memory-palace-7448e",
	    storageBucket: "memory-palace-7448e.appspot.com",
	    messagingSenderId: "932775378546"
		});
	   this.database = firebase.database();

	   this.el.sceneEl.addEventListener("push-results-firebase", function(e){
	   		var testResults = e.detail.testResults;
	   		console.log("database-push", testResults)

			self.database.ref().push(testResults);
	   		

	   })
	}
});



})()

