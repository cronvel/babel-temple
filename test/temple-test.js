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



/* jshint unused:false */
/* global describe, it, before, after */

"use strict" ;



var Temple = require( '../lib/Temple.js' ) ;

var expect = require( 'expect.js' ) ;





			/* Tests */





describe( "'if' syntax" , function() {
	
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
	
	it( "'if-else' using the close-open syntaxic sugar" , function() {
		expect( Temple.render( "Is it {{if $test}}a test{{/else}}real{{/}}?" , { test: true } ) ).to.be( "Is it a test?" ) ;
		expect( Temple.render( "Is it {{if $test}}a test{{/else}}real{{/}}?" , { test: false } ) ).to.be( "Is it real?" ) ;
	} ) ;
	
	it( "'if-elseif' syntax" , function() {
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/}}{{elseif $value < 0}}negative{{/}}." , { value: 3 } ) ).to.be( "It is positive." ) ;
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/}}{{elseif $value < 0}}negative{{/}}." , { value: -3 } ) ).to.be( "It is negative." ) ;
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/}}{{elseif $value < 0}}negative{{/}}." , { value: 0 } ) ).to.be( "It is ." ) ;
	} ) ;
	
	it( "'if-elseif' using the close-open syntaxic sugar" , function() {
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/elseif $value < 0}}negative{{/}}." , { value: 3 } ) ).to.be( "It is positive." ) ;
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/elseif $value < 0}}negative{{/}}." , { value: -3 } ) ).to.be( "It is negative." ) ;
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/elseif $value < 0}}negative{{/}}." , { value: 0 } ) ).to.be( "It is ." ) ;
	} ) ;
	
	it( "'if-elseif-else' syntax" , function() {
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/}}{{elseif $value < 0}}negative{{/}}{{else}}zero{{/}}." , { value: 3 } ) ).to.be( "It is positive." ) ;
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/}}{{elseif $value < 0}}negative{{/}}{{else}}zero{{/}}." , { value: -3 } ) ).to.be( "It is negative." ) ;
		expect( Temple.render( "It is {{if $value > 0 }}positive{{/}}{{elseif $value < 0}}negative{{/}}{{else}}zero{{/}}." , { value: 0 } ) ).to.be( "It is zero." ) ;
	} ) ;
	
	it( "'if-elseif-else' using the close-open syntaxic sugar" , function() {
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



describe( "'foreach' syntax" , function() {
	
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



describe( "'use' syntax" , function() {
	
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
		
		ctx = { path: { to: { "var": {
			firstName: "Joe" ,
			lastName: "Doe" ,
			city : "New York"
		} } } } ;
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
	
	it( "if the variable is a non-object falsy value, it should not render its inner content" , function() {
		var template , ctx ;
		
		template = Temple.parse( '{{use $path.to.var}}${firstName} ${lastName} of ${city}\n{{/}}' ) ;
		
		ctx = { path: { to: { "var": false } } } ;
		
		expect( template.render( ctx ) ).to.be( "" ) ;
	} ) ;
	
	it( "if the variable is a non-object truthy value, it should render its inner content" , function() {
		var template , ctx ;
		
		ctx = { path: { to: { "var": "some string" } } } ;
		template = Temple.parse( '{{use $path.to.var}}${firstName} ${lastName} of ${city}\n{{/}}' ) ;
		
		expect( template.render( ctx ) ).to.be( "(undefined) (undefined) of (undefined)\n" ) ;
		
		template = Temple.parse( '{{use $path.to.var}}value: $\n{{/}}' ) ;
		expect( template.render( ctx ) ).to.be( "value: some string\n" ) ;
	} ) ;
} ) ;



describe( "escape syntax" , function() {
	it( "escape" , function() {
		expect( Temple.render( "Just a \\a \\{} little{{if $test}} test{{/}}." , { test: true } ) ).to.be( "Just a \\a {} little test." ) ;
		expect( Temple.render( "Just a \\a \\{} little{{if $test}} test{{/}}." , { test: false } ) ).to.be( "Just a \\a {} little." ) ;
	} ) ;
} ) ;

 