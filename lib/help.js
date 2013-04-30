// help.js 0.1.0

// (c) 2013 Mathias Prinz
// cartonFactory.js is distributed under the MIT license.
// For more details, see http: http://github.com/cartonmarkup/jsCarton

! function () {

  typeof module == "object" ? module.exports = help() : window.help = help();

  function help () {
    return  { 
      mix: mix,
      capitaliseFirstLetter: capitaliseFirstLetter,
      hyphenify: hyphenify,
      has: has,
      px: px,
      isUndefined: isUndefined,
      isArray: isArray,
      isObject: isObject,
      isString: isString,
      isBoolean: isBoolean,
      isEmpty: isEmpty,
      isFunction: isFunction
    }
  }

  //////////////////////////////////////////////////////

  // indexOf shim for IE > 9 to search in arrays

  if ( ! Array.prototype.indexOf ) {

    Array.prototype.indexOf = function( elt /*, from*/ ) {
      var l = this.length >>> 0;
      var from = Number( arguments[ 1 ] ) || 0;
      from = ( from < 0 ) ? Math.ceil( from ) : Math.floor( from );
      if ( from < 0 ) from += l;
      for ( ; from < l; from = from + 1 ) {
        if ( from in this && this[ from ] === elt ) return from;
      }
      return -1;
    };
  }

  //////////////////////////////////////////////////////

  function mix ( a, b, settings ) {
    var settings = settings || {}
    var overwrite = settings.overwrite  !== undefined ? settings.overwrite : true;
    var add = settings.add !== undefined ?  settings.add : true;
    var deep = settings.deep !== undefined ? settings.deep : true;
    var exclude = settings.exclude !== undefined  ? settings.exclude : false;
    var PX = settings.px !== undefined ?  settings.px : false;
    var HYP = settings.hyphenify !== undefined ? settings.hyphenify : false;
    var toStr = Object.prototype.toString;
    var astr = '[object Array]';
    var keyValue;
    var i;

    function hyphenifyPx ( key, value ) {

      if ( HYP ) {

        key = hyphenify( key );
      }

      if ( PX && isNumber( value ) ) {

        value = px( value );
      } 

      if ( deep === false && isObject( value ) || isArray( value ) ) {

        value =  mix( {}, value, { deep: true, px: PX, hyphenify: HYP } );
      }

      return { key: key, value: value }
    }

    for ( i in b ) {

      if ( b.hasOwnProperty( i )  ) {

        if ( overwrite === false && a[ i ] ) continue;
        if ( has( exclude || [], i ) ) { continue; }
        if ( ! add &&  a[ i ]  === undefined ) continue;

        if ( typeof b[ i ] === 'object' && deep && ! b[ i ].nodeType  ) {

          if ( a[ i ] === undefined  || toStr.call( b[ i ] ) !== toStr.call( a[ i ] ) ) {

            a[ i ] = ( toStr.call( b[ i ] ) === astr ) ? [] : {};
          }

          mix( a[ i ], b[ i ], settings );

        } else {

           keyValue = hyphenifyPx( i, b[ i ] );
           a[ keyValue.key ] = keyValue.value;
        }
      }
    }

    return a;
  }

  //////////////////////////////////////////////////////

  function isUndefined ( x ) { return typeof x === 'undefined'; }
  function isArray ( x ) { return x instanceof Array; }
  function isObject ( x ) { return typeof x === 'object' && ! ( x instanceof Array ); }
  function isString ( x ) { return typeof x === 'string'; }
  function isBoolean ( x ) { return typeof x === 'boolean'; }
  function isNumber ( x ) { return typeof x === 'number'; }
  function isFunction ( x ) { return typeof x === 'function'; }
  function isEmpty ( x ) { for ( var i in x ) if ( x.hasOwnProperty( i ) ) return false; return true; }
  function capitaliseFirstLetter ( str ) { if ( ! str ) return ''; return str.charAt( 0 ).toUpperCase() + str.slice( 1 ); }
  function has ( xxx, x ) { return xxx.indexOf( x ) > -1; }
  function hyphenify ( text ) { return text.replace( /[A-Z]/g, '-$&' ).toLowerCase(); }
  function px ( x ) { if ( isNumber( x ) ) { return x + 'px'; }; return x; }

}()