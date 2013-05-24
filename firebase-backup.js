// config settings. don't add a trailing backslash for any of file locations
var nodeLocation = '/usr/bin/nodejs'; // location of the Node.js binary
var nodeLibrary = '/usr/lib/nodejs'; // location of the Node.js core library files
var firebaseLibrary = '/usr/lib/node_modules/firebase/lib/firebase-node.js'; // location of the Firebase library for Node.js
var firebaseTokenLibrary = '/usr/lib/node_modules/firebase-token-generator/lib/FirebaseTokenGenerator.js'); // location for Firebase tokenGen library
var backupLocation = ''; // where all backup files will be saved
var firebaseURL = '';
var firebaseSecret = '';

// no need to edit below this line

console.log('Starting backup...');

// since this file will be run by cron, it doesn't get executed in a shell environment
// and won't know where the relative paths are pointing to. so we use absolute file locations
var fs = require(nodeLibrary + '/fs.js');
var Firebase = require(firebaseLibrary);
var FirebaseTokenGenerator = require(firebaseTokenLibrary);

var tokenGen = new FirebaseTokenGenerator(firebaseSecret);
var token = tokenGen.createToken({}, {admin: true});

var rootRef = new Firebase(firebaseURL);

rootRef.auth(token, function(error) {
	if (error) {
		console.log(error);
	} else {
		rootRef.once('value', function(snapshot) {
		        // construct a filename based on today's date and the exact time in milliseconds
		        var now = new Date();
		        var filename = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + '-' + now.getTime() + '.json';
		
		        fs.writeFile(backupLocation + '/' + filename, JSON.stringify(snapshot.exportVal()), function(err) {
		                if(err) {
		                        console.log(err);
		                } else {
		                        console.log('The backup was saved! ' + filename);
		                }
				
				// all done, quit node.js
				process.exit();
		        });

			rootRef.unauth();
		});
	}
});
