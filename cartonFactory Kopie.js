! function () {

  typeof module == "object"
       ? module.exports = init
       : window.cartonFactory = init
       ;

  var concat = Array.prototype.concat;
  var parse 
////////////////////
  Factory.prototype.cartons = [];
  Factory.prototype.sheet = {};
  Factory.prototype.numOfFactories = 0;
  Factory.prototype.use =  '#';
  
  var cartons = []
  var sheet = []
  var numOfFactories = 0;
  var use = '#'
  
  function init( selector ) {
    //if( selector ) Factory.prototype.use = selector
    function F( args ) {
      return Factory.apply(this, args);
    }
    
    F.prototype = Factory.prototype;
   
    return { 
      cartons: function() {
        var args = arguments
        return new F( args );
      }
    }
    
    
  }

//////////////////
  function Factory () {
    var proto = this.__proto__;
    var args = concat.apply( [], arguments );
    var i = 0;
    var l;

    this.dom = args.shift();
    this.id = this.genId()
    l = args.length;

    for ( i; i < l; i++ ) this.newCarton( args[ i ] );

    parse  = function ( query ) {
      var sheet = query || proto.sheet;
      var CSSquery = '';
      var CSSstyle = '';
      var sel = proto.use
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

      for ( i in sheet ) {
        if ( ! sheet[ i ] ) return CSSstr;
        if ( sheet[ i ] instanceof Array  ) CSSstyle += '\n' + sel + rmDuplicates( sheet[ i ] ).join( ','+ sel ) + '{' + i + '} ';
        else  CSSquery += '\n' + i + '{ ' + Factory.parseSheetToCss( sheet[ i ] ) + '\n}';
      }

      return CSSstyle + CSSquery + '\n';
    }
  }

//////////
  Factory.prototype.newCarton = function ( args ) {
    var proto = this.__proto__;
    var use = proto.use; 
    var obj = this.extend( { dom: this.dom, id: this.id }, args );
    var carton = new Carton( obj );
    var parsed = carton.parse();

    proto.cartons.push( carton );
    this.addToSheet( parsed );
    this.selector( this.dom );
  } 

//////////
  Factory.addToSheet = function ( carton ) {
    var addTo = this.__proto__.sheet;
    var query = carton.query;
    var use = this.__proto__.use;
    var type = carton.type;
    var styleObj;
    var typeObj;

    function exist ( obj, name, type ) {
      if ( ! obj.hasOwnProperty( name ) ) obj[ name ] = type; 
      return obj[ name ];
    }

    function add ( obj, parentObj, name, carton ) {
      obj = exist( parentObj, carton[ name ], [] );

      if ( name === 'typeStyles' && use === '.') { 

        //if ( obj.indexOf(carton.className) < 0 ) 
        obj.push( carton.className  );
      }  
      else obj.push( carton.id );
    }

    if ( query ) addTo = exist( addTo, query, {} );
    if ( type ) add( typeObj, addTo, 'typeStyles', carton );

    add( styleObj, addTo, 'styles', carton );
  }

/////////
  Factory.prototype.get = function ( condition ) {
    var cartons = this.__proto__.cartons;
    var styles = condition.styles;
    var query = condition.query;
    var type = condition.type 
    var dom = condition.dom
    var l = cartons.length;
    var matchStyles;
    var matchQuery;
    var work = [];
    var cursor;
    var i = 0;

    function checkType () {
      return ( type !== undefined ) 
           ? ( typeof type !== 'boolean' && type.indexOf( cursor.type ) > -1 // if type is defined as single string or an array of strings that contain one or more carton types
            || type === true && cursor.type // if type is set to true find every carton with a type
            || type === false && cursor.type === undefined ) // if type is set to false find every carton without a type
             : true // if type is not defined in condition
             ;
    }

    for ( i; i < l; i++ ) {

      cursor = cartons[ i ];

      if ( dom === cartons[ i ].dom  && type === undefined && ! query && ! styles ) {
        work.push( cursor );
      } 
      else if ( dom === cartons[ i ].dom || ! dom ) {

          matchType = checkType(); 
         matchQuery = query  ? cursor.match( 'query', query ) : true;
        matchStyles = styles ? cursor.match( 'styles', styles ) : true;

        if ( matchQuery && matchStyles && matchType ) work.push( cursor ); 
      }
    }

    return work;
  }

/////////
  Factory.prototype.set = function ( get, set ) {
    var cartons = this.get( get );
    var i = cartons.length;
    var proto = this.__proto__;
    var use = proto.use; 
    var collectChanges = []

    function rm () {
      var carton = cartons[ i ];
      var parsed = carton.parse();
      this.rmFromSheet( carton );
    }

    function update () {
      var carton = cartons[ i ];
      var parsed;

      if ( set.type ) carton.type = set.type;
      this.extend( carton.styles, set.styles ) 

      parsed = carton.parse();
      this.addToSheet( parsed );
      this.selector( carton.dom );
      if ( use === '.' ) this.selector( carton.dom, parsed.className );
      collectChanges.push( parsed );
    }

    while ( i-- ) { rm.call( this ); update.call( this ); }

    return { cartons: collectChanges, sheet: Factory.parseSheetToCss() } ;
  }

  Factory.prototype.rmFromIndex = function ( cartonObj ) {
    var i = this.__proto__.cartons.indexOf( cartonObj );
    delete this.__proto__.cartons[ i ];
    this.__proto__.cartons.splice( i, 1 );
  }

/////////
  Factory.prototype.remove = function ( get ) {
    var cartons = this.get( get );
    var i = cartons.length;
    var proto = this.__proto__;
    var use = proto.use; 
    var collectRm = [];

    function rm () {
      var carton = cartons[ i ];
      var parsed = carton.parse();

      collectRm.push( parsed );
      this.rmFromIndex( cartons[ i ] );
      this.rmFromSheet( carton );
      this.selector( parsed.dom );
    }

    while ( i-- ) { rm.call( this ) };
    return { cartons: collectRm, sheet: Factory.parseSheetToCss() } ;
  }

/////////
  Factory.prototype.rmFromSheet = function ( carton ) {
     var parsed = carton.parse(); 
     var sheet = this.__proto__.sheet;
     var typeStyles = parsed.typeStyles;
     var className = parsed.className
     var use = this.__proto__.use;
     var styles = parsed.styles;
     var isEmpty = this.isEmpty;
     var query = parsed.query;
     var id = parsed.id;
     var i;
     var that = this;


     function rm ( str, id, query ) {

       if ( ! str  ) return;

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

/////////  
  Factory.prototype.genId = function () {
    var alreadyInUse = this.dom.getAttribute( 'id' );
    var use = this.__proto__.use;

    if ( use === '#' && alreadyInUse ) return alreadyInUse;
    if ( ! this.uid ) this.uid = this.__proto__.numOfFactories++;
    return '_factory_' + this.uid;
  }

/////////
  Factory.prototype.extend = function ( a, b ) { 

    // b into a !

    var i; 
    var toStr = Object.prototype.toString;
    var astr = "[object Array]";

    //a = a || {}; 

    for ( i in b ) { 
      if ( b.hasOwnProperty( i )  ) {
        if ( typeof b[ i ] === 'object' && ! b[ i ].nodeType ) { 
        if ( ! a[ i ] ) a[ i ] = ( toStr.call( b[ i ] ) === astr ) ? [] : {};
          this.extend( a[ i ] , b[ i ] );
        }
        else {
          a[ i ] = b[ i ];
        }
      }
    }

    return a;
  }

//////////
  Factory.prototype.isEmpty = function  ( obj ) {
    var i;
    for ( i in obj ) if ( obj.hasOwnProperty( i ) ) return false;
    return true;
  }

/////////
  Factory.prototype.selector = function ( dom ) {
    var use = Factory.prototype.use;
    var sel = ( use === '.' ) ? 'class' : 'id'; 
    var cartons = this.get({ dom: dom })
    var l = cartons.length;
    var attr = [];
    var i = 0;
    var parse;

    for ( i in cartons ) {
      parse = cartons[ i ].parse();

      if( attr.indexOf( parse.id ) === -1 ) attr.push( parse.id );
      if( attr.indexOf( parse.className ) === -1 && use === '.' ) attr.push( parse.className );
    }

    dom.setAttribute( sel, attr.join( ' ' ) );
  }







}()