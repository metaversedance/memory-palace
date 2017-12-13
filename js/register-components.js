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
				default: 8
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
				default: 8
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
					var testPosition = {x:-0.944, y: -19.350, z:28.529}
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


AFRAME.registerComponent("test-results", {
	init: function() {
		var self = this;
		// captures new test recored
		this.el.sceneEl.addEventListener("new-test-result", function(e){
			var newTestRecord = e.detail.testResult;
			self.testResults.push(newTestRecord);
			console.log("new test record added", newTestRecord)

		});
		this.el.sceneEl.addEventListener("new-user-answer", function(e){
			var userQuestion = e.detail.userQuestion;
			var userAnswer = e.detail.userAnswer;
			self.userQuestions[userQuestion] = userAnswer;

		})
		//when memory test is finished, communicate results to be pushed to firebase database
		this.el.sceneEl.addEventListener("test-end",function(){
			//
			self.el.emit("push-results-firebase", {
				testResults: self.testResults,
				userSurveyResults: self.userQuestions,
				userEmail: self.userEmail

			});

		});
		this.el.sceneEl.addEventListener("user-email", function(e){
			self.userEmail = e.detail.userEmail;

		})

	},
	testResults: [],
	userQuestions: {},
	userEmail: null
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
AFRAME.registerComponent("test-sequence",{
	init: function() {
		var self = this;
		//create convenience object to reference testWords by their engWord key
		this.testWordsByEngKeys = {}
		this.testWords.forEach(function(wordObj){
			self.testWordsByEngKeys[wordObj.engWord] = wordObj;
		});

		//create randomized array sequence 0-testWords.length to instead useof testWords
		this.testWordIdxArr = getShuffledIdices(this.testWords.length);

		var idx = 0;
		//render words once on init
		this.renderWords(idx)
		this.el.sceneEl.addEventListener("test-answer-selected", function(e){
			if(idx > self.testWords.length) return;
				var selectedWord = e.detail.selectedWord;
				var engWord =  self.testWords[self.testWordIdxArr[idx]].engWord;
				var correctWordObj = self.testWordsByEngKeys[engWord];
				self.el.emit("new-test-result", {
					testResult: {
						englishWord: engWord,
						selectedWord: selectedWord,
						correctFrWord: correctWordObj.frWord,
						VR: correctWordObj.VR
					}
				})

				if(idx === self.testWords.length - 1) {
					//remove test panel at end of test
					self.el.parentNode.removeChild(self.el);
				}
			idx++;
			self.renderWords(idx)

		});

		// self.el.emit("test-answer-selected")



	},

	renderWords: function(idx){
				var engWordEl = this.el.querySelector("#eng-word");
				var frWord1El =  this.el.querySelector("#fr-word-1");
				var frWord2El =  this.el.querySelector("#fr-word-2");
				var frWord3El =  this.el.querySelector("#fr-word-3");

				if(idx < this.testWords.length) {


				console.log("testWordIdxArr",this.testWordIdxArr[idx])
				var wordObj = this.testWords[this.testWordIdxArr[idx]];
				var engWord = wordObj.engWord;
				var correctFrWord = wordObj.frWord;
				//get two unique idices excluding current idx
				var uniqueWordIdices = getUniqueIndices(this.testWordIdxArr,idx);
				var incorrectFrWord1 = this.testWords[uniqueWordIdices[0]].frWord;
				var incorrectFrWord2 = this.testWords[uniqueWordIdices[1]].frWord;
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

			}
	},
	testWords: [		
		{engWord:"bicycle",frWord:"velo",VR:true},
		{engWord:"tree",frWord:"arbre",VR:false},
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
	   		var userSurveyResults = e.detail.userSurveyResults;
	   		var userEmail = e.detail.userEmail;
	   		console.log("database-push", testResults)

			self.database.ref().push({
				testResults: testResults,
				userSurveyResults: userSurveyResults,
				userEmail: userEmail
			});
	   		

	   })
	}
});

AFRAME.registerComponent("percentage-correct-screen",{
	init: function() {
		var self = this;
		this.numCorrect2D = 0;
		this.numCorrect3D = 0;

		this.el.sceneEl.addEventListener("new-test-result", function(e){
			var testResult = e.detail.testResult;
			var correctWord = testResult.correctFrWord.toLowerCase();
			var selectedWord = testResult.selectedWord.toLowerCase();
			if(correctWord===selectedWord) {
				if(testResult.VR) {
					self.numCorrect3D++;
				} else {
					self.numCorrect2D++;
				}
			}
			var correct2D = (self.numCorrect2D/5) * 100;
			var correct3D = (self.numCorrect3D/5) * 100;

			var displayText = "Correct VR Words: " + correct3D + "%"+" Correct 2D Words: " + correct2D + "%";
			self.el.setAttribute("text",{
				value: displayText
			})

		})
	}
})


AFRAME.registerComponent("user-test-question",{
	schema: {
		testQuestion: {
			type: "string"
		},
		isLastQuestion: {
			default: false
		}
	},
	init: function() {
		var self = this;
		var userAnswerEls = this.el.querySelectorAll(".user-answer");
		//add onclick events to each question
		userAnswerEls.forEach(function(el){
			el.addEventListener("click",function(){
				var userQuestion = self.data.testQuestion;
				var userAnswer = el.getAttribute("text").value;
				self.el.emit("new-user-answer",{
					userAnswer: userAnswer,
					userQuestion: userQuestion
				})
				if(self.data.isLastQuestion) {
					//if is the last question in experience
					//communicate that test sequence has ended
					//which will push results to database
					self.el.emit("test-end");

				}
				//remove question panel
				self.el.parentNode.removeChild(self.el)
			});
		})
	}
})

AFRAME.registerComponent("user-email",{
	init: function() {
		var email = this.getUrlParameterByName("email",window.location.href);
		this.el.emit("user-email",{
			userEmail: email
		});

	},
	//https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
	 getUrlParameterByName: function(name, url) {
	    if (!url) url = window.location.href;
	    name = name.replace(/[\[\]]/g, "\\$&");
	    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	        results = regex.exec(url);
	    if (!results) return null;
	    if (!results[2]) return '';
	    return decodeURIComponent(results[2].replace(/\+/g, " "));
	}



})



})()

