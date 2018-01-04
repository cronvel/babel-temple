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



function Temple() {
	this.parts = null ;
}

module.exports = Temple ;




Temple.parse = function parse( str ) {
	
	var template = new Temple() ;
	
	var v , runtime = {
		i: 0
		//, depth: 0	//# noDepthTracking!
		//, depthLimit: limit || depthLimit   //# noDepthLimit!
		//, ancestors: []	//# noRefNotation!
	} ;
	
	if ( typeof str !== 'string' )
	{
		if ( str && typeof str === 'object' ) { str = str.toString() ; }
		else { throw new TypeError( "Argument #0 should be a string or an object with a .toString() method" ) ; }
	}
	
	template.parts = parseParts( str , runtime ) ;
	
	return template ;
}



function parseParts( str , runtime )
{
	//return [ parsePart( str , runtime ) ] ;
	
	var parts = [] ;
	
	while ( runtime.i < str.length )
	{
		if ( str[ runtime.i ] === '{' && str[ runtime.i + 1 ] === '{' ) {
			runtime.i += 2 ;
			parts.push( parseTag( str , runtime ) ) ;
		}
		else {
			parts.push( parseString( str , runtime ) ) ;
		}
	}
	
	return parts ;
}



function parseString( str , runtime )
{
	var c , content = '' ;
	
	while ( runtime.i < str.length )
	{
		c = str[ runtime.i ] ;
		
		if ( c === '{' ) {
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



function parseRawString( str , runtime )
{
	var c , start = runtime.i ;
	
	for ( ; runtime.i < str.length ; runtime.i ++ )
	{
		c = str[ runtime.i ] ;
		
		if ( c === '{' || ( c === '\\' && str[ runtime.i + 1 ] === '{' ) ) {
			break ;
		}
	}
	
	return str.slice( start , runtime.i ) ;
}



function parseBackSlashString( str , runtime )
{
	if ( str[ runtime.i + 1 ] === '{' ) {
		runtime.i += 2 ;
		return '{' ;
	}
	else {
		runtime.i += 2 ;
		return str.slice( runtime.i - 2 , runtime.i ) ;
	}
}



function parseTag( str , runtime )
{
	var tag = parseTagName( str , runtime ) ;
	return { type: tag } ;
}



function parseTagName( str , runtime )
{
	var c , start = runtime.i ;
	
	for ( ; runtime.i < str.length ; runtime.i ++ )
	{
		c = str.charCodeAt( runtime.i ) ;
		
		if ( c < 0x61 || c > 0x7a ) {
			break ;
		}
	}
	
	return str.slice( start , runtime.i ) ;
}















/*
var regexp = /(\\.)|\{\{([a-z]+)(?: +([^}]+))?\}\}((?:\\.|[^{]+)*)\{\{\/\}\}/g ;



Temple.render = function render( str ) {
	
	return str.replace( regexp , ( match , escaped , tag , expression , content ) => {
		if ( escaped ) {
			return escaped ;
		}
		
		switch ( tag ) {
			case 'if' :
				return content ;
			default :
				return '' ;
		}
		
	} ) ;
} ;
*/


