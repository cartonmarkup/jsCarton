// cartonFactory.js 0.0.1

// (c) 2013 Mathias Prinz
// cartonFactory.js is distributed under the MIT license.
// For more details, see http://cssCarton.com
// needs: cartons with more than one type, set a new carton to an existing,l, 


! function () {
 
  
  if (!Array.prototype.indexOf)
  {
    Array.prototype.indexOf = function(elt /*, from*/)
    {
      var len = this.length >>> 0;
  
      var from = Number(arguments[1]) || 0;
      from = (from < 0)
           ? Math.ceil(from)
           : Math.floor(from);
      if (from < 0)
        from += len;
  
      for (; from < len; from++)
      {
        if (from in this &&
            this[from] === elt)
          return from;
      }
      return -1;
    };
  }
  
  // cache select array methods

  var shift = Array.prototype.shift;
  var concat = Array.prototype.concat;
  
  // storage 
  
  var sel = {}
  var lookup = { dom: [], factories: [] };
  var sheet = {};
  var numOfFactories = 0;
  
  // settings
  
  var use = '#';
  var callback;
  var target;
  
  // initialize factory
  
  function init ( sel, t ) {
    use =  sel || use;
    target = t || document.createElement( 'style' );
    return { add: newFactory(), remove: remove, parse: parse, set: set, get: get, destroy: destroy, index: index }
  }

  typeof module == "object"
  ? module.exports = init
  : window.cartonFactory = init
  ;
////////// FACTORY.PROTOTYPE   
  
  function Factory () {
    var args = concat.apply( [], arguments );
    var l = args.length;
    var i = 0;
    
    this.dom = args.shift();
    this.id = this.genId();
    this.selector = ''
    this.lookup = [];
    
    for ( i; i < l; i++ ) if ( args.hasOwnProperty( i ) ) this.indentical( args[ i ] );
    
    this.addSelector();
    lookup.dom.push( this.dom );
    lookup.factories.push( this );
   
  } 
  
  Factory.fn = Factory.prototype;
  
  // create a new carton 
  Factory.fn.indentical = function ( args ) {
    var parsed;
    var obj = { query: args.query || false, type: args.type || false }
    var found = find( obj, this.lookup );
    
    if ( found.length ) {
      rmFromSheet( found[ 0 ] );
      parsed = found[ 0 ].update( args );
    } 
    else {
      parsed = this.newCarton( args );
    }
    
    addToSheet( parsed );
  }
  
  Factory.fn.newCarton = function ( args ) {
    var obj = extend( { dom: this.dom, id: this.id }, args );
    var carton = new Carton( obj, this );
    var parsed = carton.parse();
    
    this.lookup.push( carton );
    return parsed;
  } 
  
  // generate id that is used for dom and factory
  
  Factory.fn.genId = function () {
    var alreadyInUse = this.dom.getAttribute( 'id' );
    
    if ( use === '#' && alreadyInUse ) return alreadyInUse;
    if ( ! this.uid ) this.uid = numOfFactories++;
    return 'factory_' + this.uid + '_';
  }
  
  // add selector to link factory into dom
  
  Factory.fn.addSelector = function () {
    var i = this.lookup.length; 
    var attr = ( use === '.' ) ? 'class' : 'id';
   
    var value =  ( this.dom.getAttribute( attr ) || '' ).replace( this.selector, '' );
    var selector = [];
    
    while ( i-- ) {
      var parsed = this.lookup[ i ].parse();
      if ( ! parsed.typeStyles.length && ! parsed.styles.length ) continue;
      if ( selector.indexOf( this.id ) === -1 ) selector.unshift( this.id );
      
      if ( use === '#' ) continue;
      if ( selector.indexOf( parsed.className ) > -1 ) continue;
      if ( parsed.className ) selector.unshift( parsed.className );
      
    }
    
    this.selector = selector.join(' ');
    
    if ( value.length ) selector.unshift( value );
    
    if ( selector !== value && selector.length ) { 
      this.dom.setAttribute( attr, selector.join(' ') );
    }
  }
  
  Factory.fn.rmCarton = function ( carton ) {
    var pos = findInIndex( carton, this, 'lookup' ).position
    delete this.lookup[ pos ];
    this.lookup.splice( pos, 1 );
  }
  
  Factory.fn.destroy = function () {
    var i = this.lookup.length;
    var pos = findInIndex( this, lookup, 'factories'  ).position
    while ( i-- ) this.rmCarton( this.lookup[ i ] );
    this.addSelector();
    delete lookup.factories[ pos ];
    lookup.dom.splice( pos, 1 );
    lookup.factories.splice( pos, 1 );
  }

 
////////// CARTON.PROTOTYPE 
  
  function Carton ( obj, f ) { extend( this, obj ); this.factory = f; }
  Carton.fn = Carton.prototype;
  
  Carton.fn.cartonStyles = { 
    cell: { 'display': 'inline-block', 'vertical-align': 'top', 'font-size': '0', 'position' : 'relative' }
  , slim: { 'display': 'inline-block', 'vertical-align': 'top', 'font-size': 'medium', 'position': 'relative' }
  , stretch: { 'display': 'block', 'vertical-align': 'top', 'font-size': 'medium', 'position': 'relative' }
  , sticker: { 'position': 'absolute', 'display': 'block', 'font-size': 'medium' } 
  , chopped: { 'position': 'relative', 'display': 'inline', 'vertical-align': 'top', 'font-size': 'medium' }
  , fixed: { 'position': 'fixed', 'display': 'block', 'font-size': 'medium' }
  , fit: { 'position': 'absolute','display': 'block','font-size': 'medium', 'top': 0, 'left': 0, 'right': 0, 'bottom': 0 }
  , alignRight: { 'text-align': 'right' }
  , alignLeft: { 'text-align': 'left' }
  , alignCenter: { 'text-align': 'left' }
  


  
  }
  
  Carton.fn.parseStyles = function ( styles, asArray ) {
    var str = [];
    var i;
    
    for ( i in styles ) {
      if ( styles[ i ] === undefined ) return '';
      else  str.push(  i + ':' + styles[ i ] ); 
    } 
  
    return asArray ? str.sort() : str.sort().join( ';' ); 
  }
  
  Carton.fn.parseQuery = function () {
  
    if ( ! this.query ) return '';
  
    var query = this.query;
    var str = '@media ' + ( query.media || 'all' );
    var i;
  
    for ( i in query ) {
      if ( str.indexOf( query[ i ] ) === -1 ) { 
        str += ' and (' +  i + ( query[ i ] === true ? '' : ':'  + query[ i ] ) + ') ';
      }
    }
  
    return str;
  }
  
  
  Carton.fn.parse = function () {
    //console.log( this.id, this.cartonStyles[ this.type ], this.parseStyles( this.cartonStyles[ this.type ] ))
    return {
          type: this.type,
    typeStyles: this.parseStyles( this.cartonStyles[ this.type ] ),
     className: this.parseClassName(),
        styles: this.parseStyles( this.styles ),
         query: this.parseQuery(),
           dom: this.dom,
            id: this.id
    }
  }
  
  Carton.fn.parseClassName = function () {
  
    if ( ! this.type ) return ''; 
  
    var query = this.parseStyles( this.query, true ).join( '_' ).replace( /\:|-/g, '_' );
    var str = '';
  
    if ( query.length ) str += query+'_' ;
    str += this.type+'_';
    return str;
  }
  
  Carton.fn.update = function ( setter ) {
    //var factory = findInIndex( this.dom, lookup, 'dom', 'factories' ).obj;
    //if ( setter.type ) carton.type = setter.type;
    extend( this, setter ) 
    parsed = this.parse();
    this.factory.addSelector();
    return this.parse()
  }




  
////////// FACTORY METHODS   
  
  function addToSheet ( carton ) {
    var query = carton.query;
    var type = carton.type;
    var addTo = sheet;
    var styleObj;
    var typeObj;
  
    function exist ( obj, name, type ) {
      if ( ! obj.hasOwnProperty( name ) ) obj[ name ] = type; 
      //console.log( name)
      return obj[ name ];
    }
  
    function add ( parentObj, name, carton ) {
      var key = ( name === 'typeStyles' && use === '.' ) ? 'className' : 'id'; 
      var obj = exist( parentObj, carton[ name ], [] );
      
      obj.push( carton[ key ] );
    }
  
    if ( query ) addTo = exist( addTo, query, {} );
    if ( type ) add( addTo, 'typeStyles', carton );
    add( addTo, 'styles', carton );
  }
  
  
  function parse ( s ) {
    s = s || target;
    var str = asString();

     try {
       s.innerHTML =  str   
       } catch(e) {
    
       s.styleSheet.cssText = str//"body{background:red}";
     }
      
      
      return { tag: s, css: str };
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
    
      for ( i; i < l; i++ ) if ( filter.indexOf( selectors[ i ] ) === -1 ) filter.push( selectors[ i ] );
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
        
        if (!str.length) return
        CSSquery += i + '{ ' + str + '}';
      }
    }
    
    for ( i in css ) parseToString( i );
    return CSSstyle + CSSquery;
  }

////////// GETTER
  
  function get ( condition ) {
    var list = lookup.factories; 
    var l = list.length;
    var collect = [];
    var i = 0;
    
    ( function fast () {
      
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
    } )()
    ;
    
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
    
  ( function () {
      var l = lookup.length;
      var i = 0;
      
      for ( i; i < l; i++ ) {
        if ( ! proof( lookup[ i ], condition ) ) continue;
        cartonList.push( lookup[ i ] );
      }
    
    })()
    ;
    
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
////////// SETTER

  function set ( getter, setter ) {
    var cartons = get( getter );
    var collectChanges = [];
    var i = cartons.length;
  
    while ( i-- ) { rm.call( this ); update.call( this ); }
    return { cartons: collectChanges, parsed: parse() }
  
    function rm () { rmFromSheet( cartons[ i ] ); }
  
    function update () {
      var parsed = cartons[ i ].update( setter );
      addToSheet( parsed );
      collectChanges.push( parsed ); 
    } 
  }

////////// DESTROY FACTORY
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


////////// RM
  
  function remove ( get ) {
    var cartons = this.get( get );
    var i = cartons.length;
    var collectRm = [];
    
    while ( i-- ) { rm.call( this ) };
    return { cartons: collectRm, parsed: parse() };

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
  }
  
  function rmFromSheet ( carton ) {
    var parsed = carton.parse(); 
    var typeStyles = parsed.typeStyles;
    var className = parsed.className;
    var styles = parsed.styles;
    var query = parsed.query;
    var id = parsed.id;
    var that = this;
    var i;
    
    rm( styles, id, query );
    rm( typeStyles, use === '.' ? id : className, query );
    
    function rm ( str, id, query ) {
      if ( ! str ) return;
 
      var array = query ? sheet[ query ][ str ] : sheet[ str ];
        var i = array.indexOf( id );
 
        array.splice( i, 1 );
 
        if ( query && ! array.length ) { delete sheet[ query ][ str ]; }
        else if ( ! array.length ) { delete sheet[ str ]; }
        
        // rm query if it is emty
        
        if ( query && isEmpty( sheet[ query ] ) ) {  delete sheet[ query ]; }
    } // rm
  }
  
  function index ( key ) {
    return ( lookup[ key ] ? lookup[ key ] : [] )
  }
  
  function findInIndex ( elm, obj, search, index ) {
    index = index || search;
    var pos = obj[ search ].indexOf( elm );
    return { obj: obj[ index ][ pos ], position: pos };
  }
  
  

////////// HELP
  
  // workaround to use apply on an prototype 
  
  function newFactory () {
    
    function F ( args ) { return Factory.apply( this, args ); }
    F.prototype = Factory.prototype;
    
    return function () {
      var args = arguments;
      return new F( args );
    }
  } 
  
  // test if passed argument is an array
  
  function isArray ( el ) { return el instanceof Array; }
  
  // test if passed obj is emty
  
  function isEmpty ( obj ) {
    var i;
    for ( i in obj ) if ( obj.hasOwnProperty( i ) ) return false;
    return true;
  }
  
  function objLength ( obj ) {
    var i; 
    var count = 0; 
    for ( i in obj ) { count++; }; 
   
    return count  
  }
  
  function extend ( a, b ) { 

    // b into a !

    var i; 
    var toStr = Object.prototype.toString;
    var astr = "[object Array]";

    //a = a || {}; 

    for ( i in b ) { 
      if ( b.hasOwnProperty( i )  ) {
        if ( typeof b[ i ] === 'object' && ! b[ i ].nodeType ) { 
        if ( ! a[ i ] ) a[ i ] = ( toStr.call( b[ i ] ) === astr ) ? [] : {};
          extend( a[ i ] , b[ i ] );
        }
        else {
          a[ i ] = b[ i ];
        }
      }
    }

    return a;
  }
  
  

  

}();