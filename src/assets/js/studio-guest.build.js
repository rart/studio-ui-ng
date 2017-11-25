!function(t){function e(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}var n={};e.m=t,e.c=n,e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:r})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="/",e(e.s=2)}([function(t,e,n){"use strict";function r(){}function o(t){try{return t.then}catch(t){return _=t,w}}function i(t,e){try{return t(e)}catch(t){return _=t,w}}function s(t,e,n){try{t(e,n)}catch(t){return _=t,w}}function a(t){if("object"!==typeof this)throw new TypeError("Promises must be constructed via new");if("function"!==typeof t)throw new TypeError("Promise constructor's argument is not a function");this._75=0,this._83=0,this._18=null,this._38=null,t!==r&&y(t,this)}function u(t,e,n){return new t.constructor(function(o,i){var s=new a(r);s.then(o,i),c(t,new p(e,n,s))})}function c(t,e){for(;3===t._83;)t=t._18;if(a._47&&a._47(t),0===t._83)return 0===t._75?(t._75=1,void(t._38=e)):1===t._75?(t._75=2,void(t._38=[t._38,e])):void t._38.push(e);f(t,e)}function f(t,e){b(function(){var n=1===t._83?e.onFulfilled:e.onRejected;if(null===n)return void(1===t._83?l(e.promise,t._18):h(e.promise,t._18));var r=i(n,t._18);r===w?h(e.promise,_):l(e.promise,r)})}function l(t,e){if(e===t)return h(t,new TypeError("A promise cannot be resolved with itself."));if(e&&("object"===typeof e||"function"===typeof e)){var n=o(e);if(n===w)return h(t,_);if(n===t.then&&e instanceof a)return t._83=3,t._18=e,void d(t);if("function"===typeof n)return void y(n.bind(e),t)}t._83=1,t._18=e,d(t)}function h(t,e){t._83=2,t._18=e,a._71&&a._71(t,e),d(t)}function d(t){if(1===t._75&&(c(t,t._38),t._38=null),2===t._75){for(var e=0;e<t._38.length;e++)c(t,t._38[e]);t._38=null}}function p(t,e,n){this.onFulfilled="function"===typeof t?t:null,this.onRejected="function"===typeof e?e:null,this.promise=n}function y(t,e){var n=!1,r=s(t,function(t){n||(n=!0,l(e,t))},function(t){n||(n=!0,h(e,t))});n||r!==w||(n=!0,h(e,_))}var b=n(5),_=null,w={};t.exports=a,a._47=null,a._71=null,a._44=r,a.prototype.then=function(t,e){if(this.constructor!==a)return u(this,t,e);var n=new a(r);return c(this,new p(t,e,n)),n}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});!function(t){t.ALL="ALL",t.GUEST_CHECK_IN="GUEST_CHECK_IN",t.GUEST_LOAD_EVENT="GUEST_LOAD_EVENT",t.HOST_ICE_START_REQUEST="HOST_ICE_START_REQUEST",t.HOST_END_ICE_REQUEST="HOST_END_ICE_REQUEST",t.HOST_RELOAD_REQUEST="HOST_RELOAD_REQUEST",t.HOST_NAV_REQUEST="HOST_NAV_REQUEST"}(e.MessageTopic||(e.MessageTopic={}));var r;!function(t){t[t.Local=0]="Local",t[t.External=1]="External",t[t.Broadcast=2]="Broadcast"}(r=e.MessageScope||(e.MessageScope={}));var o=function(){function t(t,e,n){void 0===n&&(n=r.Broadcast),this.topic=t,this.data=e,this.scope=n}return t}();e.Message=o;var i=function(){function t(){this.targets=[],this.origins=[],window.addEventListener("message",this.onMessage.bind(this),!1)}return t.prototype.onMessage=function(t){var e=t.data,n=t.origin;this.originAllowed(n)?this.processReceivedMessage(e):console.log("Communicator: Message received from a disallowed origin.")},t.prototype.addTarget=function(t){this.removeTarget(t),this.targets.push(t)},t.prototype.resetTargets=function(){this.targets=[]},t.prototype.removeTarget=function(t){this.targets=this.targets.filter(function(e){return e!==t})},t.prototype.addOrigin=function(t){this.removeOrigin(t),this.origins.push(t)},t.prototype.resetOrigins=function(){this.origins=[]},t.prototype.removeOrigin=function(t){this.origins=this.origins.filter(function(e){return e!==t})},t.prototype.publish=function(t,e,n){var i=this;void 0===e&&(e=null),void 0===n&&(n=r.Broadcast);var s=new o(t,e,n);this.targets.forEach(function(t){t.postMessage||(t=t.contentWindow),t&&t.postMessage?t.postMessage(s,"*"):i.removeTarget(t)})},t.prototype.originAllowed=function(t){for(var e=this.origins,n=0,r=e.length;n<r;++n)if(e[n]===t)return!0;return!1},t}();e.Communicator=i},function(t,e,n){n(3),t.exports=n(10)},function(t,e,n){"use strict";"undefined"===typeof Promise&&(n(4).enable(),window.Promise=n(7)),n(8),Object.assign=n(9)},function(t,e,n){"use strict";function r(){c=!1,a._47=null,a._71=null}function o(t){function e(e){(t.allRejections||s(l[e].error,t.whitelist||u))&&(l[e].displayId=f++,t.onUnhandled?(l[e].logged=!0,t.onUnhandled(l[e].displayId,l[e].error)):(l[e].logged=!0,i(l[e].displayId,l[e].error)))}function n(e){l[e].logged&&(t.onHandled?t.onHandled(l[e].displayId,l[e].error):l[e].onUnhandled||(console.warn("Promise Rejection Handled (id: "+l[e].displayId+"):"),console.warn('  This means you can ignore any previous messages of the form "Possible Unhandled Promise Rejection" with id '+l[e].displayId+".")))}t=t||{},c&&r(),c=!0;var o=0,f=0,l={};a._47=function(t){2===t._83&&l[t._56]&&(l[t._56].logged?n(t._56):clearTimeout(l[t._56].timeout),delete l[t._56])},a._71=function(t,n){0===t._75&&(t._56=o++,l[t._56]={displayId:null,error:n,timeout:setTimeout(e.bind(null,t._56),s(n,u)?100:2e3),logged:!1})}}function i(t,e){console.warn("Possible Unhandled Promise Rejection (id: "+t+"):"),((e&&(e.stack||e))+"").split("\n").forEach(function(t){console.warn("  "+t)})}function s(t,e){return e.some(function(e){return t instanceof e})}var a=n(0),u=[ReferenceError,TypeError,RangeError],c=!1;e.disable=r,e.enable=o},function(t,e,n){"use strict";(function(e){function n(t){s.length||(i(),a=!0),s[s.length]=t}function r(){for(;u<s.length;){var t=u;if(u+=1,s[t].call(),u>c){for(var e=0,n=s.length-u;e<n;e++)s[e]=s[e+u];s.length-=u,u=0}}s.length=0,u=0,a=!1}function o(t){return function(){function e(){clearTimeout(n),clearInterval(r),t()}var n=setTimeout(e,0),r=setInterval(e,50)}}t.exports=n;var i,s=[],a=!1,u=0,c=1024,f="undefined"!==typeof e?e:self,l=f.MutationObserver||f.WebKitMutationObserver;i="function"===typeof l?function(t){var e=1,n=new l(t),r=document.createTextNode("");return n.observe(r,{characterData:!0}),function(){e=-e,r.data=e}}(r):o(r),n.requestFlush=i,n.makeRequestCallFromTimer=o}).call(e,n(6))},function(t,e){var n;n=function(){return this}();try{n=n||Function("return this")()||(0,eval)("this")}catch(t){"object"===typeof window&&(n=window)}t.exports=n},function(t,e,n){"use strict";function r(t){var e=new o(o._44);return e._83=1,e._18=t,e}var o=n(0);t.exports=o;var i=r(!0),s=r(!1),a=r(null),u=r(void 0),c=r(0),f=r("");o.resolve=function(t){if(t instanceof o)return t;if(null===t)return a;if(void 0===t)return u;if(!0===t)return i;if(!1===t)return s;if(0===t)return c;if(""===t)return f;if("object"===typeof t||"function"===typeof t)try{var e=t.then;if("function"===typeof e)return new o(e.bind(t))}catch(t){return new o(function(e,n){n(t)})}return r(t)},o.all=function(t){var e=Array.prototype.slice.call(t);return new o(function(t,n){function r(s,a){if(a&&("object"===typeof a||"function"===typeof a)){if(a instanceof o&&a.then===o.prototype.then){for(;3===a._83;)a=a._18;return 1===a._83?r(s,a._18):(2===a._83&&n(a._18),void a.then(function(t){r(s,t)},n))}var u=a.then;if("function"===typeof u){return void new o(u.bind(a)).then(function(t){r(s,t)},n)}}e[s]=a,0===--i&&t(e)}if(0===e.length)return t([]);for(var i=e.length,s=0;s<e.length;s++)r(s,e[s])})},o.reject=function(t){return new o(function(e,n){n(t)})},o.race=function(t){return new o(function(e,n){t.forEach(function(t){o.resolve(t).then(e,n)})})},o.prototype.catch=function(t){return this.then(null,t)}},function(t,e){!function(t){"use strict";function e(t){if("string"!==typeof t&&(t=String(t)),/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(t))throw new TypeError("Invalid character in header field name");return t.toLowerCase()}function n(t){return"string"!==typeof t&&(t=String(t)),t}function r(t){var e={next:function(){var e=t.shift();return{done:void 0===e,value:e}}};return _.iterable&&(e[Symbol.iterator]=function(){return e}),e}function o(t){this.map={},t instanceof o?t.forEach(function(t,e){this.append(e,t)},this):Array.isArray(t)?t.forEach(function(t){this.append(t[0],t[1])},this):t&&Object.getOwnPropertyNames(t).forEach(function(e){this.append(e,t[e])},this)}function i(t){if(t.bodyUsed)return Promise.reject(new TypeError("Already read"));t.bodyUsed=!0}function s(t){return new Promise(function(e,n){t.onload=function(){e(t.result)},t.onerror=function(){n(t.error)}})}function a(t){var e=new FileReader,n=s(e);return e.readAsArrayBuffer(t),n}function u(t){var e=new FileReader,n=s(e);return e.readAsText(t),n}function c(t){for(var e=new Uint8Array(t),n=new Array(e.length),r=0;r<e.length;r++)n[r]=String.fromCharCode(e[r]);return n.join("")}function f(t){if(t.slice)return t.slice(0);var e=new Uint8Array(t.byteLength);return e.set(new Uint8Array(t)),e.buffer}function l(){return this.bodyUsed=!1,this._initBody=function(t){if(this._bodyInit=t,t)if("string"===typeof t)this._bodyText=t;else if(_.blob&&Blob.prototype.isPrototypeOf(t))this._bodyBlob=t;else if(_.formData&&FormData.prototype.isPrototypeOf(t))this._bodyFormData=t;else if(_.searchParams&&URLSearchParams.prototype.isPrototypeOf(t))this._bodyText=t.toString();else if(_.arrayBuffer&&_.blob&&m(t))this._bodyArrayBuffer=f(t.buffer),this._bodyInit=new Blob([this._bodyArrayBuffer]);else{if(!_.arrayBuffer||!ArrayBuffer.prototype.isPrototypeOf(t)&&!v(t))throw new Error("unsupported BodyInit type");this._bodyArrayBuffer=f(t)}else this._bodyText="";this.headers.get("content-type")||("string"===typeof t?this.headers.set("content-type","text/plain;charset=UTF-8"):this._bodyBlob&&this._bodyBlob.type?this.headers.set("content-type",this._bodyBlob.type):_.searchParams&&URLSearchParams.prototype.isPrototypeOf(t)&&this.headers.set("content-type","application/x-www-form-urlencoded;charset=UTF-8"))},_.blob&&(this.blob=function(){var t=i(this);if(t)return t;if(this._bodyBlob)return Promise.resolve(this._bodyBlob);if(this._bodyArrayBuffer)return Promise.resolve(new Blob([this._bodyArrayBuffer]));if(this._bodyFormData)throw new Error("could not read FormData body as blob");return Promise.resolve(new Blob([this._bodyText]))},this.arrayBuffer=function(){return this._bodyArrayBuffer?i(this)||Promise.resolve(this._bodyArrayBuffer):this.blob().then(a)}),this.text=function(){var t=i(this);if(t)return t;if(this._bodyBlob)return u(this._bodyBlob);if(this._bodyArrayBuffer)return Promise.resolve(c(this._bodyArrayBuffer));if(this._bodyFormData)throw new Error("could not read FormData body as text");return Promise.resolve(this._bodyText)},_.formData&&(this.formData=function(){return this.text().then(p)}),this.json=function(){return this.text().then(JSON.parse)},this}function h(t){var e=t.toUpperCase();return g.indexOf(e)>-1?e:t}function d(t,e){e=e||{};var n=e.body;if(t instanceof d){if(t.bodyUsed)throw new TypeError("Already read");this.url=t.url,this.credentials=t.credentials,e.headers||(this.headers=new o(t.headers)),this.method=t.method,this.mode=t.mode,n||null==t._bodyInit||(n=t._bodyInit,t.bodyUsed=!0)}else this.url=String(t);if(this.credentials=e.credentials||this.credentials||"omit",!e.headers&&this.headers||(this.headers=new o(e.headers)),this.method=h(e.method||this.method||"GET"),this.mode=e.mode||this.mode||null,this.referrer=null,("GET"===this.method||"HEAD"===this.method)&&n)throw new TypeError("Body not allowed for GET or HEAD requests");this._initBody(n)}function p(t){var e=new FormData;return t.trim().split("&").forEach(function(t){if(t){var n=t.split("="),r=n.shift().replace(/\+/g," "),o=n.join("=").replace(/\+/g," ");e.append(decodeURIComponent(r),decodeURIComponent(o))}}),e}function y(t){var e=new o;return t.split(/\r?\n/).forEach(function(t){var n=t.split(":"),r=n.shift().trim();if(r){var o=n.join(":").trim();e.append(r,o)}}),e}function b(t,e){e||(e={}),this.type="default",this.status="status"in e?e.status:200,this.ok=this.status>=200&&this.status<300,this.statusText="statusText"in e?e.statusText:"OK",this.headers=new o(e.headers),this.url=e.url||"",this._initBody(t)}if(!t.fetch){var _={searchParams:"URLSearchParams"in t,iterable:"Symbol"in t&&"iterator"in Symbol,blob:"FileReader"in t&&"Blob"in t&&function(){try{return new Blob,!0}catch(t){return!1}}(),formData:"FormData"in t,arrayBuffer:"ArrayBuffer"in t};if(_.arrayBuffer)var w=["[object Int8Array]","[object Uint8Array]","[object Uint8ClampedArray]","[object Int16Array]","[object Uint16Array]","[object Int32Array]","[object Uint32Array]","[object Float32Array]","[object Float64Array]"],m=function(t){return t&&DataView.prototype.isPrototypeOf(t)},v=ArrayBuffer.isView||function(t){return t&&w.indexOf(Object.prototype.toString.call(t))>-1};o.prototype.append=function(t,r){t=e(t),r=n(r);var o=this.map[t];this.map[t]=o?o+","+r:r},o.prototype.delete=function(t){delete this.map[e(t)]},o.prototype.get=function(t){return t=e(t),this.has(t)?this.map[t]:null},o.prototype.has=function(t){return this.map.hasOwnProperty(e(t))},o.prototype.set=function(t,r){this.map[e(t)]=n(r)},o.prototype.forEach=function(t,e){for(var n in this.map)this.map.hasOwnProperty(n)&&t.call(e,this.map[n],n,this)},o.prototype.keys=function(){var t=[];return this.forEach(function(e,n){t.push(n)}),r(t)},o.prototype.values=function(){var t=[];return this.forEach(function(e){t.push(e)}),r(t)},o.prototype.entries=function(){var t=[];return this.forEach(function(e,n){t.push([n,e])}),r(t)},_.iterable&&(o.prototype[Symbol.iterator]=o.prototype.entries);var g=["DELETE","GET","HEAD","OPTIONS","POST","PUT"];d.prototype.clone=function(){return new d(this,{body:this._bodyInit})},l.call(d.prototype),l.call(b.prototype),b.prototype.clone=function(){return new b(this._bodyInit,{status:this.status,statusText:this.statusText,headers:new o(this.headers),url:this.url})},b.error=function(){var t=new b(null,{status:0,statusText:""});return t.type="error",t};var T=[301,302,303,307,308];b.redirect=function(t,e){if(-1===T.indexOf(e))throw new RangeError("Invalid status code");return new b(null,{status:e,headers:{location:t}})},t.Headers=o,t.Request=d,t.Response=b,t.fetch=function(t,e){return new Promise(function(n,r){var o=new d(t,e),i=new XMLHttpRequest;i.onload=function(){var t={status:i.status,statusText:i.statusText,headers:y(i.getAllResponseHeaders()||"")};t.url="responseURL"in i?i.responseURL:t.headers.get("X-Request-URL");var e="response"in i?i.response:i.responseText;n(new b(e,t))},i.onerror=function(){r(new TypeError("Network request failed"))},i.ontimeout=function(){r(new TypeError("Network request failed"))},i.open(o.method,o.url,!0),"include"===o.credentials&&(i.withCredentials=!0),"responseType"in i&&_.blob&&(i.responseType="blob"),o.headers.forEach(function(t,e){i.setRequestHeader(e,t)}),i.send("undefined"===typeof o._bodyInit?null:o._bodyInit)})},t.fetch.polyfill=!0}}("undefined"!==typeof self?self:this)},function(t,e,n){"use strict";function r(t){if(null===t||void 0===t)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(t)}var o=Object.getOwnPropertySymbols,i=Object.prototype.hasOwnProperty,s=Object.prototype.propertyIsEnumerable;t.exports=function(){try{if(!Object.assign)return!1;var t=new String("abc");if(t[5]="de","5"===Object.getOwnPropertyNames(t)[0])return!1;for(var e={},n=0;n<10;n++)e["_"+String.fromCharCode(n)]=n;if("0123456789"!==Object.getOwnPropertyNames(e).map(function(t){return e[t]}).join(""))return!1;var r={};return"abcdefghijklmnopqrst".split("").forEach(function(t){r[t]=t}),"abcdefghijklmnopqrst"===Object.keys(Object.assign({},r)).join("")}catch(t){return!1}}()?Object.assign:function(t,e){for(var n,a,u=r(t),c=1;c<arguments.length;c++){n=Object(arguments[c]);for(var f in n)i.call(n,f)&&(u[f]=n[f]);if(o){a=o(n);for(var l=0;l<a.length;l++)s.call(n,a[l])&&(u[a[l]]=n[a[l]])}}return u}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),n(11).Guestify()},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=n(1),o=n(12),i="background: #222; color: #bada55";e.Guestify=function(){console.log("%c\n    *******************************************************************************************\n    ** >> Guest Loaded @ "+window.location.href+" << **\n    *******************************************************************************************",i);var t=window.location.protocol,e=window.location.hostname,n=window.location.port?":"+window.location.port:"",s=window.location.origin||t+"//"+e+n,a=new o.GuestCommunicator;a.addOrigin(s),a.addTarget(window.parent),a.publish(r.MessageTopic.GUEST_CHECK_IN,{location:window.location.href,title:document.head.getElementsByTagName("title")[0].innerHTML,url:window.location.href.replace(window.location.origin,"")}),window.addEventListener("load",function(){a.publish(r.MessageTopic.GUEST_LOAD_EVENT,{location:window.location.href,title:document.head.getElementsByTagName("title")[0].innerHTML,url:window.location.href.replace(window.location.origin,"")})}),a.subscribe(r.MessageTopic.HOST_ICE_START_REQUEST,function(t){console.log("%c Ice Start Requested ",i,t)}),a.subscribe(r.MessageTopic.HOST_RELOAD_REQUEST,function(){window.location.reload()}),a.subscribe(r.MessageTopic.HOST_NAV_REQUEST,function(t){console.log("%c Guest received GUEST_NAV_REQUEST to "+t+" ",i),window.location.href=t})}},function(t,e,n){"use strict";var r=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])};return function(e,n){function r(){this.constructor=e}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}();Object.defineProperty(e,"__esModule",{value:!0});var o=n(13),i=n(1),s=function(t){function e(){return t.call(this)||this}return r(e,t),e.prototype.processReceivedMessage=function(t){var e=this._getScopedTopic(t.topic,t.scope);o.Amplify.publish(""+i.MessageTopic.ALL,t.data),o.Amplify.publish(""+t.topic,t.data),o.Amplify.publish(e,t.data)},e.prototype._getScopedTopic=function(t,e){return e?e+":"+t:""+t},e.prototype.subscribe=function(t,e,n){var r=this._getScopedTopic(t,n);o.Amplify.subscribe(r,e)},e}(i.Communicator);e.GuestCommunicator=s},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=[].slice,o={},i=function(){function t(){}return t.publish=function(t){for(var e=[],n=1;n<arguments.length;n++)e[n-1]=arguments[n];var i,s,a,u,c=r.call(arguments,1),f=0;if(!o[t])return!0;for(i=o[t].slice(),a=i.length;f<a&&(s=i[f],!1!==(u=s.callback.apply(s.context,c)));f++);return!1!==u},t.subscribe=function(t,e,n,r){3===arguments.length&&"number"===typeof n&&(r=n,n=e,e=null),2===arguments.length&&(n=e,e=null),r=r||10;for(var i,s=0,a=t.split(/\s/),u=a.length;s<u;s++){t=a[s],i=!1,o[t]||(o[t]=[]);for(var c=o[t].length-1,f={callback:n,context:e,priority:r};c>=0;c--)if(o[t][c].priority<=r){o[t].splice(c+1,0,f),i=!0;break}i||o[t].unshift(f)}return n},t.unsubscribe=function(t,e,n){if(2===arguments.length&&(n=e,e=null),o[t])for(var r=o[t].length,i=0;i<r;i++)o[t][i].callback===n&&(e&&o[t][i].context!==e||(o[t].splice(i,1),i--,r--))},t}();e.Amplify=i}]);
//# sourceMappingURL=main.f047b93a.js.map