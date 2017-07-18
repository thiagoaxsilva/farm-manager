// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


window.$ = window.jQuery = require('./resources/jquery-3.1.1.min.js');
require('./resources/jquery-ui-1.12.1/jquery-ui.min.js');


require('./js/dateTime.js');

db = require('./js/database.js');

require('./js/tables/crops-table.js');
require('./js/tables/rows-table.js');
require('./js/tables/tasks-table.js');
require('./js/tables/families-table.js');


// Jquery UI
$( "#tabs" ).tabs();
$( "[type='radio']" ).checkboxradio({
  icon: false
});
$( "fieldset" ).controlgroup();



// to open links in default browser
const shell = require('electron').shell;

// assuming $ is jQuery
$(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    shell.openExternal(this.href);
});








// Open Window
// const path = require('path');
// const remote = require('electron').remote;
// const BrowserWindow = remote.BrowserWindow;

// $('[data-window]').click( function(e){

// 	let newWindow = $(this).attr('data-window');
// 	console.log(newWindow);

// 	const modalPath = path.join('file://', __dirname, '/windows/'+newWindow+'.html')
// 	let win = new BrowserWindow({ width: 600, height: 600 })
// 	win.on('close', function () { win = null })
// 	win.loadURL(modalPath)
// 	win.show()

// 	if ( $(this).attr('data-close-on-click') ){
// 		remote.getCurrentWindow().close();
// 	}

// } )