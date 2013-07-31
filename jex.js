/**
 * BSD
 *   Copyright (c) 2013, Josh Wright <@BendyTree>
 *   All rights reserved. 
 *   Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met: 
 *   Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer. 
 *   Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution. 
 *   THIS SOFTWARE IS PROVIDED BY Josh Wright "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Josh Wright BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
 
 
/*
 * JEX - Javascript EXception logging
 
 * JEX makes it easy to log JavaScript exceptions to your server. 
 * It has no dependencies.
 * 
 *
 * #Getting Started
 *
 * <script src='jex.js'></script>
 * 
 * <script>
 *   jex.config({
 *     url: '/LogException',
 *     context: function(){
 *         return $('.account .uid').text();
 *     }
 *   });
 * </script>
 *
 *
 * #How It Works
 *
 * JavaScript exceptions automatically call `window.onerror` with the
 * description, file, and line. JEX forwards these exceptions to an
 * AJAX request of the URL you specify. No jQuery required.
 *
 * Unfortunately, a stack trace is not given in `onerror`. In fact, the
 * only reliable way to get a stack trace is if the code is wrapped in
 * a try/catch.
 *
 * JEX makes it easy to wrap your code in a try catch. Use `jex.do`:
 *
 *   jex.do(function(){
 *     var x = null;
 *     x.length; //throws
 *   }); 
 *
 * JEX `do` wraps your function in a try/catch and runs it immediately.
 * If your function fails, you get a full stack trace.
 *
 * JEX also tries to plug itself in to automatically try/catch common
 * callbacks like `setTimeout` and `setInterval`.  Just use them like
 * normal and if an exception is thrown then it will automatically include
 * a stack trace.
 *
 * jQuery also does many callbacks, which pass through its `on` method.
 * If you include jquery.js before jex.js then JEX will automatically
 * add stack traces to jQuery events (such as click, keyup, etc).
 *
 * Remember that a named function will show its name in a call stack. For
 * example:
 *
 *   setTimeout(function YourTimeIsUp(){
 *     ...your code here...
 *   }, 1000);
 *
 *
 * #API
 *
 * ## jex.config(options)
 *
 * All properties on `options` are optional:
 * options.url - (string) the url where errors should be logged
 * options.context - (string or function) extra data that should be sent to the server
 *                   If a function is given, it will be called. A string is the expected result.
 *
 *
 * ## jex.do(function)
 *
 * Wraps the given function in a try/catch (to enable stack traces),
 * then executes it before calling back. Returns the value that the
 * function returns.
 *
 * 
 * ## jex.bind(function)
 *
 * Returns a function that wraps the given function in a try/catch.
 *
 *
 * ## AJAX Request
 * 
 * The error will be sent as a GET request with fields `log` and `context`. ie.
 *
 * http://mysite.com/LogException?log=...&context=...
 *
 */

(function(){
  
  var options = {};
  
  var send = function(log){  
    
    var context = '';
    if(typeof options.context == 'function')
        context = options.context();
    else if(options.context)
        context = options.context;
          
    if(window && window.console && window.console.log)
      console.log({
        log: log,
        context: context
      });

    if(!options.url)
        return;
        
    var xmlhttp;
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    }else if(window.ActiveXObject){ // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }else{
      return;
    }
    
    xmlhttp.open("GET", options.url+"?log="+encodeURIComponent(log)+'&context='+encodeURIComponent(context), true);
    xmlhttp.send();
  };
  
  var handleError = function(message, file, line, error){
      var log = '';
      if(file || line || message)
        log += file+":"+line+" "+message;
      if(error){
        if(typeof error == 'string'){
          log += error;
        }else{
          if(error.message)
             log += "\nMessage: "+error.message;
          if(error.stack)
             log += "\nStack: "+error.stack;
        }
      }
  
      send(log);
        
      return false; /* true means it was handled */
  };
  
  window.onerror = handleError;
  
  var _setTimeout = window.setTimeout;
  window.setTimeout = function(action, timeout){
    return _setTimeout(function(){
        window.jex.do(action);
    }, timeout);
  };
  
  var _setInterval = window.setInterval;
  window.setInterval = function(action, timeout){
    return _setInterval(function(){
        window.jex.do(action);
    }, timeout);
  };
  
  if(window.jQuery && jQuery.fn && jQuery.fn.on){
    var _on = jQuery.fn.on;
    jQuery.fn.on = function() {
      if(typeof arguments.length == 'number'){
        for(var i=arguments.length-1; i>=0; i--){
          if(typeof arguments[i] == 'function'){
            arguments[i] = jex.bind(arguments[i]);
            break;
          }
        }
      }
    
      return _on.apply(this, arguments);
    };
  }

  window.jex = {
    config: function(op){
      if(op)
        options = op;
    },
    do: function(action){
      try{
        return action();
      }catch(e){
        handleError(null, null, null, e);
      }
    },
    bind: function(action){
      return function(){
        return jex.do(action);
      };
    }
  };
  
})();