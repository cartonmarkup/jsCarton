 ! function  () {
    
    var types = [ 'SLIM', 'STICKER', 'STRETCH', 'CELL' ];
    
    var tags = [
      "A", "ABBR", "ACRONYM", "ADDRESS", "AREA", "ARTICLE", "ASIDE", "AUDIO",
      "B", "BDI", "BDO", "BIG", "BLOCKQUOTE", "BODY", "BR", "BUTTON",
      "CANVAS", "CAPTION", "CITE", "CODE", "COL", "COLGROUP", "COMMAND",
      "DATALIST", "DD", "DEL", "DETAILS", "DFN", "DIV", "DL", "DT", "EM",
      "EMBED", "FIELDSET", "FIGCAPTION", "FIGURE", "FOOTER", "FORM", "FRAME",
      "FRAMESET", "H1", "H2", "H3", "H4", "H5", "H6", "HEAD", "HEADER",
      "HGROUP", "HR", "HTML", "I", "IFRAME", "IMG", "INPUT", "INS", "KBD",
      "KEYGEN", "LABEL", "LEGEND", "LI", "LINK", "MAP", "MARK", "META",
      "METER", "NAV", "NOSCRIPT", "OBJECT", "OL", "OPTGROUP", "OPTION",
      "OUTPUT", "P", "PARAM", "PRE", "PROGRESS", "Q", "RP", "RT", "RUBY",
      "SAMP", "SCRIPT", "SECTION", "SELECT", "SMALL", "SOURCE", "SPAN",
      "SPLIT", "STRONG", "STYLE", "SUB", "SUMMARY", "SUP", "TABLE", "TBODY",
      "TD", "TEXTAREA", "TFOOT", "TH", "THEAD", "TIME", "TITLE", "TR",
      "TRACK", "TT", "UL", "VAR", "VIDEO", "WBR"
    ];
    
    
    var sp = { 
      cell: function ( w, h ) { return { styles: { width: ( px( w ) || 'auto' ), height: (  px( h ) || 'auto' ) } } } 
    , sticker: function ( t, r, b, l  ) { 
        var special = { top: 'auto', right: 'auto', bottom: 'auto', left: 'auto' };
        if ( arguments.length == 2 ) { special.top = px( t ); special.left = px( r ); }
        else { special.top = px( t ); special.right = px( r ); special.bottom = px( b ); special.left = px( l ); }
        return { styles: special }
      }
    , def: function ( obj ) { return { styles: obj } }
    
    }
     // Cache select Array/Object methods
     var shift = Array.prototype.shift
     var unshift = Array.prototype.unshift
     var concat = Array.prototype.concat
     var has = Object.prototype.hasOwnProperty
     
     var px = function ( x ) { 
       if ( x && x !== 'auto' && ! ( x + '' ).match( /px|%/ ) ) return x+'px';
       return x;
     }
     
     var isKey =  function ( key ) { return 'styles,query,type'.indexOf( key ) > -1 }
     var isArray = function ( el ) { return el instanceof Array; }
     var extend = function ( a, b ) { 
       // b into a !
        var i; 
        var toStr = Object.prototype.toString;
        var astr = "[object Array]";
       
         //a = a || {}; 
       
         for ( i in b ) { 
           if ( b.hasOwnProperty( i )  ) {
             if ( typeof b[ i ] === 'object' && ! b[ i ].nodeType ) { 
                if (  toStr.call( b[ i ] ) !== toStr.call( a[ i ] ) ) { 
                  a[ i ] = ( toStr.call( b[ i ] ) === astr ) ? [] : {};
                }
                console.log( toStr.call( b[ i ] ) === astr , a[i], b[i])
                extend( a[ i ] , b[ i ] );
              }
              else { a[ i ] = b[ i ]; }
           }
         }
         return a;
      }
 
      var factorify = function ( obj ) { 
 
       function filterAttr () {
         var filter = { length: 1, keys:{}, attr: {} }
         var i;
 
         for ( i in obj ) {  
           if ( isKey( i ) ) { 
             filter.keys[ i ] = obj[ i ];
             filter.length = ( obj[ i ].length > filter.length  ) && isArray( obj[ i ] ) ?  obj[ i ].length : filter.length;
           } 
           else {
             filter.attr[ i ] = obj[ i ];
           } 
         }
 
         return filter;
       }
 
       function create () {
         var args = [];
         var filter = filterAttr();
         var keys = filter.keys;
         var l = filter.length;
         var p = 0;
         var i;
 
         for ( p; p < l; p++ ) { 
           args[ p ] = {};
           for ( i in keys ) {
             if ( ! isArray( keys[ i ] ) ) args[ p ][ i ] = keys[ i ];
             else args[ p ][ i ] = keys[ i ][ p ];    
           }
         }
         return { factory: args, attributes: filter.attr };
       } 
 
       return create(); 
     }
 
      function xxx ( carton, type ) {
       carton[ type ] =
       carton[ type.toLowerCase() ] =
     
       function () {
     
         var args = [ 'div', { styles: {} } ];
         var specialKey = isArray( arguments[ 0 ] ) ? shift.apply( arguments ) : [];
         var attributes = arguments[ 0 ];
         
         if ( types.indexOf( type ) > -1 ) {
           args[ 1 ].type = type.toLowerCase() 
         } else {
           args[ 0 ] = type.toLowerCase();
         }
          
         if ( attributes && typeof attributes == "object" && ! attributes.nodeType ) {
           extend( args[ 1 ], shift.apply( arguments ) );
         }
     
         if ( args[ 1 ].node ) {
          args[ 0 ] =  args[ 1 ].node;
          delete args[ 1 ].node;
         }
      
         if ( specialKey.length ) {
           
           
           var x = sp[ type.toLowerCase() ]
           if ( typeof x === 'undefined' ) x = sp.def;
           console.log( x )
           extend( args[ 1 ], x.apply( null, specialKey ) )
         }
        
         args = concat.apply(args, arguments)
         
         console.log(args )
         return carton.QUERY.apply(carton, args)
       }
     
     } 
     ;
 
     typeof module == "object"
          ? module.exports = Carton
          : window.carton = Carton
          ;
     
     var Factory;
     var domo; 
      
     function Carton ( F, D ) {
       Factory = F;
       domo = D;
       this.carton = this; 
 
       this.QUERY = function () {
         var childNodes = concat.apply( [], arguments );
         var nodeName = childNodes.shift();
         var attributes = childNodes[ 0 ];
         var sorted;
         var element;
         
         if (attributes) {
 
           if ( typeof attributes == "object" && ! attributes.nodeType ) {
 
            attributes = shift.apply( childNodes )
            sorted = factorify( attributes );
            console.log( '-',sorted)
           }
         }
 
         //console.log(sorted.attributes)
         element = domo.ELEMENT.apply( domo, concat.apply( [ nodeName,  sorted.attributes ], childNodes ) );
         Factory.add( element, sorted.factory );
         return element;
       }  
      
       var i = types.length;
       while ( i-- ) xxx( this, types[ i ] );
      
      var i = tags.length;
      while ( i-- ) xxx( this, tags[ i ] );
     
     }  
   } ()
  ;
 

