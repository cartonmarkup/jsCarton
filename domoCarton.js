// domoCarton.js 0.0.1

// (c) 2013 Mathias Prinz
// cartonFactory.js is distributed under the MIT license.
// For more details, see http://cssCarton.com
 
 ! function  () {
    
    var global = Function("return this")()

    // Cache select Array/Object methods
    
    var shift = Array.prototype.shift
    var unshift = Array.prototype.unshift
    var concat = Array.prototype.concat
    var has = Object.prototype.hasOwnProperty
    
    var types = [ 'CELL', 'SLIM', 'STRETCH', 'CHOPPED', 'STICKER', 'FIXED', 'FIT' ];
    
    var tags = [
      'A', 'ABBR', 'ACRONYM', 'ADDRESS', 'AREA', 'ARTICLE', 'ASIDE', 'AUDIO',
      'B', 'BDI', 'BDO', 'BIG', 'BLOCKQUOTE', 'BODY', 'BR', 'BUTTON',
      'CANVAS', 'CAPTION', 'CITE', 'CODE', 'COL', 'COLGROUP', 'COMMAND',
      'DATALIST', 'DD', 'DEL', 'DETAILS', 'DFN', 'DIV', 'DL', 'DT', 'EM',
      'EMBED', 'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'FRAME',
      'FRAMESET', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEAD', 'HEADER',
      'HGROUP', 'HR', 'HTML', 'I', 'IFRAME', 'IMG', 'INPUT', 'INS', 'KBD',
      'KEYGEN', 'LABEL', 'LEGEND', 'LI', 'LINK', 'MAP', 'MARK', 'META',
      'METER', 'NAV', 'NOSCRIPT', 'OBJECT', 'OL', 'OPTGROUP', 'OPTION',
      'OUTPUT', 'P', 'PARAM', 'PRE', 'PROGRESS', 'Q', 'RP', 'RT', 'RUBY',
      'SAMP', 'SCRIPT', 'SECTION', 'SELECT', 'SMALL', 'SOURCE', 'SPAN',
      'SPLIT', 'STRONG', 'STYLE', 'SUB', 'SUMMARY', 'SUP', 'TABLE', 'TBODY',
      'TD', 'TEXTAREA', 'TFOOT', 'TH', 'THEAD', 'TIME', 'TITLE', 'TR',
      'TRACK', 'TT', 'UL', 'VAR', 'VIDEO', 'WBR'
    ];
    
    function addSpecialKeys () {
      var styles = {}
      var args = []
      var key;
      
    ! function hasStyles ( A ) {
        var l = A.length;
        var i = 0;
      
        for ( i; i < l; i++ ) {
          if ( typeof A[ i ] === 'object' )  extend( styles, A[ i ] )
          else args.push( A[ i ] );
        }
        
        key = args.shift()
      }( concat.apply( [], arguments ) )
      ;
      
      
  
      
      function add ( loop, specials ) {
        var l = loop.length;
        var i = 0;
        
        for ( i; i < l; i++ ) styles[ loop[ i ] ] = px( specials[ i ] );
        return { styles:  styles };
      }
      
      this.cell = function () { 
        var args   = concat.apply( [], arguments );
        var height = ( args.length > 2 ? args.pop() +'-' : '' ) + 'height' ;
        var width  = ( args.length > 2 ? args.pop() +'-' : '' ) + 'width';
        var keys   = [ width, height ]
        return add( keys, args);
      } 
      
      this.sticker = function () { 
        var l = arguments.length; 
        var keys = ( l === 2 ) ? [ 'top', 'left' ] : [ 'top', 'right', 'bottom', 'left' ];
        return add( keys, arguments); 
      }
      
      this.fixed = this.sticker;
      
      if ( types.indexOf( key.toUpperCase()) === -1 || ! args.length ) { 
        return add( [], args );
      }
      
     // console.dir( this[ key ].apply( null, args ).styles )
      
      return this[ key ].apply( null, args );
    } 
    
    // Turn a camelCase string into a hyphenated one.
    // Used for CSS property names and DOM element attributes.
    
    function hyphenify ( text ) {
      return text.replace( /[A-Z]/g, '-$&' ).toLowerCase();
    }
    
    // add a measure
    
    function px ( value ) { 
      //if ( value && value !== 'auto' && ! ( value + '' ).match( /px|%/ ) ) { 
      if ( typeof value === 'number' ) { 
        return value + 'px';
      }
      return value;
    }
    
    function isKey ( key ) { 
      return 'styles,query,type'.indexOf( key ) > -1 
    }
    
    function isArray ( el ) { return el instanceof Array; }
    ccc = 0
    function extend ( a, b ) { 
      // b into a !
      var toStr = Object.prototype.toString;
      var astr = "[object Array]";
      var i; 
    
     // a = a || {}; 
   
      for ( i in b ) { 
        if ( b.hasOwnProperty( i )  ) {
          
          if ( typeof b[ i ] === 'object' && ! b[ i ].nodeType ) { 
            if ( typeof a[i] === 'undefined' || toStr.call( b[ i ] ) !== toStr.call( a[ i ] )  ) { 
              a[ i ] = ( toStr.call( b[ i ] ) === astr ) ? [] : {};
            }
            
            extend( a[ i ] , b[ i ] );
          }
          else { 
            //console.log( a )
            a[ hyphenify( i ) ] = px( b[ i ] ); 
          }
        }
      }
      return a;
    }
    
    function factorify ( obj ) { 
      
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
        var filter = filterAttr();
        var keys = filter.keys;
        var l = filter.length;
        var args = [];
        var p = 0;
        var i;
    
        for ( p; p < l; p++ ) { 
          args[ p ] = {};
          for ( i in keys ) {
            if ( ! isArray( keys[ i ] ) ) { 
              
              args[ p ][ i ] = keys[ i ];
            }
            else { 
              
              args[ p ][ i ] = keys[ i ][ p ];    
            }
          }
        }
        
        return { factory: args, attributes: filter.attr };
      } 
    
      return create(); 
    }
    c  = 0
    function makeQuery ( carton, type ) {
      carton[ type ] = 
        carton[ type.toLowerCase() ] =
          function () {
            
           
            var query = [ 'DIV', {} ];
            var childNodes = extend( [], arguments ); 
            //console.log( arguments[0],childNodes[ 0 ] )
            
            var specials = childNodes[ 0 ]; 
            var attributes; 
           
            if ( types.indexOf( type ) === -1 ) query[ 0 ] = type.toUpperCase();
            else  query[ 1 ].type = type.toLowerCase();
            
            
            
            //console.log( isArray( specials ), c++ )
            if ( isArray( specials )  ) {
              //console.log( 'Arr ' + c++ )
              if ( typeof specials[ 0 ] === 'string' && tags.indexOf( specials[ 0 ].toUpperCase() ) > -1 ) {
                //console.log( 'A ' + c++ )
                query[ 0 ] = specials.shift().toUpperCase();
              }
              //console.log(c++, ' ', specials[0] )
              if ( specials.length ) {
             // console.log( 'B ' + c++  )
              extend( query[ 1 ], addSpecialKeys( type.toLowerCase(), specials ) );
               // console.dir( query[ 1 ] )
              }
              
              childNodes.shift();
              attributes = childNodes[ 0 ];
            } 
            else { 
              
              attributes = specials;
            }
        
            if ( attributes ) {
              if ( typeof attributes == "object" && ! attributes.nodeType ) {
                extend( query[ 1 ], attributes );
                childNodes.shift()
              } 
            }

            query = query.concat( childNodes );
            
            return carton.QUERY.apply( carton, query );
          }
    }; // create 
     
 
    typeof module == "object"
         ? module.exports = Carton
         : window.carton = function ( D, F ) { return new Carton(global.document,  D, F ).global(true) }//window.carton = Carton
         ;
         
    var styleTag;
    var domo;
    
    function Carton ( document, D, F ) {
      if (!document) throw new Error("No document provided.")
      domo = D;
      this.factory = '.#'.indexOf( F ) > -1 || ! F ? cartonFactory( F || '#' ) : F;
      this.carton = this; 
      var factory = this.factory;
      
      this.QUERY = function () {
      
        var childNodes = concat.apply( [], arguments );
        var nodeName = childNodes.shift();
        var attributes = childNodes[ 0 ];
        var element;
        var sorted;
       
        if ( attributes ) {
          if ( typeof attributes == "object" && ! attributes.nodeType ) {
            attributes = shift.apply( childNodes )
            sorted = factorify( attributes );
          }
        }
        
        element = domo.ELEMENT.apply( domo, concat.apply( [ nodeName,  sorted.attributes ], childNodes ) );
       
        factory.add( element, sorted.factory );
        
        if ( nodeName === 'STYLE' ) {
          styleTag = element;
        }
        
        switch ( nodeName ) {
          case "HTML":
          //case "HEAD":
          //case "BODY":
          if ( styleTag ) { 
            //styleTag.innerHTML = styleTag.innerHTML + this.factory.parse().innerText
            factory.parse( styleTag )
          }
        }

        return element;
      }  
    
      var extendedTags = types.concat( tags );
      var i = extendedTags.length;
      
      while ( i-- ) makeQuery( this, extendedTags[ i ] );
      
      this.FRAGMENT = domo.FRAGMENT;
      this.TEXT = domo.TEXT;
      this.COMMENT = domo.COMMENT;
      this.STYLE.on = domo.STYLE.on;
      
      this.global = function(on) {
          var values = this.global.values
          var key
          var code
      
          if (on !== false) {
            global.carton = this
      
            for (key in this) {
              code = key.charCodeAt(0)
      
              if (code < 65 || code > 90) continue
      
              if (this[key] == global[key]) continue
      
              if (key in global) values[key] = global[key]
      
              global[key] = this[key]
            }
          }
      
          else {
            try {
              delete global.carton
            } catch (e) {
              global.carton = undefined
            }
            for (key in this) {
              if (key in values) {
                if (global[key] == this[key]) global[key] = values[key]
              }
      
              else {
                try {
                  delete global[key]
                }
                catch (e) {
                  global[key] = undefined
                }
              }
            }
          }
      
          return this
        }
      
        // A place to store previous global properties
        this.global.values = {}
    }  
}()
;