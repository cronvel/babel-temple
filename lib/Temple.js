/*
	Babel Temple

	Copyright (c) 2017 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



var treePath = require( 'tree-kit/lib/path.js' ) ;
var Dynamic = require( 'kung-fig/lib/Dynamic.js' ) ;
var Expression = require( 'kung-fig/lib/Expression.js' ) ;



function Temple() {
	this.parts = null ;
}

module.exports = Temple ;



/*
	Rendered
*/



Temple.prototype.render = function render( ctx ) {
	return renderParts( this.parts , ctx ) ;
} ;



Temple.render = function( str , ctx ) {
	return Temple.parse( str ).render( ctx ) ;
} ;



function renderParts( parts , ctx ) {
	return parts.map( part => renderer[ part.type ]( part , ctx ) ).join( '' ) ;
}



var renderer = {} ;



renderer.string = part => part.content ;



renderer.if = ( part , ctx ) => {
	if ( Dynamic.getFinalValue( part.expression , ctx ) ) {
		return renderParts( part.subParts , ctx ) ;
	}

	return '' ;
} ;



/*
	Parser
*/



Temple.parse = function parse( str ) {

	var template = new Temple() ;

	var v , runtime = {
		i: 0
		//, depth: 0	//# noDepthTracking!
		//, depthLimit: limit || depthLimit   //# noDepthLimit!
		//, ancestors: []	//# noRefNotation!
	} ;

	if ( typeof str !== 'string' ) {
		if ( str && typeof str === 'object' ) { str = str.toString() ; }
		else { throw new TypeError( "Argument #0 should be a string or an object with a .toString() method" ) ; }
	}

	template.parts = parseParts( str , runtime ) ;

	return template ;
} ;



function parseParts( str , runtime ) {
	//return [ parsePart( str , runtime ) ] ;

	var part , parts = [] ;

	while ( runtime.i < str.length ) {
		if ( str[ runtime.i ] === '{' && str[ runtime.i + 1 ] === '{' ) {
			runtime.i += 2 ;
			part = parseTag( str , runtime ) ;

			// If falsy, this is the end of this level
			if ( ! part ) { break ; }

			parts.push( part ) ;
		}
		else {
			parts.push( parseString( str , runtime ) ) ;
		}
	}

	return parts ;
}



function parseString( str , runtime ) {
	var c , content = '' ;

	while ( runtime.i < str.length ) {
		c = str[ runtime.i ] ;

		if ( c === '{' && str[ runtime.i + 1 ] === '{' ) {
			break ;
		}
		else if ( c === '\\' ) {
			content += parseBackSlashString( str , runtime ) ;
		}
		else {
			content += parseRawString( str , runtime ) ;
		}
	}

	return { type: 'string' , content: content } ;
}



function parseRawString( str , runtime ) {
	var c , start = runtime.i ;

	for ( ; runtime.i < str.length ; runtime.i ++ ) {
		c = str[ runtime.i ] ;

		if ( ( c === '{' && str[ runtime.i + 1 ] === '{' ) || c === '\\' ) {
			break ;
		}
	}

	return str.slice( start , runtime.i ) ;
}



function parseBackSlashString( str , runtime ) {
	if ( str[ runtime.i + 1 ] === '{' ) {
		runtime.i += 2 ;
		return '{' ;
	}

	if ( str[ runtime.i + 1 ] === '}' ) {
		runtime.i += 2 ;
		return '}' ;
	}

	runtime.i += 2 ;
	return str.slice( runtime.i - 2 , runtime.i ) ;
}



function parseTag( str , runtime ) {
	var arg , tag = {} ;

	if ( str[ runtime.i ] === '/' ) {
		//runtime.i ++ ;
		runtime.i += 3 ;
		return false ;
	}

	tag.type = parseTagName( str , runtime ) ;
	arg = parseTagArg( str , runtime ) ;	// it parse the final }} too
	tag.subParts = parseParts( str , runtime ) ;

	switch ( tag.type ) {
		case 'if' :
			tag.expression = Expression.parse( arg ) ;
			break ;
		default :
			tag.arg = arg ;
	}

	return tag ;
}



function parseTagName( str , runtime ) {
	var c , start = runtime.i ;

	for ( ; runtime.i < str.length ; runtime.i ++ ) {
		c = str.charCodeAt( runtime.i ) ;

		if ( c < 0x61 || c > 0x7a ) {
			break ;
		}
	}

	return str.slice( start , runtime.i ) ;
}



function parseTagArg( str , runtime ) {
	var c , content = '' ;

	while ( runtime.i < str.length ) {
		c = str[ runtime.i ] ;

		if ( c === '}' && str[ runtime.i + 1 ] === '}' ) {
			runtime.i += 2 ;
			break ;
		}
		else if ( c === '\\' ) {
			content += parseBackSlashString( str , runtime ) ;
		}
		else {
			content += parseRawArg( str , runtime ) ;
		}
	}

	return content.trim() ;
}



function parseRawArg( str , runtime ) {
	var c , start = runtime.i ;

	for ( ; runtime.i < str.length ; runtime.i ++ ) {
		c = str[ runtime.i ] ;

		if ( ( c === '}' && str[ runtime.i + 1 ] === '}' ) || c === '\\' ) {
			break ;
		}
	}

	return str.slice( start , runtime.i ) ;
}



function parseSkipSpace( str , runtime ) {
	while ( runtime.i < str.length && str[ runtime.i ] === ' ' ) { runtime.i ++ ; }
}


