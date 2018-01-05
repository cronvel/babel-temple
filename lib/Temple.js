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
var Ref = require( 'kung-fig/lib/Ref.js' ) ;
var Expression = require( 'kung-fig/lib/Expression.js' ) ;

var Babel = require( 'babel-tower' ) ;

function noop() {}

var defaultBabel = Babel.create() ;



function Temple( babel ) {
	this.babel = babel || defaultBabel ;
	this.parts = null ;
}

module.exports = Temple ;



/*
	Rendered
*/



Temple.prototype.render = function render( ctx ) {
	return renderParts( this.parts , ctx , this ) ;
} ;



Temple.render = function( str , ctx ) {
	return Temple.parse( str ).render( ctx ) ;
} ;



function renderParts( parts , ctx , template ) {
	return parts.map( part => renderers[ part.type ]( part , ctx , template ) ).join( '' ) ;

	// ATM the parser throw on unknown tag, so no need to check here

	/*
	return parts.map( part => {
		if ( renderers[ part.type ] ) {
			return renderers[ part.type ]( part , ctx , template ) ;
		}

		throw new Error( "Unknown tag: '" + part.type + "'." ) ;
		//return '(tag: ' + part.type + ')' ;
	} ).join( '' ) ;
	*/
}



var renderers = {} ;



//renderers.string = part => part.content ;

renderers.string = ( part , ctx , template ) => {
	return template.babel.format( part.content , ctx ) ;
} ;



renderers.if =
renderers.elsif =
renderers.elseif = ( tag , ctx , template ) => {
	if ( Dynamic.getFinalValue( tag.expression , ctx ) ) {
		return renderParts( tag.subParts , ctx , template ) ;
	}

	if ( tag.chainTo ) {
		return renderers[ tag.chainTo.type ]( tag.chainTo , ctx , template ) ;
	}

	return '' ;
} ;



renderers.else = ( tag , ctx , template ) => {
	return renderParts( tag.subParts , ctx , template ) ;
} ;



renderers.foreach = ( tag , ctx , template ) => {
	var i , keys , length , source , keyBackup , valueBackup , output = '' ;

	source = tag.sourceRef.get( ctx ) ;

	if ( ! source || typeof source !== 'object' ) { return '' ; }

	if ( tag.asKeyRef ) { keyBackup = tag.asKeyRef.get( ctx ) ; }
	valueBackup = tag.asValueRef.get( ctx ) ;

	console.log( "bob" ) ;
	if ( Array.isArray( source ) ) {
		for ( i = 0 , length = source.length ; i < length ; i ++ ) {
			if ( tag.asKeyRef ) { tag.asKeyRef.set( ctx , i ) ; }
			tag.asValueRef.set( ctx , source[ i ] ) ;
			output += renderParts( tag.subParts , ctx , template ) ;
		}
	}
	else {
		keys = Object.keys( source ) ;

		for ( i = 0 , length = keys.length ; i < length ; i ++ ) {
			console.log( "bobby" , tag.subParts ) ;
			if ( tag.asKeyRef ) { tag.asKeyRef.set( ctx , keys[ i ] ) ; }
			tag.asValueRef.set( ctx , source[ keys[ i ] ] ) ;
			output += renderParts( tag.subParts , ctx , template ) ;
		}
	}

	if ( tag.asKeyRef ) { tag.asKeyRef.set( ctx , keyBackup ) ; }
	tag.asValueRef.set( ctx , valueBackup ) ;

	return output ;
} ;



var tags = {} ;



tags.if = ( tag , arg ) => {
	tag.chainType = 'if' ;
	tag.chainTo = null ;
	tag.expression = Expression.parse( arg ) ;
} ;



tags.elsif =
tags.elseif = ( tag , arg , lastTag ) => {
	if ( lastTag && lastTag.chainType === 'if' ) {
		lastTag.chainTo = tag ;
	}

	tag.noop = true ;
	tag.chainType = 'if' ;
	tag.expression = Expression.parse( arg ) ;
} ;



tags.else = ( tag , arg , lastTag ) => {
	if ( lastTag && lastTag.chainType === 'if' ) {
		lastTag.chainTo = tag ;
	}

	tag.noop = true ;
} ;



tags.foreach = parseIteratorArgumentSyntax ;



/*
	Parser
*/



Temple.parse = function parse( str ) {

	var template = new Temple() ;

	var v , runtime = {
		i: 0 ,
		closeOpen: false ,	// true when the close-open syntaxic sugar is active
		depth: 0 ,
		ancestors: []
	} ;

	if ( typeof str !== 'string' ) {
		if ( str && typeof str === 'object' ) { str = str.toString() ; }
		else { throw new TypeError( "Argument #0 should be a string or an object with a .toString() method" ) ; }
	}

	template.parts = parseParts( str , runtime ) ;

	return template ;
} ;



function parseParts( str , runtime ) {

	var part , parts = [] ;

	while ( runtime.i < str.length ) {

		if ( runtime.closeOpen || ( str[ runtime.i ] === '{' && str[ runtime.i + 1 ] === '{' ) ) {

			if ( runtime.closeOpen ) { runtime.closeOpen = false ; }
			else { runtime.i += 2 ; }

			part = parseTag( str , runtime ) ;

			// If false, this is the end of this level, if null, do not add any tag
			if ( ! part ) { break ; }
			else if ( ! part.noop ) { parts.push( part ) ; }
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
	var arg , tag = {} ,
		lastTag = runtime.ancestors[ runtime.depth ] ;

	if ( str[ runtime.i ] === '/' ) {
		if ( str[ runtime.i + 1 ] === '}' && str[ runtime.i + 2 ] === '}' ) {
			runtime.i += 3 ;
		}
		else {
			runtime.i ++ ;
			runtime.closeOpen = true ;
		}

		return false ;
	}

	tag.type = parseTagName( str , runtime ) ;
	arg = parseTagArg( str , runtime ) ;	// it eats the final }} too

	if ( tags[ tag.type ] ) {
		tags[ tag.type ]( tag , arg , lastTag ) ;
	}
	else {
		throw new SyntaxError( "Unknown '" + tag.type + "' tag." ) ;
		//tag.arg = arg ;
	}

	runtime.ancestors[ runtime.depth ] = tag ;
	runtime.depth ++ ;
	runtime.closeOpen = false ;

	tag.subParts = parseParts( str , runtime ) ;

	runtime.depth -- ;

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



/*
	Common argument parsers.
*/



function parseIteratorArgumentSyntax( tag , arg ) {
	var matches = arg.match( /^(\$[^ ]+) *=>(?: *(\$[^ ]+) *:)? *(\$[^ ]+)$/ ) ;

	if ( ! matches ) {
		throw new SyntaxError( "Bad iterator argument syntax." ) ;
	}

	tag.sourceRef = Ref.parse( matches[ 1 ] ) ;
	tag.asKeyRef = matches[ 2 ] && Ref.parse( matches[ 2 ] ) ;
	tag.asValueRef = Ref.parse( matches[ 3 ] ) ;
}


