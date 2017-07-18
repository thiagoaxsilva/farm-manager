"use strict";

function Form(parentTable, params){
	let parent = parentTable;
	this.parent = parent;
	let that = this;

	this.selector = params.selector;
	this.elem = $(this.selector);
	this.html = params.HTML;
	this.elem.html( this.html );
	this.validateTips = $( this.selector+' .validate-tips' )
		
		// get element for each field
	this.fields = {};
	for (var i = 0; i < parent.fields.length; i++) {
		this.fields[ parent.fields[i].n ] = $(this.selector+' [name="'+parent.fields[i].n+'"]');
	};
	if (params.beforeComplete){
		params.beforeComplete();
	}
		// Prepare for Jquery Modal Form //
	if (params.clearAssist){
		this.clearAssist = params.clearAssist;
	}
	
	if (params.btnSet == 'add'){
		// Clear Add Form
		this.clear = function(){
			for( let prop in that.fields){
				that.fields[prop].val("");
			}
			if (that.clearAssist){
				that.clearAssist();
			}
		};

		this.submitItem = function(){

		  if ( that.isValid() ){

		  	let newItem = {};
		  	for (var i = 0; i < parent.fields.length; i++) {
		  		let field = parent.fields[i].n;
		  		newItem[field] = that.fields[field].val();
		  	};

		    db.addItem( parent.db, newItem, (newItem)=>{
		      let params = JSON.parse( JSON.stringify(parent.lastSearch) );
		      params.highlight = newItem;
		      parent.renderTable( params );
		    } );
		    that.clear();
		    that.J.dialog('close');
		    
		    
		  }
		}
	} // end if (btnSet == 'add')

	else if (params.btnSet == 'edit'){

		this.editItem = function(id){
		  db.getItem(parent.db, function(item){
		        
	        for (var i = 0; i < parent.fields.length; i++) {
		  		let field = parent.fields[i].n;
		  		that.fields[field].val(item[field]);
		  	};

	      }, {_id: id});

	      this.J.dialog('open');
		}

		this.updateItem = function(){

			  if ( that.isValid() ){

			    var query = {_id: that.updateID};

			    let updated = {};
			  	for (var i = 0; i < parent.fields.length; i++) {
			  		let field = parent.fields[i].n;
			  		updated[field] = that.fields[field].val();
			  	};

			    db.updateItem( parent.db, query, updated, {}, (updatedItem)=>{
			      let params = JSON.parse( JSON.stringify(parent.lastSearch) );
			      params.highlight = query; // highlighting query will send an obj with the right _id for highlighting
			      parent.renderTable( params );
			    } );
			    that.J.dialog('close');
			       
			  } 
		}

		this.deleteItem = ()=>{
			db.deleteItem(parent.db, this.updateID, ()=>{
		    this.J.dialog('close');
		    parent.renderTable( parent.lastSearch );
		  } );
		}
	} // end if (btnSet == 'edit')

	// Init Jquery Modal Form //
	this.J = $( this.selector ).dialog({
	  autoOpen: false,
	  height: params.height || 600,
	  width: params.width || 400,
	  modal: true,
	  buttons: that.btnsSet( params.btnSet )
	});
}

Form.prototype.isValid = function(){
	let valid = true;
	// test length
	let fieldsToValidate = this.parent.fields.filter( f => f.limits ); // get fields that have length limits
	for (var i = 0; i < fieldsToValidate.length; i++) {
		console.log('validating', fieldsToValidate[i].n, this.fields, this.fields[fieldsToValidate[i].n]);
		valid = valid && this.validateLength(
			this.fields[ fieldsToValidate[i].n ], 
			fieldsToValidate[i].t, 
			fieldsToValidate[i].limits[0], 
			fieldsToValidate[i].limits[1],
			this.validateTips
		);
		if (!valid){
			return false;
		}
	};
	return valid;
	// test regexp
	fieldsToValidate = this.parent.fields.filter( f => f.r ); // get fields that have regexp's
	for (var i = 0; i < fieldsToValidate.length; i++) {
		console.log('validating', fieldsToValidate[i].n, this.fields, this.fields[fieldsToValidate[i].n]);
		valid = valid && this.validateRegexp(
			this.fields[ fieldsToValidate[i].n ], 
			fieldsToValidate[i].r, 
			fieldsToValidate[i].rErr || "No weird characters, please!", 
			this.validateTips
		);
		if (!valid){
			return false;
		}
	};
};

Form.prototype.validateLength = function(elem, title, min, max, tipElem){
	let length = elem.val().length;
	if ( length < min || length > max ){
		elem.addClass( "ui-state-error" ); 
		setTimeout(function() {
		    elem.removeClass( "ui-state-error", 1500 )
		}, 500 );
		this.updateTips( "Length of '"+title+"' must be between "+min+" and "+max+". <br/>(it was "+elem.val().length+")", tipElem);
		return false;
	} else {
		return true;
	}
};
Form.prototype.validateRegexp = function(elem, regexp, errMsg, tipElem){
	if (elem.val() == ''){ return true } // no value always passes
	if ( !( regexp.test( elem.val() ) ) ) {
	    elem.addClass( "ui-state-error" );
	    setTimeout(function() {
	    elem.removeClass( "ui-state-error", 1500 );
	  }, 500 );
	    if (errMsg && tipElem){
	    	this.updateTips( errMsg, tipElem );
	    }
	    return false;
	  } else {
	    return true;
	  }
};

Form.prototype.updateTips = function(tipText, tipElem){
  tipElem
    .html( tipText )
    .addClass( "ui-state-highlight" );
  setTimeout(function() {
    tipElem.removeClass( "ui-state-highlight", 1500 );
  }, 500 );
};

Form.prototype.btnsSet = function(set){
	if (set == 'add'){
		return {
	    	"Add": this.submitItem,
	    	Cancel: ()=>{
	    		this.clear();
	    		this.J.dialog('close');
	    	},
	    	Clear: this.clear
	    };
	} else if (set == 'edit'){
		return {
		    "Edit": this.updateItem,
		    Cancel: ()=> {
		      this.J.dialog( "close" );
		    },
		    Delete: this.deleteItem
		  }
	}
}



module.exports = Form;
