! function () {

  typeof module == "object"
       ? module.exports = init
       : window.cartonFactory = init
       ;
  
  // cache select array methods
  
  var shift = Array.prototype.shift;
  var concat = Array.prototype.concat;
  
  // storage 
  
  var cartons = [];
  var sheet = {};
  var numOfFactories = 0;
  
  // settings
  
  var use = '#';
  var callback;
  
  // initialize factory
  
  function init ( sel, cb ) {
    callback = cb;
    use = sel || use;
    
    return { 
      add: newFactory()
    , remove: remove
    , parse: parse
    , set: set
    , get: get 
    }
  }
  
////////// FACTORY.PROTOTYPE   
  
  function Factory () {
    var args = concat.apply( [], arguments );
    this.dom = args.shift();
    this.id = this.genId()
    var l = args.length;
    var i = 0;
  
    for ( i; i < l; i++ ) this.newCarton( args[ i ] );
  } 
  
  Factory.fn = Factory.prototype;
  
  Factory.fn.newCarton = function ( args ) {
    var obj = extend( { dom: this.dom, id: this.id }, args );
    var carton = new Carton( obj );
    var parsed = carton.parse();
  
    cartons.push( carton );
    addToSheet( parsed );
    selector( this.dom );
  } 
  
  Factory.fn.genId = function () {
    var alreadyInUse = this.dom.getAttribute( 'id' );
    if ( use === '#' && alreadyInUse ) return alreadyInUse;
    if ( ! this.uid ) this.uid = numOfFactories++;
    return '_factory_' + this.uid;
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
  
  function selector ( dom ) {
    var sel = ( use === '.' ) ? 'class' : 'id'; 
    var cartons = get({ dom: dom })
    var getAttr = ( use === '.' ) ? dom.getAttribute('class') : ''
    var l = cartons.length;
    var attr = [];
    var i = 0;
    var parse;
    
    for ( i in cartons ) {
      parse = cartons[ i ].parse();
      if ( attr.indexOf( parse.id ) === -1 ) attr.push( parse.id );
      if ( attr.indexOf( parse.className ) === -1 && use === '.' ) attr.push( parse.className );
    }
    
    ! function cleanUpClass () {
        
        // this block is ugly
        
        if ( ! getAttr || use === '#' ) return;
        
        var cs = Carton.prototype.cartonStyles;
        var req;
        var i;
        
        for ( i in cs ) {
          req  = new RegExp(' (_(.*)_'+i+')|(_(.*)_'+i+') ', 'g');
          getAttr = getAttr.replace( req, '' );
        }
        
        getAttr = getAttr.replace( parse.id, '' ); // rm existing id
        
        attr = getAttr.split( ' ' ).concat( attr );
    }();
    
    if ( attr.length ) dom.setAttribute( sel, attr.join( ' ' ) );
    return attr; 
  }
  
  function parse ( query ) {
    var css = query || sheet;
    var CSSquery = '';
    var CSSstyle = '';
    var sel = use
    var i;
    
      // is needed to remove the duplicated classnames for typeStyles 
    
      function rmDuplicates ( selectors ) {
        
        if ( sel !== '.' ) return selectors;
        
        var l = selectors.length;
        var filter = [];
        var i = 0;
    
        for ( i; i < l; i++ ) if ( filter.indexOf( selectors[ i ] ) === -1 ) filter.push( selectors[ i ] );
        return filter;
      }
      
      function parseToString ( i ) {
        
        if ( ! css[ i ] ) return CSSstr;
        
        var array = isArray( css[ i ] );
        
        if ( array ) { 
          
          CSSstyle += sel + rmDuplicates( css[ i ] ).join( ','+ sel );
          CSSstyle += '{' + i + '}\n ';
        }
        else { 
          
          CSSquery += i + '{ ' + parse( css[ i ] ) + '}';
        }
      }
    
      for ( i in css ) parseToString( i );
      return CSSstyle + CSSquery;
  }
  
////////// SETTER & GETTER

  function set ( getter, setter ) {
    var cartons = get( getter );
    var collectChanges = [];
    var i = cartons.length;
   
    function rm () {
      var carton = cartons[ i ];
      var parsed = carton.parse();
      rmFromSheet( carton );
    }
  
    function update () {
      var carton = cartons[ i ];
      var parsed;
  
      if ( setter.type ) carton.type = setter.type;
      extend( carton.styles, setter.styles ) 
  
      parsed = carton.parse();
      addToSheet( parsed );
      selector( carton.dom );
      collectChanges.push( parsed );
    }
  
    while ( i-- ) { rm.call( this ); update.call( this ); }
    return { cartons: collectChanges, parsed: parse() }
  }
  
  function get ( condition ) {
    var styles = condition.styles;
    var query = condition.query;
    var type = condition.type; 
    var dom = condition.dom;
    var l = cartons.length;
    var work = [];
    var i = 0;
    
    function checkType ( cursor ) {
      return ( type !== undefined ) 
           ? ( typeof type !== 'boolean' && type.indexOf( cursor.type ) > -1 // if type is defined as single string or an array of strings that contain one or more carton types
            || type === true && cursor.type // if type is set to true find every carton with a type
            || type === false && cursor.type === undefined ) // if type is set to false find every carton without a type
             : true // if type is not defined in condition
             ;
    }
    
    function filter ( i ) {
      var cursor = cartons[ i ];
      var hasNoType = ( type === undefined );
      var isDom  = ( dom === cartons[ i ].dom );
      var matchStyles;
      var matchQuery;
      var matchType;
      
      if ( isDom && hasNoType && ! query && ! styles ) { 
      
        work.push( cursor );
      }
      else if ( isDom || ! dom && ( ! hasNoType || query || styles ) ) {
        matchType = checkType( cursor );
        matchQuery =   query ? cursor.match( 'query', query )   : true;
        matchStyles = styles ? cursor.match( 'styles', styles ) : true;
        
        //console.log('RRR', matchStyles )
        if ( matchQuery && matchStyles && matchType ) work.push( cursor ); 
      }
    }
    
    for ( i; i < l; i++ ) filter( i );
    return work;
  }

////////// RM
  
  function remove ( get ) {
    var cartons = this.get( get );
    var i = cartons.length;
    var collectRm = [];
  
    function rm () {
      var carton = cartons[ i ];
      var parsed = carton.parse();
  
      collectRm.push( parsed );
      rmFromIndex( cartons[ i ] );
      rmFromSheet( carton );
      selector( parsed.dom );
    }
  
    while ( i-- ) { rm.call( this ) };
    return { cartons: collectRm, parsed: parse() } ;
  }
  
  function rmFromIndex ( cartonObj ) {
    var i = cartons.indexOf( cartonObj );
    delete cartons[ i ];
    cartons.splice( i, 1 );
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
    
    function rm ( str, id, query ) {
      if ( ! str ) return;
 
      var array = query ? sheet[ query ][ str ] : sheet[ str ];
        var i = array.indexOf( id );
 
        array.splice( i, 1 );
 
        //console.log( sheet[ query ] )
 
        if ( query && ! array.length ) {
 
          delete sheet[ query ][ str ];
        }
        else if ( ! array.length ) {
 
          delete sheet[ str ]; 
        }
 
        if ( query && isEmpty( sheet[ query ] ) ) { 
 
          delete sheet[ query ]; // rm query if emty
        }
      }
 
      rm( styles, id, query );
      rm( typeStyles, use === '.' ? id : className, query );
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
        //if (  toStr.call( b[ i ] ) !== toStr.call( a[ i ] ) ) { 
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
  
  

  
  ////////// CARTON.PROTOTYPE 
  
    function Carton ( obj ) { extend( this, obj ); }
    Carton.fn = Carton.prototype;
  
    Carton.fn.cartonStyles = { 
      cell: { 'display': 'inline-block', 'vertical-align': 'top', 'font-size': '0', 'position' : 'relative' }
    , slim: { 'display': 'inline-block', 'vertical-align': 'top', 'font-size': 'medium', 'position': 'relative' }
    , stretch: { 'display': 'block', 'vertical-align': 'top', 'font-size': 'medium', 'position': 'relative' }
    , sticker: { 'position': 'absolute', 'display': 'block', 'font-size': 'medium' } 
    /*, alignRight: { 'text-align': 'right' }
    , alignLeft: { 'text-align': 'left' }
    , alignCenter: { 'text-align': 'left' }*/
    }
  
    Carton.fn.parseStyles = function ( styles, asArray ) {
      var str = [];
      var i;
      
      function add ( key, list ) { 
        var i = 0; 
        var l = list.length; 
        for ( i;  i <l; i++ ) str.push(  key + ':' + list[ i ] );  
      }
      
      for ( i in styles ) {
        if ( styles[ i ] === undefined ) return '';
        if ( styles[ i ] === true ) str.push( i ); // this is only for getting ( style: true ) 
        else if ( styles[ i ] === false ) str.push( '^((?!'+i+').)*$' ); // this is only for getting ( style: false ) 
        else add( i, isArray( styles[ i ] ) ? styles[ i ] : [ styles[ i ] ]  )
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
          str += ' and (' +  i + ( query[ i ] === true ? '' : ':'  + query[ i ] ) + ')';
        }
      }
  
      return str;
    }
  
    Carton.fn.match = function ( where, key ) {
   //  console.log( 'key', key )
      var l = objLength( key )
      var parser = this.parseStyles; // used in a "wrongly" way to parse query and style objects to an array of strings
      var key = parser( key, true );
      var regular = new RegExp( '('+key.join( ')|(' )+')', 'gi' );
      //console.log('match', parser( this[ where ] ).match( regular ), parser( this[ where ] ),regular,key )
      var match = parser( this[ where ] ).match( regular );
      //console.log( '?',key.length == match.length)
      return  match && l == match.length; 
    }
  
    Carton.fn.parse = function () {
  
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
  
      if ( query.length ) str += '_' + query;
      str += '_' + this.type;
      return str;
    }
}();