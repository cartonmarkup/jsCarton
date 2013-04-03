
  var http = require( 'http' );
  var carton = require( './lib/index' );
  var fs = require( 'fs' );
  var reset = fs.readFileSync( 'reset.css' );
  var css = {

    root: {
      color: '#ffffff',
      fontSize: 12
    },

    body: {
      backgroundColor: '#404040'
    },

    page: {
      backgroundColor: '#A6A6A6',
      marginTop: 20
    },

    carton: {
      backgroundColor: '#404040',
      padding: 20,
      '_:hover': { color: 'pink' },
    },

    disrupter_following: {
      backgroundColor: '#404040',
      width: 150,
      height: 50,
      padding: 20
    },

    disrupter_not_following: {
      backgroundColor: '#404040',
      width: 320, 
      height: 25, 
      padding: 20, 
      marginLeft: -180 
    },

    twoLines: {
      backgroundColor: '#404040',
      backgroundColor: '#404040',
      padding: 20,
      lineHeight: 52
    },

    fitter: {
      backgroundColor: '#404040',
      padding: 20,
      margin: 5
    }
  }

  carton(
    { selector: '.', showGrid: true, extend: { slim: css.root , stretch: css.root , sticker: css.root , chopped: css.root , fixed: css.root , fit: css.root  } }, 
    [ { minWidth: 320 }, { maxWidth: 320 } ] 
  ).global()

  with ( css )
    var DOC = (

      DOCUMENT(
        HTML(
          HEAD(
            TITLE( 'jsCarton - node.js sample' )
            ,
            META( { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' } )
            ,
            META( { httpEquiv: 'Content-Type', content: 'text/html;charset=utf-8' } )
            ,
            LINK( { href: 'reset.css',  rel: 'stylesheet',  type: 'text/css' } )
            ,
            STYLE()
          )
          ,
          BODY( [ body, 'center' ]
            ,
            SLIM( [ page, false ] 
              ,
              CELL( [ 600,'auto','auto','auto','auto', 500 ], [ 300, 'auto','auto','auto', 'auto', 500 ]
              ,
                CELL( [ 'auto', 'auto', 300, 400 ]
                  ,
                  CELL( [ 300, 200 ]
                    ,
                    STRETCH( [ carton ], 'I am a carton stretched to my parent cells', BR(), '( top_left ) width' )
                  )
                  ,
                  CELL( [ 300, 200 ]
                    ,
                    STICKER( [ disrupter_following, -30, -10 ], 'I am a sticker' )
                    ,
                    FIXED( [ disrupter_not_following, 'auto', 'auto', 15, '50%' ], 'I am fixed ' )
                  )
                )
                ,
                CELL( [ 300, 400, 'left' ]
                  ,
                  SLIM( [ carton ], 'As', BR(), 'slim',  BR(), 'cartons' )
                  ,
                  SLIM( [ carton, 'center' ], 'we', BR(), 'stand', BR(), 'in' )
                  ,
                  SLIM( [ carton, 'right' ], 'a', BR(), 'Line' )
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

    )
  
  http.createServer( function( req, res ) {
    if ( req.url  === '/favicon.ico' ) res.end( '' );
    if ( req.url  === '/reset.css' ) {
      
      res.writeHead( 200, { 'Content-Type': 'text/css' }); 
      res.end( reset );
    
    } 
    
    res.writeHead( 200, { 'Content-Type': 'text/html' });
    res.end( DOC.outerHTML );
  })
  .listen( 8080 );

  console.log( 'Hello :) :8080 !' );
