var Domo = require("./domo");
var Carton = require( "./carton" );
var Factory = require( "./cartonFactory" );
var Document = require("./document");

module.exports = function ( settings, globalQuery ) {
  var i = arguments.length;
  var document = new Document;
  var domo = new Domo( document );
  var factory = { selector: '#', showGrid: false };
  var globalQuery;

  while ( i-- ) {
    if ( arguments[ i ] instanceof Array ) globalQuery = arguments[ i ];
    else if ( typeof arguments[ i ] === 'object' ) for ( var x in  arguments[ i ] ) factory[ x ] = arguments[ i ][ x ];
  }

  factory = new Factory( factory , document );
  var carton = new Carton( domo.global( false ), factory, globalQuery, document );

  carton.DOCUMENT = function(attributes) {
    var document = new Document;

    if ( typeof attributes == "object" && ! attributes.nodeType ) {
      document.doctype.name = attributes.type;
      Array.prototype.shift.call( arguments );
    }

    document.appendChild(
      domo.FRAGMENT.apply( this, arguments )
    );

    return document;
  }
  return carton;
}