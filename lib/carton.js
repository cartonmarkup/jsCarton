// domoCarton.js 0.0.1

// (c) 2013 Mathias Prinz
// cartonFactory.js is distributed under the MIT license.
// For more details, see http://cssCarton.com
 
 ! function  () {
    
    var global = Function("return this")()
    var factory;
    var domo;
    
    typeof module == "object"
      ? module.exports = function ( Domo, Factory, Shim ) {  
          if ( ! Domo ) throw new Error( 'No domo provided.' )
          domo = Domo//.global( false );
          factory = Factory;
          document = Shim;
          return Carton.call( this, document );
      } 
      : window.carton = function ( Domo, Factory ) {
          if ( ! Domo ) throw new Error( 'No domo provided.' )
          domo = Domo.global( false );
          factory = initFactory( Factory ); 
          return new Carton( global.document ).global( true );
        };
        
    // obj is an array ?
    
    var isArray = function ( obj ) { return obj instanceof Array; }
    
    // extend b into a
  
    var extend = function ( a, b ) { 
      var toStr = Object.prototype.toString;
      var astr = "[object Array]";
      var i;
      
      for ( i in b ) { 
        if ( b.hasOwnProperty( i )  ) {
          if ( typeof b[ i ] === 'object' && ! b[ i ].nodeType ) { 
            
            if ( ! a[ i ] || toStr.call( b[ i ] ) !== toStr.call( a[ i ] ) ) { 
              a[ i ] = ( toStr.call( b[ i ] ) === astr ) ? [] : {};
            }
            
            extend( a[ i ] , b[ i ] );
          }
          else {
            a[ i ] = b[ i ];
          }
        }
      }
    
      return a;
    }
    
    // Cache select Array/Object methods
    
    var shift = Array.prototype.shift;
    var concat = Array.prototype.concat;
    
    var types = [ 'CELL', 'STRETCH', 'SLIM','CHOPPED', 'STICKER', 'FIXED', 'FIT' ];
    
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
    
    // create factory if nessesary
    
    var initFactory = function ( F ) {
      var settings = { selector: '#' };
      var key; 
      
      if ( ! F || ! F.index ){ 
        if ( ! cartonFactory ) throw new Error( 'No cartonFactory provided.' )
        if ( F ) extend( settings, F );
        F = cartonFactory( settings )
      }
      
      if ( settings.extend ) {
        for ( key in settings.extend ) if ( types.indexOf( key ) === -1 ) types.push( key.toUpperCase() ); 
      }      
      return F;
    }
    
    
    function isKey ( key ) { 
      return 'styles,query,type'.indexOf( key ) > -1 
    }
    
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
        
        for ( i; i < l; i++ ) styles[ loop[ i ] ] =  specials[ i ] ;
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
      
      return this[ key ].apply( null, args );
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
     
       
    function Carton ( document ) {
      if ( ! document ) throw new Error( 'No document provided.' )
      
      extend( this, factory );
      
      this.carton = this;
      var styleTag; 
      
      
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
       
        this.add( element, sorted.factory );
        
        if ( nodeName === 'STYLE' ) {
          styleTag = element;
        }
        
        switch ( nodeName ) {
          case "HTML":
          case "HEAD":
          case "BODY":
          if ( styleTag ) { 
            
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