/*
	Babel Temple

	Copyright (c) 2017 - 2018 Cédric Ronvel

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



var Dynamic = require( 'kung-fig-dynamic' ) ;
var Ref = require( 'kung-fig-ref' ) ;
var Expression = require( 'kung-fig-expression' ) ;

const NO_SUBPARTS = [] ;
function noop() {}



function Temple( options = {} ) {
	this.id = options.id ;
	this.lib = options.lib instanceof Temple.Lib ? options.lib : null ;
	this.babel = options.babel || ( this.lib && this.lib.babel ) || Temple.Lib.defaultBabel ;
	this.parts = null ;

	if ( this.id && this.lib ) {
		this.lib.add( this ) ;
	}
}

module.exports = Temple ;

Temple.Lib = require( './Lib.js' ) ;



/*
	Renderer
*/



Temple.prototype.render = function render( ctx ) {
	return renderParts( this , this.parts , createScope( ctx , null ) ) ;
} ;



Temple.render = function( str , ctx , options ) {
	return Temple.parse( str , options ).render( ctx ) ;
} ;



function renderParts( template , parts , ctx , joint = '' , fromParentCtx ) {

	var newCtx = ctx ;

	if ( ctx ) {
		if ( Array.isArray( ctx ) ) {
			return ctx.map( subCtx => {
				newCtx = createScope( subCtx , fromParentCtx || ctx ) ;
				return parts.map( part => renderers[ part.type ]( template , part , newCtx ) ).join( '' ) ;
			} ).join( joint ) ;
		}

		if ( fromParentCtx && typeof ctx === 'object' ) {
			newCtx = createScope( ctx , fromParentCtx ) ;
		}

		return parts.map( part => renderers[ part.type ]( template , part , newCtx ) ).join( '' ) ;
	}

	return '' ;
}



function createScope( ctx , parentCtx ) {
	var rootCtx ;

	if ( parentCtx ) {
		rootCtx = parentCtx[''] || parentCtx ;
	}
	else if ( parentCtx === null ) {
		// If the second arg is null, then we want to recreate a top-level scope
		rootCtx = ctx ;
	}
	else {
		rootCtx = ctx[''] || ctx ;
	}

	return Object.create( ctx , {
		'': { value: rootCtx }
	} ) ;
}



var renderers = {} ;



// /!\ DEPRECATED, should compile Sentence at parse-time

renderers.string = ( template , part , ctx ) => {
	// /!\ DEPRECATED, should compile Sentence at parse-time
	return template.babel.render( part.content , ctx ) ;
} ;



renderers.if =
renderers.elsif =
renderers.elseif = ( template , tag , ctx ) => {
	if ( Dynamic.getFinalValue( tag.expression , ctx ) ) {
		return renderParts( template , tag.subParts , ctx ) ;
	}

	if ( tag.chainTo ) {
		return renderers[ tag.chainTo.type ]( template , tag.chainTo , ctx ) ;
	}

	return '' ;
} ;



renderers.foreach = ( template , tag , ctx ) => {
	var i , key , length , source , newCtx , output = '' ;

	source = tag.sourceRef.get( ctx ) ;

	if ( ! source || typeof source !== 'object' ) { return '' ; }

	// Create a new context because we create new variable for this scope
	newCtx = createScope( ctx ) ;

	if ( Array.isArray( source ) ) {
		for ( i = 0 , length = source.length ; i < length ; i ++ ) {
			if ( tag.keyVar ) { newCtx[ tag.keyVar ] = i ; }
			newCtx[ tag.valueVar ] = source[ i ] ;
			output += renderParts( template , tag.subParts , newCtx ) ;
		}
	}
	else {
		for ( key in source ) {
			if ( tag.keyVar ) { newCtx[ tag.keyVar ] = key ; }
			newCtx[ tag.valueVar ] = source[ key ] ;
			output += renderParts( template , tag.subParts , newCtx ) ;
		}
	}

	return output ;
} ;



renderers.use = ( template , tag , ctx ) => {
	var joint = '' ,
		subCtx = tag.sourceRef.get( ctx ) ;

	// Render the joint, if there is a join tag, and if it's an array of at least 2 elements
	// (avoid computing the joint for nothing)
	if ( tag.join && Array.isArray( subCtx ) && subCtx.length >= 2 ) {
		joint = renderers[ tag.join.type ]( template , tag.join , ctx ) ;
	}

	return renderParts( template , tag.subParts , subCtx , joint , ctx ) ;
} ;



renderers.empty = ( template , tag , ctx ) => {
	var value = tag.sourceRef.get( ctx ) ;

	if ( ! value || ( Array.isArray( value ) && value.length === 0 ) ) {
		return renderParts( template , tag.subParts , ctx ) ;
	}

	return '' ;
} ;



// Tags that just render their content when invoked
renderers.join =
renderers.else = ( template , tag , ctx ) => {
	return renderParts( template , tag.subParts , ctx ) ;
} ;



renderers.let = ( template , tag , ctx ) => {
	ctx[ tag.var ] = Dynamic.getFinalValue( tag.expression , ctx ) ;
	return '' ;
} ;



renderers.call = ( template , tag , ctx ) => {
	var subTemplate = template.lib.get( tag.templateId ) ;

	if ( ! subTemplate ) { return '' ; }

	var subCtx = ctx ;

	if ( tag.sourceRef ) {
		subCtx = tag.sourceRef.get( ctx ) ;
	}

	return subTemplate.render( subCtx ) ;
} ;



var tags = {} ;



tags.if = ( tag , arg ) => {
	tag.chainType = 'if' ;
	tag.chainTo = null ;
	tag.expression = Expression.parse( arg ) ;
} ;



tags.elsif =
tags.elseif = ( tag , arg , runtime ) => {
	var lastTag = runtime.ancestors[ runtime.depth ] ;

	if ( lastTag && lastTag.chainType === 'if' ) {
		lastTag.chainTo = tag ;
	}

	tag.noop = true ;
	tag.chainType = 'if' ;
	tag.expression = Expression.parse( arg ) ;
} ;



tags.else = ( tag , arg , runtime ) => {
	var lastTag = runtime.ancestors[ runtime.depth ] ;

	if ( lastTag && lastTag.chainType === 'if' ) {
		lastTag.chainTo = tag ;
	}

	tag.noop = true ;
} ;



tags.foreach = parseIteratorArgumentSyntax ;



tags.use = ( tag , arg , runtime ) => {
	parseRefArgumentSyntax( tag , arg ) ;
	tag.join = null ;
	tag.empty = null ;
} ;



tags.empty = ( tag , arg , runtime ) => {
	var lastTag = runtime.ancestors[ runtime.depth ] ;

	if ( arg ) {
		parseRefArgumentSyntax( tag , arg ) ;
	}
	else if ( lastTag && lastTag.type === 'use' ) {
		tag.sourceRef = lastTag.sourceRef ;
	}
	else {
		tag.noop = true ;
	}
} ;



tags.join = ( tag , arg , runtime ) => {
	var lastTag = runtime.ancestors[ runtime.depth ] ;

	if ( lastTag && lastTag.type === 'use' ) {
		lastTag.join = tag ;
	}

	tag.noop = true ;
} ;



tags.let = ( tag , arg , runtime ) => {
	parseAssignmentArgumentSyntax( tag , arg ) ;
} ;



tags.call = ( tag , arg , runtime ) => {
	if ( ! runtime.template.lib ) {
		tag.noop = true ;
		return ;
	}

	parseCallArgumentSyntax( tag , arg ) ;
	//tag.async = true ;	// This tag has an async variant
	runtime.template.lib.addDependency( tag.templateId ) ;
} ;



/*
	Parser
*/



Temple.parse = function parse( str , options ) {

	var template = new Temple( options ) ;

	var runtime = {
		i: 0 ,
		template: template ,
		closeOpen: false ,	// true when the close-open syntactic sugar is active
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
	var arg , tag = {} , selfClosing ;
	//var lastTag = runtime.ancestors[ runtime.depth ] ;

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

	if ( str[ runtime.i ] === '$' ) {
		// This is the 'use' syntactic sugar
		tag.type = 'use' ;
	}
	else if ( str[ runtime.i ] === '@' ) {
		// This is the 'call' syntactic sugar
		runtime.i ++ ;
		tag.type = 'call' ;
	}
	else {
		tag.type = parseTagName( str , runtime ) ;
	}

	[ arg , selfClosing ] = parseTagArg( str , runtime ) ;	// it eats the final }} or /}} too

	if ( tags[ tag.type ] ) {
		tags[ tag.type ]( tag , arg , runtime ) ;
	}
	else {
		throw new SyntaxError( "Unknown '" + tag.type + "' tag." ) ;
		//tag.arg = arg ;
	}

	runtime.ancestors[ runtime.depth ] = tag ;
	runtime.closeOpen = false ;

	if ( selfClosing ) {
		tag.subParts = NO_SUBPARTS ;
	}
	else {
		runtime.depth ++ ;
		tag.subParts = parseParts( str , runtime ) ;
		runtime.depth -- ;
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
	var c , arg = '' , selfClosing = false ;

	while ( runtime.i < str.length ) {
		c = str[ runtime.i ] ;

		if ( c === '/' && str[ runtime.i + 1 ] === '}' && str[ runtime.i + 2 ] === '}' ) {
			selfClosing = true ;
			runtime.i += 3 ;
			break ;
		}
		else if ( c === '}' && str[ runtime.i + 1 ] === '}' ) {
			runtime.i += 2 ;
			break ;
		}
		else if ( c === '\\' ) {
			arg += parseBackSlashString( str , runtime ) ;
		}
		else {
			arg += parseRawArg( str , runtime ) ;
		}
	}

	return [ arg.trim() , selfClosing ] ;
}



function parseRawArg( str , runtime ) {
	var c , start = runtime.i ;

	for ( ; runtime.i < str.length ; runtime.i ++ ) {
		c = str[ runtime.i ] ;

		if (
			( c === '}' && str[ runtime.i + 1 ] === '}' ) ||
			( c === '/' && str[ runtime.i + 1 ] === '}' && str[ runtime.i + 2 ] === '}' ) ||
			c === '\\' ) {
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



function parseCallArgumentSyntax( tag , arg ) {

	var indexOfSpace = arg.indexOf( ' ' ) ;

	if ( indexOfSpace === -1 ) {
		tag.templateId = arg ;
		return ;
	}

	tag.templateId = arg.slice( 0 , indexOfSpace ) ;

	var indexOfDollar = arg.indexOf( '$' , indexOfSpace ) ;

	if ( indexOfDollar === -1 ) { return ; }

	tag.sourceRef = Ref.parse( arg.slice( indexOfDollar ) ) ;
}



function parseRefArgumentSyntax( tag , arg ) {
	tag.sourceRef = Ref.parse( arg ) ;
}



function parseIteratorArgumentSyntax( tag , arg ) {
	var matches = arg.match( /^(\$[^ ]*) *=>(?: *\$([^. ]+) *:)? *\$([^. ]+)$/ ) ;

	if ( ! matches ) {
		throw new SyntaxError( "Bad iterator argument syntax." ) ;
	}

	tag.sourceRef = Ref.parse( matches[ 1 ] ) ;
	tag.keyVar = matches[ 2 ] ;
	tag.valueVar = matches[ 3 ] ;
}



function parseAssignmentArgumentSyntax( tag , arg ) {
	var matches = arg.match( /^\$([^. ]+) *: */ ) ;

	if ( ! matches ) {
		throw new SyntaxError( "Bad assignment argument syntax." ) ;
	}

	tag.var = matches[ 1 ] ;
	tag.expression = Expression.parse( arg.slice( matches[ 0 ].length ) ) ;
}


