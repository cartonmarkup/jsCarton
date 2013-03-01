 ! function  () {
    
    var global = Function("return this")()

    // Cache select Array/Object methods
    
    var shift = Array.prototype.shift
    var unshift = Array.prototype.unshift
    var concat = Array.prototype.concat
    var has = Object.prototype.hasOwnProperty
    
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
    
    function addSpecialKeys () {
      var args = concat.apply( [], arguments );
      var key = args.shift();
      var styles = typeof args[ 0 ] === 'object' ? args.shift() : {};
      
      function add ( loop, specials ) {
        var l = loop.length;
        var i = 0;
        
        for ( i; i < l; i++ ) styles[ loop[ i ] ] = px( specials[ i ] );
        return { styles:  styles };
      }
      
      this.cell = function ( w, h ) { 
        var keys = [ 'width', 'height' ];
        return add( keys, arguments );
      } 
      
      this.sticker = function () { 
        var l = arguments.length; 
        var keys = ( l === 2 ) ? [ 'top', 'left' ] : [ 'top', 'right', 'bottom', 'left' ];
        return add( keys, arguments); 
      }
      
      if ( types.indexOf( key.toUpperCase() ) === -1 ) { 
        return add( [], args );
      }
      return this[ key ].apply( null,  args )
    } 
    
    // Turn a camelCase string into a hyphenated one.
    // Used for CSS property names and DOM element attributes.
    
    function hyphenify ( text ) {
      return text.replace( /[A-Z]/g, "-$&" ).toLowerCase();
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
      
    function extend ( a, b ) { 
      // b into a !
      var toStr = Object.prototype.toString;
      var astr = "[object Array]";
      var i; 
    
      a = a || {}; 
    
      for ( i in b ) { 
        if ( b.hasOwnProperty( i )  ) {
          if ( typeof b[ i ] === 'object' && ! b[ i ].nodeType ) { 
            if (  toStr.call( b[ i ] ) !== toStr.call( a[ i ] ) ) { 
              
              a[ i ] = ( toStr.call( b[ i ] ) === astr ) ? [] : {};
            }
            
            extend( a[ i ] , b[ i ] );
          }
          else { 
            
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
    
    function makeQuery ( carton, type ) {
      carton[ type ] = 
        carton[ type.toLowerCase() ] =
          function () {
            var query = [ 'DIV', {} ];
            var childNodes = extend( [], arguments ); 
            var specials = childNodes[ 0 ]; 
            var attributes; 
           
            if ( types.indexOf( type ) === -1 ) query[ 0 ] = type.toUpperCase();
            else  query[ 1 ].type = type.toLowerCase();
            
            if ( isArray( specials )  ) {
              
              if ( typeof specials[ 0 ] === 'string' && tags.indexOf( specials[ 0 ].toUpperCase() ) > -1 ) {
                query[ 0 ] = specials.shift().toUpperCase();
              }
              
              if ( specials.length ) {
                extend( query[ 1 ], addSpecialKeys( type.toLowerCase(), specials ) );
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
      
      domo = D;
      this.factory = '.#'.indexOf( F ) > -1 || ! F ? cartonFactory( F || '#' ) : F;
      this.carton = this; 
    
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
        
        this.factory.add( element, sorted.factory );
        
        if ( nodeName === 'STYLE' ) {
          styleTag = element;
        }
        
        switch ( nodeName ) {
          case "HTML":
          case "HEAD":
          case "BODY":
          if ( styleTag ) styleTag.innerHTML = styleTag.innerHTML + this.factory.parse()
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
            delete global.carton
      
            for (key in this) {
              if (key in values) {
                if (global[key] == this[key]) global[key] = values[key]
              }
      
              else delete global[key]
            }
          }
      
          return this
        }
      
        // A place to store previous global properties
        this.global.values = {}
    }  
}()
;