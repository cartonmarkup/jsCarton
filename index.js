var D = require('domo').global();
var F = require( './cartonFactory')( '#', domo.STYLE() );
var C = require( './domoCarton')( D, F);
var http = require('http');


http.createServer( function( req, res ) {

  if ( req.url  === '/favicon.ico') res.end('');
   
  res.writeHead(200, {"Content-Type": "text/html"})
  res.end( DOCUMENT(
   
  
  
  
  
  ).outerHTML );
}).listen( 8080 );

console.log( 'Hello :) Domo is now on :8080 !' );