// domoCarton.js 0.0.1

// (c) 2013 Mathias Prinz
// cartonFactory.js is distributed under the MIT license.
// For more details, see http://cssCarton.com
 
 ! function  () {
   
    // Determine the global object.
    
    var global = Function("return this")()
    
    // globalQuery
    
    var globalQuery;
    
    typeof module == "object"
      ? module.exports = function ( Domo, Factory, Query, Shim ) {  
          if ( ! Domo ) throw new Error( 'No domo provided.' )
          domo = Domo//.global( false );
          factory = Factory;
          document = Shim;
          globalQuery = Query;
          return Carton.call( this, document );
      } 
      : window.carton = function ( Domo, Factory, Query ) {
          if ( ! Domo ) throw new Error( 'No domo provided.' )
          domo = Domo.global( false );
          globalQuery = Query;
          factory = initFactory( Factory ); 
          return new Carton( global.document ).global( true );
        };
        
    // obj is an array ?
    
    var isArray = function ( x ) { return x instanceof Array; }
    var isObject = function ( x ) { return typeof x === 'object' && ! ( x instanceof Array ); }
    var isString = function ( x ) { return typeof x === 'string'; }
    var isBoolean = function ( x ) { return typeof x === 'boolean'; }
    var has = function ( xxx, x ) { return xxx.indexOf( x ) > -1; }
    
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
    
    // store factory obj
    
    var factory;
    
    // store domo obj
    
    var domo;
    
    // cssCarton tags
    
    var cartonTags = [ 'CELL', 'STRETCH', 'SLIM','CHOPPED', 'STICKER', 'FIXED', 'FIT' ];
    
    // html tags
    
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
    
    function initFactory ( F, G ) {
      var settings = { selector: '#' };
      var key; 
      
      if ( ! F || ! F.index ){ 
        if ( ! cartonFactory ) throw new Error( 'No cartonFactory provided.' )
        if ( F ) extend( settings, F );
        F = cartonFactory( settings )
      }
        
      if ( settings.extend ) {
        for ( key in settings.extend ) if ( cartonTags.indexOf( key ) === -1 ) cartonTags.push( key.toUpperCase() ); 
      }      
      return F;
    }
    
    
    // manage settings in array form SLIM( [ ... ], ... ) 
    
    /////////////////////////// 
    
    function shortcut ( type, list, attr ) {
     
      var args = []
      var settings = {}
      var l = list.length
      var i = 0;
      
      for ( ; i < l; i++ ) {
        
        if ( isObject( list[ i ] ) ) {
          
          if ( ! settings.styles ) settings.styles = {};
          extend( settings.styles, list[ i ] );
        }
        
        else if ( isBoolean( list[ i ] ) ) {
          
          settings.show = list[ i ];
        }
        
        else if ( isString( list[ i ] ) && has( tags, list[ i ].toUpperCase() )  ) {
          
          settings.nodeName = list[ i ];
        }
        
        else if ( isString( list[ i ] ) && has( 'left,right,center', list[ i ]  ) ) {
          settings.align = list[ i ];
        }
        
        else {
          
          args.push( list[ i ] );
        }
       } 
      
      // transform to styles
      
      function transform ( loop, specials ) {
        var l = loop.length;
        var i = 0;
        
        for ( i; i < l; i++ ) {
          if ( specials[ i ] !== undefined ) {
            if ( ! settings.styles ) settings.styles = {};
            settings.styles[ loop[ i ] ] = specials[ i ] ;
          }
        }
        
        for ( i in settings ) {
          
          if ( attr[ i ] && isArray(  attr[ i ] ) ) {
            settings[ i ] = attr[ i ].concat( settings[ i ] )
          }
          else if ( attr[ i ] ) {
            settings[ i ] = [ attr[ i ], settings[ i ] ]
            if( ! attr.query ) attr.query = globalQuery;
          }
        }
        
        return extend( attr, settings );
      }
      
      // combines values from array with an key
      
      this.cell = function () { 
       
        var args   = concat.apply( [], arguments );
        var keys = [ 'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height' ]
        return transform( keys, args);
      } 
      
      this.sticker = function () { 
        var l = arguments.length; 
        var keys = ( l === 2 ) ? [ 'top', 'left' ] : [ 'top', 'right', 'bottom', 'left' ];
        return transform( keys, args ); 
      }
      
      this.fixed = this.sticker;
      
      // if element has only an styles object
      
      if ( ! this[ type ] ) {
        //console.log( type )
        return transform( [], args );
      }
      
      // if key exist 
      return this[ type ].apply( null, args );
    } 
    
    ///////////////////////////
    
    function factorify ( obj ) { 
      
      function filterAttr () {
        var filter = { length: 1, keys:{}, attr: {}, nodeName: '' }
        var pseudos
        var i;

        for ( i in obj ) {  
          
          if ( i === 'nodeName') filter.nodeName = obj[ i ];
          
          else if ( has( 'styles,query,type,align,show', i ) ) { 
           
            filter.keys[ i ] = obj[ i ];
            filter.length =  ( obj[ i ].length > filter.length ) && isArray( obj[ i ] ) ?  obj[ i ].length : filter.length;
          } 
          else {
           
            filter.attr[ i ] = obj[ i ];
          } 
        }
        
        return filter;    
      }
      
      function mixStyles ( array, key ) {
        
        array = [].concat( array );
        
        if ( array[ 0 ] === false || array.length === 1 || key !== 'styles' ) {
          if ( array[ 0 ] === false ) array.shift()
          return array;
        }
        
        var root = array[ 0 ];
        var l = array.length;
        var i = 0;
        var copy; 
        
        for ( i; i < l; i++ ) {
          copy = extend( {}, root );
          array[ i ] = extend( copy, array[ i ] );
        }
        
        return array;
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
              args[ p ][ i ] = mixStyles( keys[ i ], i )[ p ];    
            }
          }
        }
        
        return { factory: args, attributes: filter.attr, nodeName: filter.nodeName };
      
      } 
      
      return create();
    }
    
    ///////////////////////////
      
    function hasPseudoClass ( factories ) {
      var list = [];
      
      function lookForPseudo ( factory ) {
        var styles = factory.styles;
        var pseudoList = [];
        var pSelectors = {}
        var selector;
        var i;
        
        for ( i in styles ) {
          if ( i[ 0 ] === '_' ) {
            selector = i.slice(1) 
            pSelectors[ selector  ] = extend( {}, styles[ i ] );
            delete styles[ i ];
          }
        }
        
        for ( i in pSelectors ) {
          pseudoList.push( { pseudo: i, styles: pSelectors[ i ], query: factory.query } );
        }
        
        return pseudoList;
      }
      
      for (var i in factories ) {
         
         list = lookForPseudo( factories[ i ] );  
         if ( list.length ) factories = factories.concat( list )
      }
        
      return factories;
    }
    
    /////////////////////////// 
 
    function makeQuery ( carton, type ) {
      carton[ type ] = 
        carton[ type.toLowerCase() ] =
          function () {
            var childNodes = [];
            var attr = {};
            
            for ( var i in arguments ) {
              if ( isArray( arguments[ i ] ) ) {
                extend( attr, shortcut( type.toLowerCase(), arguments[ i ], attr ) );
              }
              else if ( isObject( arguments[ i ] ) && ! arguments[ i ].nodeType ) {
                extend( attr, arguments[ i ] )
              } 
              else {
                childNodes.push( arguments[ i ] )
              }
            }
            
            if ( ! attr.type && tags.indexOf( type ) === -1 ) attr.type = type.toLowerCase()
            if ( ! attr.nodeName ) attr.nodeName = tags.indexOf( type ) > -1 ? type : 'div'
            
            childNodes.unshift( attr.nodeName, attr );
            
            return carton.QUERY.apply( carton, childNodes );
          }
    }; // create 
    
    /////////////////////////// 
       
    function Carton ( document ) {
      if ( ! document ) throw new Error( 'No document provided.' )
      
      var styleTag;
      extend( this, factory ); 
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
            if ( sorted.nodeName ) nodeName = sorted.nodeName;
          }
        }
        
        //console.log(sorted.factory , sorted, attributes)
        element = domo.ELEMENT.apply( domo, [ nodeName, sorted.attributes ].concat( childNodes ) );
        
        // add to factory
        this.add.apply( null, [ element ].concat( hasPseudoClass( sorted.factory ) ) );
        
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
    
      var extendedTags = cartonTags.concat( tags );
      var i = extendedTags.length;
      
      while ( i-- ) { 
        makeQuery( this, extendedTags[ i ] ); 
      }
      
      this.EACH = function () {
        var frag = domo.FRAGMENT();
        var list = arguments[ 0 ];
        var item = arguments[ 1 ];
        var i;
        var l;
      
        if ( typeof list !== 'object'  ){
          return ''
          //throw new Error( 'No list items to iterate across them.' )
        } 
      
        if ( typeof item !== 'function' ) {
          throw new Error( 'No function' )
        }
      
        if ( typeof list === 'object' && list instanceof Array === false  ) {
          for ( i in list ) {
           frag.appendChild( item.call( null,  list[i], i ) )
          }
          return frag;
        } 
      
        i = 0;
        l = list.length;
      
        for ( i; i < l; i = i + 1 ) {
          frag.appendChild( item.call( null, list[i], i ) )
        }
      
        return frag; 
      } 
      
      
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
      
        this.global.values = {}
    }
}()
;