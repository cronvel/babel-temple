/*
	Babel Temple

	Copyright (c) 2017 - 2019 Cédric Ronvel

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

/* global describe, it, before, after */

"use strict" ;



var Temple = require( '../lib/Temple.js' ) ;



describe( "Babel Tower strings" , function() {
	
	it( "variable substitution " , function() {
		expect( Temple.render( "Hello ${name}!" , { name: "Bob" } ) ).to.be( "Hello Bob!" ) ;
		expect( Temple.render( "Hello ${name1} and ${name2}!" , { name1: "Bob" , name2: "James" } ) ).to.be( "Hello Bob and James!" ) ;
	} ) ;
	
	it( "post-filters " , function() {
		expect( Temple.render( "Hello ${name//uc1}!" , { name: "bob" } ) ).to.be( "Hello Bob!" ) ;
	} ) ;
	
	it( "complex syntax " , function() {
		expect( Temple.render( "Hello ${list}[enum:nobody|$|, $| and $]!" , { list: [] } ) ).to.be( "Hello nobody!" ) ;
		expect( Temple.render( "Hello ${list}[enum:nobody|$|, $| and $]!" , { list: [ "Bob" ] } ) ).to.be( "Hello Bob!" ) ;
		expect( Temple.render( "Hello ${list}[enum:nobody|$|, $| and $]!" , { list: [ "Bob" , "James" ] } ) ).to.be( "Hello Bob and James!" ) ;
		expect( Temple.render( "Hello ${list}[enum:nobody|$|, $| and $]!" , { list: [ "Bob" , "James" , "Sarah" ] } ) ).to.be( "Hello Bob, James and Sarah!" ) ;
	} ) ;
} ) ;



describe( "'if' tag" , function() {
	
	it( "simple 'if' syntax" , function() {
		expect( Temple.render( "Just a little{{if $test}} test{{/}}." , { test: true } ) ).to.be( "Just a little test." ) ;
		expect( Temple.render( "Just a little{{if $test}} test{{/}}." , { test: false } ) ).to.be( "Just a little." ) ;
		
		expect( Temple.render( 'Just a little{{if $test = "bob"}} test{{/}}.' , { test: true } ) ).to.be( "Just a little." ) ;
		expect( Temple.render( 'Just a little{{if $test = "bob"}} test{{/}}.' , { test: "bill" } ) ).to.be( "Just a little." ) ;
		expect( Temple.render( 'Just a little{{if $test = "bob"}} test{{/}}.' , { test: "bob" } ) ).to.be( "Just a little test." ) ;
		
		expect( Temple.render( 'Just a little{{if $test > 3}} test{{/}}.' , { test: 1 } ) ).to.be( "Just a little." ) ;
		expect( Temple.render( 'Just a little{{if $test > 3}} test{{/}}.' , { test: 5 } ) ).to.be( "Just a little test." ) ;
	} ) ;
	
	it( "'if-else' syntax" , function() {
		expect( Temple.render( "Is it {{if $test}}a test{{/}}{{else}}real{{/}}?" , { test: true } ) ).to.be( "Is it a test?" ) ;
		expect( Temple.render( "Is it {{if $test}}a test{{/}}{{else}}real{{/}}?" , { test: false } ) ).to.be( "Is it real?" ) ;
		
		// Undocumented behavior.
		// It may look strange but is intended: extra content in the middle are usually white-space or newline used for presentation
		expect( Temple.render( "Is it {{if $test}}a test{{/}} () {{else}}real{{/}}?" , { test: true } ) ).to.be( "Is it a test () ?" ) ;
		expect( Temple.render( "Is it {{if $test}}a test{{/}} () {{else}}real{{/}}?" , { test: false } ) ).to.be( "Is it real () ?" ) ;
		
	} ) ;
	
	it( "'if-else' using the close-open syntactic sugar" , function() {
		expect( Temple.render( "Is it {{if $test}}a test{{/else}}real{{/}}?" , { test: true } ) ).to.be( "Is it a test?" ) ;
		expect( Temple.render( "Is it {{if $test}}a test{{/else}}real{{/}}?" , { test: false } ) ).to.be( "Is it real?" ) ;
	} ) ;
	
	it( "'if-elseif' syntax" , function() {
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/}}{{elseif $value < 0}}negative{{/}}." , { value: 3 } ) ).to.be( "It is positive." ) ;
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/}}{{elseif $value < 0}}negative{{/}}." , { value: -3 } ) ).to.be( "It is negative." ) ;
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/}}{{elseif $value < 0}}negative{{/}}." , { value: 0 } ) ).to.be( "It is ." ) ;
	} ) ;
	
	it( "'if-elseif' using the close-open syntactic sugar" , function() {
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/elseif $value < 0}}negative{{/}}." , { value: 3 } ) ).to.be( "It is positive." ) ;
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/elseif $value < 0}}negative{{/}}." , { value: -3 } ) ).to.be( "It is negative." ) ;
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/elseif $value < 0}}negative{{/}}." , { value: 0 } ) ).to.be( "It is ." ) ;
	} ) ;
	
	it( "'if-elseif-else' syntax" , function() {
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/}}{{elseif $value < 0}}negative{{/}}{{else}}zero{{/}}." , { value: 3 } ) ).to.be( "It is positive." ) ;
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/}}{{elseif $value < 0}}negative{{/}}{{else}}zero{{/}}." , { value: -3 } ) ).to.be( "It is negative." ) ;
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/}}{{elseif $value < 0}}negative{{/}}{{else}}zero{{/}}." , { value: 0 } ) ).to.be( "It is zero." ) ;
	} ) ;
	
	it( "'if-elseif-else' using the close-open syntactic sugar" , function() {
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/elseif $value < 0}}negative{{/else}}zero{{/}}." , { value: 3 } ) ).to.be( "It is positive." ) ;
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/elseif $value < 0}}negative{{/else}}zero{{/}}." , { value: -3 } ) ).to.be( "It is negative." ) ;
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/elseif $value < 0}}negative{{/else}}zero{{/}}." , { value: 0 } ) ).to.be( "It is zero." ) ;
	} ) ;
	
	it( "'if-elseif-else' syntax with multiple 'elseif' tags" , function() {
		var template = Temple.parse( 'Hello {{if $name = "Robert"}}Bob{{/elseif $name = "Jack"}}Jack{{/elseif $name = "Bill"}}my friend{{/else}}stranger{{/}}!' ) ;
		
		expect( template.render( { name: "Robert" } ) ).to.be( "Hello Bob!" ) ;
		expect( template.render( { name: "Jack" } ) ).to.be( "Hello Jack!" ) ;
		expect( template.render( { name: "Bill" } ) ).to.be( "Hello my friend!" ) ;
		expect( template.render( { name: "Joe" } ) ).to.be( "Hello stranger!" ) ;
	} ) ;
} ) ;



describe( "'foreach' tag" , function() {
	
	it( "'foreach' on an array should iterate over each element" , function() {
		var template ;
		
		var ctx = {
			joe: [
				"Joe" ,
				"Doe" ,
				"New York"
			]
		} ;
		
		template = Temple.parse( '{{foreach $joe => $key : $value}}${key}: ${value}\n{{/}}' ) ;
		expect( template.render( ctx ) ).to.be( "0: Joe\n1: Doe\n2: New York\n" ) ;
		
		template = Temple.parse( '{{foreach $joe => $value}}${value}\n{{/}}' ) ;
		expect( template.render( ctx ) ).to.be( "Joe\nDoe\nNew York\n" ) ;
	} ) ;
	
	it( "'foreach' on an object should iterate over each property" , function() {
		var template ;
		
		var ctx = {
			joe: {
				"first name": "Joe" ,
				"last name": "Doe" ,
				"city" : "New York"
			}
		} ;
		
		template = Temple.parse( '{{foreach $joe => $key : $value}}${key}: ${value}\n{{/}}' ) ;
		expect( template.render( ctx ) ).to.be( "first name: Joe\nlast name: Doe\ncity: New York\n" ) ;
		
		template = Temple.parse( '{{foreach $joe => $value}}${value}\n{{/}}' ) ;
		expect( template.render( ctx ) ).to.be( "Joe\nDoe\nNew York\n" ) ;
	} ) ;
	
	it( "'key' and 'value' variable should be shadowed inside the tag and restored after it" , function() {
		var template ;
		
		var ctx = {
			key: "A key" ,
			value: "12k€" ,
			joe: {
				"first name": "Joe" ,
				"last name": "Doe" ,
				"city" : "New York"
			}
		} ;
		
		template = Temple.parse( 'key: ${key}\nvalue: ${value}\n{{foreach $joe => $key : $value}}${key}: ${value}\n{{/}}key: ${key}\nvalue: ${value}\n' ) ;
		expect( template.render( ctx ) ).to.be( "key: A key\nvalue: 12k€\nfirst name: Joe\nlast name: Doe\ncity: New York\nkey: A key\nvalue: 12k€\n" ) ;
	} ) ;
	
	it( "'foreach' on a non-object should do nothing" , function() {
		var template ;
		
		var ctx = {
			joe: true ,
		} ;
		
		template = Temple.parse( '{{foreach $joe => $key : $value}}${key}: ${value}\n{{/}}' ) ;
		expect( template.render( ctx ) ).to.be( "" ) ;
		
		template = Temple.parse( '{{foreach $joe => $value}}${value}\n{{/}}' ) ;
		expect( template.render( ctx ) ).to.be( "" ) ;
		
		template = Temple.parse( 'some {{foreach $joe => $key : $value}}${key}: ${value}\n{{/}}text' ) ;
		expect( template.render( ctx ) ).to.be( "some text" ) ;
	} ) ;
} ) ;



describe( "'let' tag" , function() {
	
	it( "'let' tag should create new variable in the current scope" , function() {
		var template , ctx ;
		
		template = Temple.parse( '{{let $greetings : "Hi"/}}${greetings} ${firstName} ${lastName}{{/}}' ) ;
		
		ctx = {
			firstName: "Joe" ,
			lastName: "Doe"
		} ;
		
		expect( template.render( ctx ) ).to.be( "Hi Joe Doe" ) ;
	} ) ;
	
	it( "only the current context is modified" , function() {
		var template , ctx ;
		
		template = Temple.parse( '{{use $sub}}{{let $greetings : "Hi"/}}${greetings} ${firstName} ${lastName}\n{{/}}${sub.greetings} ${sub.firstName} ${sub.lastName}\n{{/}}' ) ;
		
		ctx = { sub: {
			greetings: "Hello" ,
			firstName: "Joe" ,
			lastName: "Doe"
		} } ;
		
		expect( template.render( ctx ) ).to.be( "Hi Joe Doe\nHello Joe Doe\n" ) ;
		expect( ctx ).to.equal( { sub: { greetings: "Hello" , firstName: "Joe" , lastName: "Doe" } } ) ;
	} ) ;
	
	it( "the original context should be preserved" , function() {
		var template , ctx ;
		
		template = Temple.parse( '{{let $greetings : "Hi"/}}${greetings} ${firstName} ${lastName}{{/}}' ) ;
		
		ctx = {
			firstName: "Joe" ,
			lastName: "Doe"
		} ;
		
		expect( template.render( ctx ) ).to.be( "Hi Joe Doe" ) ;
		expect( ctx ).to.equal( { firstName: "Joe" , lastName: "Doe" } ) ;
	} ) ;
} ) ;



describe( "'use' tag" , function() {
	
	it( "if the variable is an object, it should create a new context inside the tag and render it" , function() {
		var template , ctx ;
		
		template = Temple.parse( '{{use $path.to.var}}${firstName} ${lastName} of ${city}\n{{/}}' ) ;
		
		ctx = { path: { to: { "var": {
			firstName: "Joe" ,
			lastName: "Doe" ,
			city : "New York"
		} } } } ;
		
		expect( template.render( ctx ) ).to.be( "Joe Doe of New York\n" ) ;
	} ) ;
	
	it( "if the variable is an array, it should should iterate over it, using each element as the context" , function() {
		var template , ctx ;
		
		template = Temple.parse( '{{use $path.to.var}}${firstName} ${lastName} of ${city}\n{{/}}' ) ;
		
		ctx = { path: { to: { "var": [
			{
				firstName: "Joe" ,
				lastName: "Doe" ,
				city : "New York"
			} ,
			{
				firstName: "Sandra" ,
				lastName: "Murphy" ,
				city : "Los Angeles"
			} 
		] } } } ;
		
		expect( template.render( ctx ) ).to.be( "Joe Doe of New York\nSandra Murphy of Los Angeles\n" ) ;
	} ) ;
	
	it( "if the variable is a non-object truthy value, it should render its inner content" , function() {
		var template , ctx ;
		
		ctx = { path: { to: { "var": "some string" } } } ;
		template = Temple.parse( '{{use $path.to.var}}${firstName} ${lastName} of ${city}\n{{/}}' ) ;
		
		expect( template.render( ctx ) ).to.be( "(undefined) (undefined) of (undefined)\n" ) ;
		
		template = Temple.parse( '{{use $path.to.var}}value: $\n{{/}}' ) ;
		expect( template.render( ctx ) ).to.be( "value: some string\n" ) ;
	} ) ;
	
	it( "if the variable is a falsy value, it should not render its inner content" , function() {
		var template , ctx ;
		
		template = Temple.parse( '{{use $path.to.var}}${firstName} ${lastName} of ${city}\n{{/}}' ) ;
		
		ctx = { path: { to: { "var": false } } } ;
		
		expect( template.render( ctx ) ).to.be( "" ) ;
	} ) ;
	
	it( "'use' syntactic sugar: direct variable" , function() {
		var template , ctx ;
		
		template = Temple.parse( '{{$path.to.var}}${firstName} ${lastName} of ${city}\n{{/}}' ) ;
		
		ctx = { path: { to: { "var": [
			{
				firstName: "Joe" ,
				lastName: "Doe" ,
				city : "New York"
			} ,
			{
				firstName: "Sandra" ,
				lastName: "Murphy" ,
				city : "Los Angeles"
			} 
		] } } } ;
		
		expect( template.render( ctx ) ).to.be( "Joe Doe of New York\nSandra Murphy of Los Angeles\n" ) ;
	} ) ;
	
	it( "'join' tag should be used to join rendering parts" , function() {
		var template , ctx ;
		
		template = Temple.parse( '{{$path.to.var}}${firstName} ${lastName}{{/join}} and {{/}}' ) ;
		
		ctx = { path: { to: { "var": [] } } } ;
		expect( template.render( ctx ) ).to.be( "" ) ;
		
		ctx.path.to.var.push( { firstName: "Joe" , lastName: "Doe" } ) ;
		expect( template.render( ctx ) ).to.be( "Joe Doe" ) ;
		
		ctx.path.to.var.push( { firstName: "Sandra" , lastName: "Murphy" } ) ;
		expect( template.render( ctx ) ).to.be( "Joe Doe and Sandra Murphy" ) ;
		
		ctx.path.to.var.push( { firstName: "John" , lastName: "Peter" } ) ;
		expect( template.render( ctx ) ).to.be( "Joe Doe and Sandra Murphy and John Peter" ) ;
	} ) ;
} ) ;



describe( "'empty' tag" , function() {
	
	it( "if the variable is a falsy value, it should render its inner content" , function() {
		var template , ctx ;
		
		ctx = { path: { to: { "var": false } } } ;
		template = Temple.parse( '{{empty $path.to.var}}This is empty.{{/}}' ) ;
		
		expect( template.render( ctx ) ).to.be( "This is empty." ) ;
	} ) ;
	
	it( "if the variable is a truthy value, it should not render its inner content" , function() {
		var template , ctx ;
		
		ctx = { path: { to: { "var": true } } } ;
		template = Temple.parse( '{{empty $path.to.var}}This is empty.{{/}}' ) ;
		
		expect( template.render( ctx ) ).to.be( "" ) ;
	} ) ;
	
	it( "an 'empty' tag just after a 'use' tag can omit the variable" , function() {
		var template , ctx ;
		
		template = Temple.parse( '{{$path.to.var}}{{/empty}}This is empty.{{/}}' ) ;
		
		ctx = { path: { to: { "var": false } } } ;
		expect( template.render( ctx ) ).to.be( "This is empty." ) ;
		
		ctx = { path: { to: { "var": true } } } ;
		expect( template.render( ctx ) ).to.be( "" ) ;
	} ) ;
} ) ;



describe( "partial rendering: 'call' tag" , function() {
	
	it( "'call' tag should render a sub-template" , function() {
		var template , partial , ctx ,
			lib = new Temple.Lib() ;
		
		partial = Temple.parse( '${firstName} ${lastName} of ${city}\n' , { id: 'partial' , lib: lib } ) ;
		
		ctx = { path: { to: { "var": [
			{
				firstName: "Joe" ,
				lastName: "Doe" ,
				city : "New York"
			} ,
			{
				firstName: "Sandra" ,
				lastName: "Murphy" ,
				city : "Los Angeles"
			} 
		] } } } ;
		
		template = Temple.parse( '{{$path.to.var}}{{call partial/}}{{/}}' , { lib: lib } ) ;
		expect( template.render( ctx ) ).to.be( "Joe Doe of New York\nSandra Murphy of Los Angeles\n" ) ;
		
		template = Temple.parse( '{{call partial $path.to.var[0]/}}' , { lib: lib } ) ;
		expect( template.render( ctx ) ).to.be( "Joe Doe of New York\n" ) ;
	} ) ;
	
	it( "'call' tag '@' syntax" , function() {
		var template , partial , ctx ,
			lib = new Temple.Lib() ;
		
		partial = Temple.parse( '${firstName} ${lastName} of ${city}\n' , { id: 'partial' , lib: lib } ) ;
		
		ctx = { path: { to: { "var": [
			{
				firstName: "Joe" ,
				lastName: "Doe" ,
				city : "New York"
			} ,
			{
				firstName: "Sandra" ,
				lastName: "Murphy" ,
				city : "Los Angeles"
			} 
		] } } } ;
		
		template = Temple.parse( '{{@partial $path.to.var[1]/}}' , { lib: lib } ) ;
		expect( template.render( ctx ) ).to.be( "Sandra Murphy of Los Angeles\n" ) ;
	} ) ;
	
	it( "no root context preservation" , function() {
		var template , partial , ctx ,
			lib = new Temple.Lib() ;
		
		partial = Temple.parse( '${.greetings} ${firstName} ${lastName} of ${city}\n' , { id: 'partial' , lib: lib } ) ;
		
		ctx = { 
			greetings: 'Hello' ,
			path: { to: { "var": [
				{
					firstName: "Joe" ,
					lastName: "Doe" ,
					city : "New York"
				} ,
				{
					firstName: "Sandra" ,
					lastName: "Murphy" ,
					city : "Los Angeles"
				}
			]
		} } } ;
		
		template = Temple.parse( '{{$path.to.var}}{{call partial/}}{{/}}' , { lib: lib } ) ;
		expect( template.render( ctx ) ).to.be( "(undefined) Joe Doe of New York\n(undefined) Sandra Murphy of Los Angeles\n" ) ;
	} ) ;
} ) ;



describe( "Template library" , function() {
	
	it( "should load all dependencies" , function( done ) {
		var template , partial , ctx ;
		
		var lib = new Temple.Lib( {
			loadAsync: async function( id ) {
				//console.log( "id:" , id ) ;
				switch ( id ) {
					case 'description' :
						return '{{call greetings/}} ${firstName} ${lastName} of ${city}{{call punctuation}}\n' ;
					case 'greetings' :
						return 'Hello' ;
					case 'punctuation' :
						return '!!!' ;
					default :
						break ;
				}
			}
		} ) ;
		
		
		ctx = { path: { to: { "var": [
			{
				firstName: "Joe" ,
				lastName: "Doe" ,
				city : "New York"
			} ,
			{
				firstName: "Sandra" ,
				lastName: "Murphy" ,
				city : "Los Angeles"
			} 
		] } } } ;
		
		template = Temple.parse( '{{call greetings/}}!\n{{$path.to.var}}{{call description/}}\n{{/}}' , { lib: lib } ) ;
		
		lib.loadDependenciesAsync().then( () => {
			expect( template.render( ctx ) ).to.be( "Hello!\nHello Joe Doe of New York!!!\nHello Sandra Murphy of Los Angeles!!!\n" ) ;
			done() ;
		} )
		.catch( error => done( error ) ) ;
	} ) ;
} ) ;



describe( "root context" , function() {
	
	it( "the root context should be accessible using the '$.' variable" , function() {
		var template , ctx ;
		
		ctx = {
			greetings: "Hello" ,
			path: { to: { "var": [
				{
					firstName: "Joe" ,
					lastName: "Doe" ,
					city : "New York"
				} ,
				{
					firstName: "Sandra" ,
					lastName: "Murphy" ,
					city : "Los Angeles"
				} 
			] } }
		} ;
		
		template = Temple.parse( '{{$path.to.var}}${.greetings} ${firstName} ${lastName} of ${city}\n{{/}}' ) ;
		expect( template.render( ctx ) ).to.be( "Hello Joe Doe of New York\nHello Sandra Murphy of Los Angeles\n" ) ;
		
		template = Temple.parse( '{{$path}}{{$to.var}}${.greetings} ${firstName} ${lastName} of ${city}\n{{//}}' ) ;
		expect( template.render( ctx ) ).to.be( "Hello Joe Doe of New York\nHello Sandra Murphy of Los Angeles\n" ) ;
		
		template = Temple.parse( '{{$path}}{{$to}}{{$var}}${.greetings} ${firstName} ${lastName} of ${city}\n{{///}}' ) ;
		expect( template.render( ctx ) ).to.be( "Hello Joe Doe of New York\nHello Sandra Murphy of Los Angeles\n" ) ;
	} ) ;
} ) ;



describe( "close syntactic sugar syntax" , function() {
	
	it( "close-open syntactic sugar" , function() {
		expect( Temple.render( "Is it {{if $test}}a test{{/else}}real{{/}}?" , { test: true } ) ).to.be( "Is it a test?" ) ;
		expect( Temple.render( "Is it {{if $test}}a test{{/else}}real{{/}}?" , { test: false } ) ).to.be( "Is it real?" ) ;
	} ) ;
	
	it( "multiple close syntactic sugar" , function() {
		var template , ctx ;
		
		ctx = {
			path: { to: { "var": {
					firstName: "Joe" ,
					lastName: "Doe" ,
			} } }
		} ;
		
		template = Temple.parse( '{{$path}}{{$to}}{{$var}}${firstName} ${lastName}\n{{//}}${to.var.firstName} ${to.var.lastName}\n{{/}}' ) ;
		expect( template.render( ctx ) ).to.be( "Joe Doe\nJoe Doe\n" ) ;
		
		template = Temple.parse( '{{$path}}{{$to}}{{$var}}${firstName} ${lastName}\n{{///}}${path.to.var.firstName} ${path.to.var.lastName}\n' ) ;
		expect( template.render( ctx ) ).to.be( "Joe Doe\nJoe Doe\n" ) ;
	} ) ;
} ) ;



describe( "escape syntax" , function() {
	it( "escape" , function() {
		expect( Temple.render( "Just a \\a \\{} little{{if $test}} test{{/}}." , { test: true } ) ).to.be( "Just a \\a {} little test." ) ;
		expect( Temple.render( "Just a \\a \\{} little{{if $test}} test{{/}}." , { test: false } ) ).to.be( "Just a \\a {} little." ) ;
	} ) ;
} ) ;



 