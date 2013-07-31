#JEX

Javascript EXception logging
 
JEX makes it easy to log JavaScript exceptions to your server. 
It has no dependencies.


#Getting Started

		<script src='jex.js'></script>

		<script>
		  jex.config({
		    url: '/LogException',
		    context: function(){
		        return $('.account .uid').text();
		    }
		  });
		</script>


#How It Works

JavaScript exceptions automatically call `window.onerror` with the
description, file, and line. JEX forwards these exceptions to an
AJAX request of the URL you specify. No jQuery required.

Unfortunately, a stack trace is not given in `onerror`. In fact, the
only reliable way to get a stack trace is if the code is wrapped in
a try/catch.

JEX makes it easy to wrap your code in a try catch. Use `jex.do`:

	  jex.do(function(){
	    var x = null;
	    x.length; //throws
	  }); 

JEX `do` wraps your function in a try/catch and runs it immediately.
If your function fails, you get a full stack trace.

JEX also tries to plug itself in to automatically try/catch common
callbacks like `setTimeout` and `setInterval`.  Just use them like
normal and if an exception is thrown then it will automatically include
a stack trace.

jQuery also does many callbacks, which pass through its `on` method.
If you include jquery.js before jex.js then JEX will automatically
add stack traces to jQuery events (such as click, keyup, etc).

Remember that a named function will show its name in a call stack. For
example:

	  setTimeout(function YourTimeIsUp(){
	    ...your code here...
	  }, 1000);


#API

## jex.config(options)

All properties on `options` are optional:
options.url - (string) the url where errors should be logged
options.context - (string or function) extra data that should be sent to the server
                  If a function is given, it will be called. A string is the expected result.


## jex.do(function)

Wraps the given function in a try/catch (to enable stack traces),
then executes it before calling back. Returns the value that the
function returns.


## jex.bind(function)

Returns a function that wraps the given function in a try/catch.


## AJAX Request

The error will be sent as a GET request with fields `log` and `context`. ie.

http://mysite.com/LogException?log=...&context=...

