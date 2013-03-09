//var D = require('domo')//.global();
//var F = require( './cartonFactory' )( '#', domo.STYLE() );

var css = {
  alignRight: { 'text-align': 'right' } 
, alignLeft: { 'text-align': 'left' } 
, alignCenter: { 'text-align': 'center' } 
, root: {
  color: '#ffffff',
  fontSize: 12
}
, body: { 
    backgroundColor: '#404040'
  }

, page: {  
    backgroundColor: '#A6A6A6', 
    marginTop: 20 
  }

, carton: { 
    backgroundColor: '#404040',
    padding: 20 
  } 

, disrupter_following: { 
    backgroundColor: '#404040', 
    width: 150, 
    height: 50, 
    padding: 20 
  }

, disrupter_not_following: { 
    backgroundColor: '#404040', 
    width: 320, 
    height: 25, 
    padding: 20, 
    marginLeft: -180 
  }

, twoLines: {
    backgroundColor: '#404040',
    backgroundColor: '#404040',
    padding: 20,
    lineHeight: 52
  }

, fitter: { 
    backgroundColor: '#404040',
    padding: 20,
    margin: 5
  }
}

var C = require( './lib/index' )( { selector: '.', extend: { slim: css.root , stretch: css.root , sticker: css.root , chopped: css.root , fixed: css.root , fit: css.root  } }).global()
var http = require('http');




with( css ) DOC = DOCUMENT(
  HTML(
    HEAD(
      TITLE( 'cssCarton - sample' )
      ,
      META( { name:"viewport", content:"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"} )
      ,
      META( { httpEquiv:"Content-Type", content:"text/html;charset=utf-8"} )
      ,
      STYLE()
    )
    ,
    BODY( [ body, alignCenter ]
      ,
      SLIM( [ page ] 
        ,
        CELL( { styles: [ { width: 600, minHeight: 500 }, { width: 300, minHeight: 500 }  ], query: [ { minWidth: '320px' }, { maxWidth: '320px' } ] } 
        ,
          CELL( [ 300, 400, 'min' ] // two strings w, h one string h
            , 
            CELL( [ 300, 200 ]
              ,
              STRETCH( [ carton ], 'I am a carton stretched to my parent cells', BR(), '( top_left ) width' )
            )
            ,
            CELL( [ 300, 200 ] 
              ,
              STICKER( [ disrupter_following, -30, -10 ], 'I am a sticker' ) // two numbers top, left
              ,
              FIXED( [ disrupter_not_following, 'auto', 'auto', 15, '50%' ], 'I am fixed ' ) // four numbers top, right,bottom, left
            )
          )
          ,
          CELL( [ 300, 400 ] 
            ,
            SLIM( [ carton, alignLeft ], 'As', BR(), 'slim',  BR(), 'cartons' )
            ,
            SLIM( [ carton, alignCenter ], 'we', BR(), 'stand', BR(), 'in' )
            ,
            SLIM( [ carton, alignRight ], 'a', BR(), 'Line' )
            , 
            CHOPPED( [ twoLines ], 'As a chopped styleable I can exist on more than one line' )
  
          )
          ,
          CELL( [ '100%', 100 ]
            ,
            FIT( [ fitter ], 'I am a fit styleable.', 'I am always fitting to my parent cell' )
          )
        )
      )
    )
  )
)
carton.set({type:'slim' }, { styles: { color:'pink'} } )


http.createServer( function( req, res ) {
  console.log( req )
  if ( req.url  === '/favicon.ico') res.end('');
  res.writeHead( 200, { 'Content-Type': 'text/html' })
   
   
   res.end( DOC.outerHTML 
  )
  ;
})
.listen( 8080 );

console.log( 'Hello :) Domo is now on :8080 !' );