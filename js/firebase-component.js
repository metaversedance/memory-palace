AFRAME.registerComponent("firebase",{
	init: function() {
	   firebase.initializeApp({
	    apiKey: "AIzaSyB5F4czc_XZHZXqUdIOH3XYfm_VJWDowTk",
	    authDomain: "memory-palace-7448e.firebaseapp.com",
	    databaseURL: "https://memory-palace-7448e.firebaseio.com",
	    projectId: "memory-palace-7448e",
	    storageBucket: "memory-palace-7448e.appspot.com",
	    messagingSenderId: "932775378546"
		});
	   this.database = firebase.database;
	}
})

//   // Initialize Firebase
//   var config = {
//     apiKey: "AIzaSyB5F4czc_XZHZXqUdIOH3XYfm_VJWDowTk",
//     authDomain: "memory-palace-7448e.firebaseapp.com",
//     databaseURL: "https://memory-palace-7448e.firebaseio.com",
//     projectId: "memory-palace-7448e",
//     storageBucket: "memory-palace-7448e.appspot.com",
//     messagingSenderId: "932775378546"
//   };

// firebase.initializeApp(config);
//  var database = firebase.database();


// database.ref().push({
//     device: "PC",
//     name: "Matt"
// });