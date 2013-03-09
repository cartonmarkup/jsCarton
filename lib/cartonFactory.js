// cartonFactory.js 0.0.1

// (c) 2013 Mathias Prinz
// cartonFactory.js is distributed under the MIT license.
// For more details, see http://cssCarton.com

! function () {
  
  typeof module == "object"
       ? module.exports = function ( settings, shim ) { document = shim; return init( settings ) }
       : window.cartonFactory = init
       ;
  
  // cache select array methods
  
  var shift = Array.prototype.shift;
  var concat = Array.prototype.concat;
  
  // indexOf shim for IE > 9 to search in arrays
  
  if ( ! Array.prototype.indexOf ) {
    
    Array.prototype.indexOf = function( elt /*, from*/ ) {
      var len = this.length >>> 0;
      var from = Number( arguments[ 1 ] ) || 0;
      from = ( from < 0 ) ? Math.ceil( from ) : Math.floor( from );
      if ( from < 0 ) from += len;
      for (; from < len; from++ ) {
        if ( from in this && this[ from ] === elt ) return from;
      }
      return -1;
    };
  }
  
  // extend b into a
  
  var extend = function ( a, b ) { 
    var toStr = Object.prototype.toString;
    var astr = "[object Array]";
    var i;
    
    for ( i in b ) { 
      if ( b.hasOwnProperty( i )  ) {
        if ( typeof b[ i ] === 'object' && ! b[ i ].nodeType ) { 
          
          if ( ! a[ i ] ) { 
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
  
  var capitaliseFirstLetter =  function (string) {
    if(!string) return ''
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  // obj is an array ?
  
  var isArray = function ( obj ) { return obj instanceof Array; }
  
  // obj is an emty object ?
  
  var isEmpty = function ( obj ) {
    var i;
    
    for ( i in obj ) if ( obj.hasOwnProperty( i ) ) return false;
    return true;
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
  
  // storage 
  
  var sheet = {};
  var lookup = { dom: [], factories: [] };
  var num = 0;
  
  // settings
  
  var use;
  var css;
  var styleTag;
  var cartonKeys = [ 'styles', 'type', 'align' ]
  var cartonObj = {
      cell: { 'display': 'inline-block', 'vertical-align': 'top', 'font-size': '0', 'position' : 'relative' }
    , slim: { 'display': 'inline-block', 'vertical-align': 'top', 'font-size': 'medium', 'position': 'relative' }
    , stretch: { 'display': 'block', 'vertical-align': 'top', 'font-size': 'medium', 'position': 'relative' }
    , sticker: { 'position': 'absolute', 'display': 'block', 'font-size': 'medium' } 
    , chopped: { 'position': 'relative', 'display': 'inline', 'vertical-align': 'top', 'font-size': 'medium' }
    , fixed: { 'position': 'fixed', 'display': 'block', 'font-size': 'medium' }
    , fit: { 'position': 'absolute','display': 'block','font-size': 'medium', 'top': 0, 'left': 0, 'right': 0, 'bottom': 0 }
    , alignRight: { 'text-align': 'right' }
    , alignLeft: { 'text-align': 'left' }
    , alignCenter: { 'text-align': 'center' }
  }
  
  // initialize factory 
  
  function init ( settings ) {
    if ( ! document ) throw new Error( 'No document provided.' );
    
    // parse css selectors as id or as class
    
    use = settings.selector || '#';
    
    // set target for css code
    
    styleTag = settings.styleTag || document.createElement( 'style' );
    
    // add or overwrite cartonObject
    
    if ( settings.extend ) extend( cartonObj, settings.extend );
    
    return { 
      add: newFactory(), 
      remove: remove, 
      parse: parse, 
      set: set, 
      get: get, 
      destroy: destroy, 
      index: index,
    }
  }
  
  ///////////////////////////
  
  function Factory () {
    var args = concat.apply( [], arguments );
    var l = args.length;
    var i = 0;
    
    this.dom = args.shift();
    this.id = this.genId();
    this.selector = ''
    this.lookup = [];
    
    // add new cartons
    
    for ( i; i < l; i++ ) {
      if ( args.hasOwnProperty( i ) ) { 
      
        this.indentical( args[ i ] );
      }
    }
    
    // update id or class attribute
    
    this.addSelector();
    
    // add this factory into lookup table
    
    lookup.dom.push( this.dom );
    lookup.factories.push( this );
    return parse();
  } 
  
  Factory.prototype = {   
    indentical: function ( args ) {
      var obj = { query: args.query || false, type: args.type || false,  align: args.align || false }
      var found = find( obj, this.lookup );
      var parsed;
      console.log('args', args )
      if ( found.length ) {
        rmFromSheet( found[ 0 ] );
        parsed = found[ 0 ].update( args );
      } 
      else {
        parsed = this.newCarton( args );
      }
    
      addToSheet( parsed );
    },
    
    newCarton: function ( args ) {
      var obj = extend( { dom: this.dom, id: this.id }, args );
      var carton = new Carton( obj, this );
      var parsed = carton.parse();
      
      this.lookup.push( carton );
      return parsed;
    },
    
    genId: function () {
      var exist = this.dom.getAttribute( 'id' );
    
      if ( use === '#' && exist ) return exist;
      
      if ( ! this.uid ) {
        this.uid = num++;
      }
      
      return 'factory_' + this.uid + '_';
    },
    
    addSelector: function () {
      var i = this.lookup.length; 
      var attrName = ( use === '.' ) ? 'class' : 'id';
      var attr = this.dom.getAttribute( attrName ) || '';
      var value = attr.replace( this.selector, '' );
      var selector = [];
      var parsed;
      
      
      while ( i-- ) {
        parsed = this.lookup[ i ].parse();
        
        ! function ( keys ) {
          var i = 0; var l = keys.length;
         // console.log( parsed.classNames[ i ])
          
          
          for ( i; i<l; i++) {
            
            if ( ! parsed.styles[ keys[ i ] ] ) continue;
            var name = ( use === '#' ) ?  parsed.id : parsed.classNames[ keys[ i ] ]
            if ( selector.indexOf( name ) === -1 ) selector.unshift( name )
            
          }
          
        } (  cartonKeys )
        //console.log( parsed.id )
        /*
        parsed = this.lookup[ i ].parse();
        
        // id
        if ( ! parsed.type.length && ! parsed.styles.length ) continue;
        if ( selector.indexOf( this.id ) === -1 ) selector.unshift( this.id );
        if ( use === '#' ) continue;
        
        // class
        if ( selector.indexOf( parsed.className ) > -1 ) continue;
        if ( parsed.className ) selector.unshift( parsed.className );
        */
      }
      //console.log( selector)
      this.selector = selector.join(' ');
    
       if ( value.length &&  use === '.' ) selector.unshift( value );
    
      if ( selector !== value && selector.length ) { 
        this.dom.setAttribute( attrName, selector.join(' ') );
      }
    },
    
    rmCarton: function ( carton ) {
      var pos = findInIndex( carton, this, 'lookup' ).position
      
      delete this.lookup[ pos ];
      this.lookup.splice( pos, 1 );
    },
    
    destroy: function () {
      var i = this.lookup.length;
      var pos = findInIndex( this, lookup, 'factories'  ).position
      
      while ( i-- ) { 
        this.rmCarton( this.lookup[ i ] );
      }
      
      this.addSelector();
      delete lookup.factories[ pos ];
      lookup.dom.splice( pos, 1 );
      lookup.factories.splice( pos, 1 );
    }
  }
 
  ///////////////////////////
  
  function Carton ( obj, factory ) { 
    extend( this, obj ); 
    //this.align = ''
    this.factory = factory; 
  }
  
  Carton.prototype = {    
    parseStyles: function ( styles, array ) {
      var str = [];
      var i;
    
      for ( i in styles ) {
        if ( styles[ i ] === undefined ) return '';
        else  str.push(  i + ':' + styles[ i ] ); 
      } 
  
      return array ? str.sort() : str.sort().join( ';' ); 
    }, 
    
    parseQuery: function () {
      if ( ! this.query ) return '';
  
      var query = this.query;
      var str = '@media ' + ( query.media || 'all' );
      var i;
  
      for ( i in query ) {
        if ( str.indexOf( query[ i ] ) === -1 ) { 
          str += ' and (' + i + ( query[ i ] === true ? '' : ':'  + query[ i ] ) + ') ';
        }
      }
  
      return str;
    },
  
    parse: function () {
      return  {
        styles: { 
          type: this.parseStyles( cartonObj[ this.type ] )
        , align: this.parseStyles( cartonObj[ 'align'+capitaliseFirstLetter(this.align) ] )
        , styles: this.parseStyles( this.styles )
        },
        classNames: { 
          type: this.parseClassName()
        , align: 'align'+capitaliseFirstLetter(this.align)+'_'
        , styles: this.id
        }
        , type: this.type 
        , query: this.parseQuery()
        , dom: this.dom
        , id: this.id
        }
      
      
      
  
      
      /*
      return {
             // type: this.type,    
             align: this.parseStyles( cartonObj[ 'alignLeft' ] ),
              type: this.parseStyles( cartonObj[ this.type ] ),
         className: this.parseClassName(),
            styles: this.parseStyles( this.styles ),
             query: this.parseQuery(),
               dom: this.dom,
                id: this.id
      }*/
      
    },
  
    parseClassName: function () {
      if ( ! this.type ) return ''; 
  
      var query = this.parseStyles( this.query, true ).join( '_' ).replace( /\:|-/g, '_' );
      var str = '';
  
      if ( query.length ) str += query+'_' ;
      str += this.type+'_';
      //console.log( str )
      return str;
    },
  
    update: function ( setter ) {
      extend( this, setter );
     
      parsed = this.parse();
      this.factory.addSelector();
      
      return this.parse();
    }
  }

  ///////////////////////////
  
  function addToSheet ( carton ) {
    var query = carton.query;
    var type = carton.type;
    var addTo = sheet;
    var styleObj;
    var typeObj;
    
    function exist ( obj, name, type ) {
      if ( ! obj.hasOwnProperty( name ) ) obj[ name ] = type; 
      return obj[ name ];
    }
  
    function add ( parentObj, name, carton ) {
      if ( ! carton.styles[ name ]  ) return;
      var key =  ( use === '#' ) ?  carton.id : carton.classNames[ name ]
      
      var obj = exist( parentObj, carton.styles[ name ], [] );
     // console.log( '>>', name, carton.styles[ name ] )
      //var key = ( name === 'type' && use === '.' ) ? 'className' : 'id'; 
      //var obj = exist( parentObj, carton[ name ], [] );
      obj.push( key );
    }
  
    if ( query ) { 
      addTo = exist( addTo, query, {} );
    }
    
    var i = 0; l = cartonKeys.length;
    
    //console.log('>', cartonKeys, l)
    for ( i; i< l; i++ ) { 
      add( addTo, cartonKeys[ i ], carton );
    }
    
    /*
    if ( type ) { 
      add( addTo, 'typeStyles', carton );
    }
   
    add( addTo, 'styles', carton );
    */
  }
  
  function rmFromSheet ( carton ) {
    var parsed = carton.parse(); 
    var type = parsed.type;
    var className = parsed.className;
    var styles = parsed.styles;
    var query = parsed.query;
    var id = parsed.id;
    var that = this;
    var i;
    
   // rm( styles, id, query );
   // rm( type,  id , query );
    
    var i = 0; l = cartonKeys.length;
    for ( i; i< l; i++ ) { 
      //if ( parsed[ cartonKeys[ i ] ] ) 
      rm( cartonKeys[ i ], id, query );
      //if ( parsed[ cartonKeys[ i ] ] ) 
      //rm( parsed[ cartonKeys[ i ] ] );

    
    }
    
    function rm ( carton ) {
      
    }
   
    function rm ( name, id, query ) {
      if(!parsed.styles[ name ]) return
       var key =  ( use === '#' ) ?  parsed.id : parsed.classNames[ name ]
       var str = parsed.styles[ name ]
       console.log( str )
       var array = query ? sheet[ query ][ str ] : sheet[ str ];
        var i = array.indexOf( key );
  
        array.splice( i, 1 );
  
        if ( query && ! array.length ) { delete sheet[ query ][ str ]; }
        else if ( ! array.length ) { delete sheet[ str ]; }
        
        // rm query if it is emty
        
        if ( query && isEmpty( sheet[ query ] ) ) {  delete sheet[ query ]; }
    } // rm
    
  }
  
  ///////////////////////////

  function parse ( st ) {
    var str = asString();
    styleTag = st || styleTag;
    
    // modern browser and node.js
    if (  typeof styleTag.appendChild === 'function'  ) {
      
      if ( css && styleTag.childNodes.length ) styleTag.removeChild( css );
      css = document.createTextNode( str );
      styleTag.appendChild( css );
    
    } 
    // IE > 9
    else if( styleTag && styleTag.styleSheet ) {
      
      styleTag.styleSheet.cssText = str;
    
    }     
    else { return { css: str } }
    
    return { tag: styleTag, css: str };
  }
    
  function asString ( query ) {
    var css = query || sheet;
    var CSSquery = '';
    var CSSstyle = '';
    var i;
        
    // is needed to remove the duplicated classnames for typeStyles 
    
    function rmDuplicates ( selectors ) {
      if ( use!== '.' ) return selectors;
        
      var l = selectors.length;
      var filter = [];
      var i = 0;
    
      for ( i; i < l; i++ ) {
        if ( filter.indexOf( selectors[ i ] ) === -1 ) { 
          filter.push( selectors[ i ] );
        }
      }
      return filter;
    }
      
    function parseToString ( i ) {
      var array = isArray( css[ i ] );
      var str;
         
      if ( array ) { 
        if ( ! i.length ) return;
        CSSstyle += use + rmDuplicates( css[ i ] ).join( ',' + use );
        CSSstyle += '{' + i + '}\n ';
      }
      else { 
        str = asString( css[ i ] );
        
        if ( ! str.length) return
       
        CSSquery += i + '{ ' + str + '}';
      }
    }
    
    for ( i in css ) parseToString( i );
    return CSSstyle + CSSquery;
  }

  ///////////////////////////
  
  function get ( condition ) {
    var list = lookup.factories; 
    var l = list.length;
    var collect = [];
    var i = 0;
    
    ! function fast () {
        if ( ! condition.dom ) return;
        
        var dom = isArray( condition.dom  ) ? condition.dom : [ condition.dom ];
        var domLength = dom.length;
        var i = 0;
        var pos;
        
        list = [];
    
        for ( i; i < domLength; i++ ) {
          pos = lookup.dom.indexOf( dom[ i ] );
          list = list.concat( lookup.factories[ pos ] );
        }
      
        l = list.length;
    }();
    
    for ( i; i < l; i++ ) {
      var found = find( condition, list[ i ].lookup );
      collect = collect.concat( found );
    }
    
    return collect;
  }
  
  function find ( condition, lookup ) {
    var toStr = Object.prototype.toString;
    var astr = "[object Array]";
    var cartonList = [];
    
    ! function () {
      var l = lookup.length;
      var i = 0;
      
      for ( i; i < l; i++ ) {
        if ( ! proof( lookup[ i ], condition ) ) continue;
        cartonList.push( lookup[ i ] );
      }
    
    }();
    
    function proof ( carton, condition ) {
      var lock = ( ! carton ) ? false : true;
      var conditionIsArray;
      var existInCarton;
      var isntABoolean;
      var i;
      
      for ( i in condition ) {
        
        if ( ! lock ) break;
        
        conditionIsArray = isArray( condition[ i ] );
           existInCarton = ( typeof carton[ i ] !== 'undefined' );
            isntABoolean = ( typeof condition[ i ] !== 'boolean' );
        
        // if condition is an obj start recursion
        
        if ( ! conditionIsArray && typeof condition[ i ] === 'object' && ! condition[ i ].nodeType ) { 
          if ( ! proof( carton[ i ], condition[ i ] ) ) { 
            lock = false;
          } 
          continue;
        }
        
        // if condition is a list proof if value of the carton can be found in it  
        
        else if ( conditionIsArray && condition[ i ].indexOf( carton[ i ] ) === -1 ) { lock = false; continue; }
        
        // if condition is true and only it's key must exist in carton
        
        else if ( ! existInCarton && condition[ i ] === true ) { lock = false; continue; }
        
        // if condition is false and key should not exist in carton
        
        else if ( existInCarton && condition[ i ] === false  ) { lock = false; continue; }
        
        // if condition should be the same as in carton 
        
        else if ( isntABoolean && ! conditionIsArray && condition[ i ] !== carton[ i ] ) { lock = false; continue; }
        
        // if condition doesn't exit
        
        else if ( isntABoolean && ! existInCarton ) { lock = false; continue; }
      }
      
      return lock;
    }
    
    return cartonList;
  }
  
  ///////////////////////////

  function set ( getter, setter ) {
    var cartons = get( getter );
    var collectChanges = [];
    var i = cartons.length;
  
    function rm () { rmFromSheet( cartons[ i ] ); }
  
   
    function update () {
      var parsed = cartons[ i ].update( setter );
      console.log( parsed )
      addToSheet( parsed );
      collectChanges.push( parsed ); 
    } 
    
    while ( i-- ) { rm.call( this ); update.call( this );  }
    return { cartons: collectChanges, parsed: parse() }
  }
  
  ///////////////////////////
  
  // remove a carton
  
  function remove ( get ) {
    var cartons = this.get( get );
    var i = cartons.length;
    var collectRm = [];
    
    function rm () {
      var carton = cartons[ i ];
      var parsed = carton.parse();
      collectRm.push( parsed );
      updateFactory( carton );
      rmFromSheet( carton );
    }
    
    function updateFactory ( carton ) {
      var factory = findInIndex( carton.dom, lookup, 'dom', 'factories' ).obj; 
      factory.rmCarton( carton );
      factory.addSelector();
    }
    
    while ( i-- ) { rm.call( this ) };
    return { cartons: collectRm, parsed: parse() };
  }
  
  ///////////////////////////
  
  // destroy a factory
  
  function destroy ( dom ) {
    var factory = findInIndex( dom, lookup, 'dom', 'factories' ).obj;
    var i = factory.lookup.length;
    var collectRm = [];
    
    while ( i-- ) { 
      rmFromSheet( factory.lookup[ i ] );
      collectRm.push( factory.lookup[ i ].parse() );
    }
    
    factory.destroy();
    return { cartons: collectRm, parsed: parse() };
  }

  ///////////////////////////
  
  // workaround to use apply on an prototype 
  
  function newFactory () {
    function F ( args ) { return Factory.apply( this, args ); }
    F.prototype = Factory.prototype;
    
    return function () {
      var args = arguments;
      return new F( args );
    }
  }
  
  /////////////////////////// 
  
  function index ( key ) {
    return ( lookup[ key ] ? lookup[ key ] : [] )
  }
  
  function findInIndex ( elm, obj, search, index ) {
    var pos = obj[ search ].indexOf( elm );
    index = index || search;
    return { obj: obj[ index ][ pos ], position: pos };
  }
}();

/*
@mixin image-2x($image, $width, $height) {
  @media (min--moz-device-pixel-ratio: 1.3),
         (-o-min-device-pixel-ratio: 2.6/2),
         (-webkit-min-device-pixel-ratio: 1.3),
         (min-device-pixel-ratio: 1.3),
         (min-resolution: 1.3dppx) {
    // on retina, use image that's scaled by 2 
    background-image: url($image);
    background-size: $width $height;
  }
}

*/