var style_cookie;
var style_cookie_txt;
var style_cookie_site;
var kumod_set = false;
var quick_reply = false;
var ispage;

/* IE/Opera fix, because they need to go learn a book on how to use indexOf with arrays */
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(elt /*, from*/) {
	var len = this.length;

	var from = Number(arguments[1]) || 0;
	from = (from < 0)
		 ? Math.ceil(from)
		 : Math.floor(from);
	if (from < 0)
	  from += len;

	for (; from < len; from++) {
	  if (from in this &&
		  this[from] === elt)
		return from;
	}
	return -1;
  };
}

/**
*
*  UTF-8 data encode / decode
*  http://www.webtoolkit.info/
*
**/

var Utf8 = {

	// public method for url encoding
	encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},

	// public method for url decoding
	decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

	while ( i < utftext.length ) {

		c = utftext.charCodeAt(i);

		if (c < 128) {
			string += String.fromCharCode(c);
			i++;
		}
		else if((c > 191) && (c < 224)) {
			c2 = utftext.charCodeAt(i+1);
			string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
			i += 2;
		}
		else {
			c2 = utftext.charCodeAt(i+1);
			c3 = utftext.charCodeAt(i+2);
			string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
			i += 3;
		}

	}

	return string;
}

}


function toggle(button, area) {
var tog=document.getElementById(area);
if(tog.style.display)    {
	tog.style.display="";
}    else {
	tog.style.display="none";
}
button.innerHTML=(tog.style.display)?'+':'&minus;';
set_cookie('nav_show_'+area, tog.style.display?'0':'1', 30);
}

function removeframes() {
var boardlinks = document.getElementsByTagName("a");
for(var i=0;i<boardlinks.length;i++) if(boardlinks[i].className == "boardlink") boardlinks[i].target = "_top";
	
	document.getElementById("removeframes").innerHTML = 'Frames removed.';
	
	return false;
}

function reloadmain() {
	if (parent.main) {
		parent.main.location.reload();
	}
}

function replaceAll( str, from, to ) {
	var idx = str.indexOf( from );
	while ( idx > -1 ) {
		str = str.replace( from, to );
		idx = str.indexOf( from );
	}
	return str;
}

function insert(text) {
	if(!ispage || quick_reply) {
		var textarea=document.forms.postform.message;
		if(textarea) {
			if(textarea.createTextRange && textarea.caretPos) { // IE 
				var caretPos=textarea.caretPos;
				caretPos.text=caretPos.text.charAt(caretPos.text.length-1)==" "?text+" ":text;
			} else if(textarea.setSelectionRange) { // Firefox 
				var start=textarea.selectionStart;
				var end=textarea.selectionEnd;
				textarea.value=textarea.value.substr(0,start)+text+textarea.value.substr(end);
				textarea.setSelectionRange(start+text.length,start+text.length);
			} else {
				textarea.value+=text+" ";
			}
			textarea.focus();

			return false;
		}
	}
	return true;
}

function quote(b, a) { 
	var v = eval("document." + a + ".message");
	v.value += (">>" + b + "\r");
	v.focus();
}

function checkhighlight() {
	var match;

	if(match=/#i([0-9]+)/.exec(document.location.toString()))
	if(!document.forms.postform.message.value)
	insert(">>" + match[1] + "\n");

	if(match=/#([0-9]+)/.exec(document.location.toString()))
	highlight(match[1]);
}

function highlight(post, checknopage) {

	if ((checknopage && ispage) || ispage) {
		// Uncomment the following line to always send the user to the thread if the link was clicked on the board page.
		//return;
	}

	var cells = document.getElementsByTagName("td");
	for(var i=0;i<cells.length;i++) if(cells[i].className == "highlight") cells[i].className = "reply";

	var reply = document.getElementById("reply" + post);
	var replytable = reply.parentNode;
	while (replytable.nodeName != 'TABLE') {
		replytable = replytable.parentNode;
	}

	if((reply || document.postform.replythread.value == post) && replytable.parentNode.className != "reflinkpreview") {
		if(reply) {
			reply.className = "highlight";
		}
		var match = /^([^#]*)/.exec(document.location.toString());
		document.location = match[1] + "#" + post;
		return false;
	}
	
	return true;
}

function get_password(name) {
	var pass = getCookie(name);
	if(pass) return pass;

	var chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	var pass='';

	for(var i=0;i<8;i++) {
		var rnd = Math.floor(Math.random()*chars.length);
		pass += chars.substring(rnd, rnd+1);
	}
	set_cookie(name, pass, 365);
	return(pass);
}

function togglePassword() {
	/* Now IE/Opera safe */
	var bSaf = (navigator.userAgent.indexOf('Safari') != -1);
	var bOpera = (navigator.userAgent.indexOf('Opera') != -1);
	var bMoz = (navigator.appName == 'Netscape');
	var passwordbox = document.getElementById("passwordbox");
	if (passwordbox) {
		var passwordbox_html;
		
		if ((bSaf) || (bOpera) || (bMoz))
			passwordbox_html = passwordbox.innerHTML;
		else passwordbox_html = passwordbox.text;
		
		passwordbox_html = passwordbox_html.toLowerCase();
		var newhtml = '<td></td><td></td>';

		if (passwordbox_html == newhtml) {
			var newhtml = '<td class="postblock">Mod</td><td><input type="text" name="modpassword" size="28" maxlength="75">&nbsp;<acronym title="Display staff status (Mod/Admin)">D</acronym>:&nbsp;<input type="checkbox" name="displaystaffstatus" checked>&nbsp;<acronym title="Lock">L</acronym>:&nbsp;<input type="checkbox" name="lockonpost">&nbsp;&nbsp;<acronym title="Sticky">S</acronym>:&nbsp;<input type="checkbox" name="stickyonpost">&nbsp;&nbsp;<acronym title="Raw HTML">RH</acronym>:&nbsp;<input type="checkbox" name="rawhtml">&nbsp;&nbsp;<acronym title="Name">N</acronym>:&nbsp;<input type="checkbox" name="usestaffname"></td>';
		}
		
		if ((bSaf) || (bOpera) || (bMoz))
			passwordbox.innerHTML = newhtml;
		else passwordbox.text = newhtml;
	}
	return false;
}

function toggleOptions(threadid, formid, board) {
	if (document.getElementById('opt' + threadid)) {
		if (document.getElementById('opt' + threadid).style.display == '') {
			document.getElementById('opt' + threadid).style.display = 'none';
			document.getElementById('opt' + threadid).innerHTML = '';
		} else {
			var newhtml = '<td class="label"><label for="formatting">Formatting:</label></td><td colspan="3"><select name="formatting"><option value="" onclick="javascript:document.getElementById(\'formattinginfo' + threadid + '\').innerHTML = \'All formatting is performed by the user.\';">Normal</option><option value="aa" onclick="javascript:document.getElementById(\'formattinginfo' + threadid + '\').innerHTML = \'[aa] and [/aa] will surround your message.\';"';
			if (getCookie('kuformatting') == 'aa') {
				newhtml += ' selected';
			}
			newhtml += '>Text Art</option></select> <input type="checkbox" name="rememberformatting"><label for="rememberformatting">Remember</label> <span id="formattinginfo' + threadid + '">';
			if (getCookie('kuformatting') == 'aa') {
				newhtml += '[aa] and [/aa] will surround your message.';
			} else {
				newhtml += 'All formatting is performed by the user.';
			}
			newhtml += '</span></td><td><input type="button" value="Preview" class="submit" onclick="javascript:postpreview(\'preview' + threadid + '\', \'' + board + '\', \'' + threadid + '\', document.' + formid + '.message.value);"></td>';
			
			document.getElementById('opt' + threadid).innerHTML = newhtml;
			document.getElementById('opt' + threadid).style.display = '';
		}
	}
}

function getCookie(name) {
	with(document.cookie) {
		var regexp=new RegExp("(^|;\\s+)"+name+"=(.*?)(;|$)");
		var hit=regexp.exec(document.cookie);
		if(hit&&hit.length>2) return Utf8.decode(unescape(replaceAll(hit[2],'+','%20')));
		else return '';
	}
}

function set_cookie(name,value,days) {
	if(days) {
		var date=new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires="; expires="+date.toGMTString();
	} else expires="";
	document.cookie=name+"="+value+expires+"; path=/";
}
function del_cookie(name) {
	document.cookie = name +'=; expires=Thu, 01-Jan-70 00:00:01 GMT; path=/';
} 

function set_stylesheet(styletitle, txt, site) {
	if (txt) {
		if (styletitle == get_default_stylesheet())
			del_cookie("kustyle_txt");
		else
			set_cookie("kustyle_txt",styletitle,365);
	} else if (site) {
		if (styletitle == get_default_stylesheet())
			del_cookie("kustyle_site");
		else
			set_cookie("kustyle_site",styletitle,365);
	} else {
		if (styletitle == get_default_stylesheet())
			del_cookie("kustyle");
		else
			set_cookie("kustyle",styletitle,365);
	}

	var links=document.getElementsByTagName("link");
	var found=false;
	for(var i=0;i<links.length;i++) {
		var rel=links[i].getAttribute("rel");
		var title=links[i].getAttribute("title");
		
		if(rel.indexOf("style")!=-1&&title) {
			links[i].disabled=true; // IE needs this to work. IE needs to die.
			if(styletitle==title) { links[i].disabled=false; found=true; }
		}
	}
	if(!found) set_preferred_stylesheet();
}

function set_preferred_stylesheet() {
	var links=document.getElementsByTagName("link");
	for(var i=0;i<links.length;i++) {
		var rel=links[i].getAttribute("rel");
		var title=links[i].getAttribute("title");
		if(rel.indexOf("style")!=-1&&title) links[i].disabled=(rel.indexOf("alt")!=-1);
	}
}

function get_active_stylesheet() {
	var links=document.getElementsByTagName("link");
	for(var i=0;i<links.length;i++) {
		var rel=links[i].getAttribute("rel");
		var title=links[i].getAttribute("title");
		if(rel.indexOf("style")!=-1&&title&&!links[i].disabled) return title;
	}
	
	return null;
}

function get_preferred_stylesheet() {
	var links=document.getElementsByTagName("link");
	for(var i=0;i<links.length;i++) {
		var rel=links[i].getAttribute("rel");
		var title=links[i].getAttribute("title");
		if(rel.indexOf("style")!=-1&&rel.indexOf("alt")==-1&&title) return title;
	}
	
	return null;
}
function get_default_stylesheet() {
	var links=document.getElementsByTagName("link");
	for(var i=0;i<links.length;i++) {
		var rel=links[i].getAttribute("rel");
		var title=links[i].getAttribute("title");
		if(rel.indexOf("style")!=-1&&title&&rel!='alternate stylesheet') return title;
	}

	return null;
}

function delandbanlinks() {
	if (!kumod_set) return;
	togglePassword();
	var bottombox = document.getElementById("fileonly");
	if (bottombox) {
		bottombox = bottombox.parentNode;
		bottombox.innerHTML = '[<input type="checkbox" name="fileonly" id="fileonly" value="on" /><label for="fileonly">File Only</label>] <input name="moddelete" onclick="return confirm(_(\'Are you sure you want to delete these posts?\'))" value="'+_('Delete')+'" type="submit" /> <input name="modban" value="'+_('Ban')+'" onclick="this.form.action=\''+ ku_cgipath + '/manage_page.php?action=bans\';" type="submit" />';
	}
	var dnbelements = document.getElementsByTagName('span');
	var dnbelement;
	var dnbinfo;
	for(var i=0;i<dnbelements.length;i++){
		dnbelement = dnbelements[i];
		if (dnbelement.getAttribute('id')) {
			if (dnbelement.getAttribute('id').substr(0, 3) == 'dnb') {
				dnbinfo = dnbelement.getAttribute('id').split('-');
				dnbelement.innerHTML = "";
				var newhtml = "";
				new Ajax.Request(ku_boardspath + "/manage_page.php?action=getip&boarddir=" + dnbinfo[1] + "&id=" + dnbinfo[2], {
					method: "get",
					onSuccess: function(ip) {
						ipaddr = ip.responseText.split("=") || "what are you doing get out you don't even fit";
						span = document.getElementById(ipaddr[0]);
						span.innerHTML = "[IP: "+ipaddr[1]+" <a href=\"" + ku_boardspath + "/manage_page.php?action=deletepostsbyip&ip="+ipaddr[1]+"\" title=\"" + _('Delete all posts by this IP') + "\">D</a> / <a href=\"" + ku_boardspath + "/manage_page.php?action=ipsearch&ip="+ipaddr[1]+"\" title=\"" + _('Search for posts with this IP') + "\">S</a>] " + span.innerHTML;
						
					},
					onFailure: function() {
						newhtml = "[what are you doing get out you don't even fit]";
						dnbelement.innerHTML = newhtml
					}
				})

				newhtml += '&#91;<a href="' + ku_cgipath + '/manage_page.php?action=delposts&boarddir=' + dnbinfo[1] + '&del';
				if (dnbinfo[3] == 'y') {
					newhtml += 'thread';
				} else {
					newhtml += 'post';
				}
				newhtml += 'id=' + dnbinfo[2] + '" title="' + _('Delete') + '" onclick="return confirm(_(\'Are you sure you want to delete this post/thread?\'));">D<\/a>&nbsp;<a href="' + ku_cgipath + '/manage_page.php?action=delposts&boarddir=' + dnbinfo[1] + '&del';
				if (dnbinfo[3] == 'y') {
					newhtml += 'thread';
				} else {
					newhtml += 'post';
				}
				newhtml += 'id=' + dnbinfo[2] + '&postid=' + dnbinfo[2] + '" title="' + _('Delete &amp; Ban') + '" onclick="return confirm(_(\'Are you sure you want to delete and ban the poster of this post/thread?\'));">&amp;<\/a>&nbsp;<a href="' + ku_cgipath + '/manage_page.php?action=bans&banboard=' + dnbinfo[1] + '&banpost=' + dnbinfo[2] + '" title="' + _('Ban') + '">B<\/a>&#93;&nbsp;&#91;<a href="' + ku_cgipath + '/manage_page.php?action=bans&banboard=' + dnbinfo[1] + '&banpost=' + dnbinfo[2] + '&instant=y" title="' +  _('Instant Permanent Ban') + '" onclick="instantban(\'' + dnbinfo[1] + '\',' + dnbinfo[2] + '); return false;">P<\/a>&#93;&nbsp;&#91;<a href="' + ku_cgipath + '/manage_page.php?action=delposts&boarddir=' + dnbinfo[1] + '&del';
				if (dnbinfo[3] == 'y') {
					newhtml += 'thread';
				} else {
					newhtml += 'post';
				}
				newhtml += 'id=' + dnbinfo[2] + '&postid=' + dnbinfo[2] + '&cp=y" title="' + _('Child Pornography') + '" onclick="return confirm(_(\'Are you sure that this is child pornography?\'));">CP<\/a>&#93;';
				
				
				dnbelements[i].innerHTML = newhtml;
			}
		}
	}
}

function instantban(boardid, postid) {

	var reason = prompt(_('Are you sure you want to permenently ban the poster of this post/thread?\nIf so enter a ban message or click OK to use the default ban reason. To cancel this operation, click "Cancel".'));
	
	if (reason !== null) {
		var url = ku_cgipath + '/manage_page.php?action=bans&banboard=' + boardid + '&banpost=' + postid + '&instant=y';
		if (reason != '') {
			url += '&reason=' + reason;
		}
		new Ajax.Request(url,{
			method: "get",
			onSuccess: function(ban) {
				var message = ban.responseText || "Ban failed!";
				if (message == "success")
					alert(_("Ban was sucessful."));
				else
					alert(_("Ban failed!"));
			},
			onFailure: function() {
				alert(_("Ban failed!"));
			}
		})
	}
	else {
		alert(_("OK, no action taken."));
	}	
}

function togglethread(threadid) {
	if (hiddenthreads.toString().indexOf(threadid)!==-1) {
		document.getElementById('unhidethread' + threadid).style.display = 'none';
		document.getElementById('thread' + threadid).style.display = 'block';
		hiddenthreads.splice(hiddenthreads.indexOf(threadid),1);
		set_cookie('hiddenthreads',hiddenthreads.join('!'),30);
	} else {
		document.getElementById('unhidethread' + threadid).style.display = 'block';
		document.getElementById('thread' + threadid).style.display = 'none';
		hiddenthreads.push(threadid);
		set_cookie('hiddenthreads',hiddenthreads.join('!'),30);
	}
	return false;
}

function toggleblotter(save) {
	var elem = document.getElementsByTagName('li');
	var arr = new Array();
	var blotterentry;
	for(i = 0,iarr = 0; i < elem.length; i++) {
		att = elem[i].getAttribute('class');
		if(att == 'blotterentry') {
			blotterentry = elem[i];
			if (blotterentry.style.display == 'none') {
				blotterentry.style.display = '';
				if (save) {
					set_cookie('ku_showblotter', '1', 365);
				}
			} else {
				blotterentry.style.display = 'none';
				if (save) {
					set_cookie('ku_showblotter', '0', 365);
				}
			}
		}
	}
}

function expandthread(threadid, board) {
}

function quickreply(threadid) {
}

function getwatchedthreads(threadid, board) {
}

function addtowatchedthreads(threadid, board) {
}

function removefromwatchedthreads(threadid, board) {
}

function hidewatchedthreads() {
}

function showwatchedthreads() {
}

// Thanks to 7chan for this
function expandimg(PN, H, F, C, G, E, A) {
    element = document.getElementById("thumb" + PN);
    var D = '<img src="' + F + '" alt="' + PN + '" class="thumb" width="' + E + '" height="' + A + '">';
    var J = '<img src="' + F + '" alt="' + PN + '" class="thumb" height="' + A + '" width="' + E + '">';
    var K = '<img src="' + F + '" alt="' + PN + '" class="thumb" height="' + A + '" width="' + E + '"/>';
    var B = "<img class=thumb height=" + A + " alt=" + PN + ' src="' + F + '" width=' + E + ">";
    if (element.innerHTML.toLowerCase() != D && element.innerHTML.toLowerCase() != B && element.innerHTML.toLowerCase() != J && element.innerHTML.toLowerCase() != K) {
        element.innerHTML = D
    } else {
        element.innerHTML = '<img src="' + H + '" alt="' + PN + '" class="thumb" height="' + G + '" width="' + C + '">'
    }
}

function postpreview(divid, board, parentid, message) {
	if (document.getElementById(divid)) {
		new Ajax.Request(ku_boardspath + '/expand.php?preview&board=' + board + '&parentid=' + parentid + '&message=' + escape(message),
		{
			method:'get',
			onSuccess: function(transport){
				var response = transport.responseText || _("something went wrong (blank response)");
				document.getElementById(divid).innerHTML = response;
			},
			onFailure: function(){ alert(_('Something went wrong...')) }
		});
	}
}

function set_inputs(id) {
	if (document.getElementById(id)) {
		with(document.getElementById(id)) {
			if(!name.value) name.value = getCookie("name");
			if(!em.value) em.value = getCookie("email");
			if(!postpassword.value) postpassword.value = get_password("postpassword");
		}
	}
}

function set_delpass(id) {
	if (document.getElementById(id).postpassword) {
		with(document.getElementById(id)) {
			if(!postpassword.value) postpassword.value = get_password("postpassword");
		}
	}
}

function delreflinkpreview(e) {
}

function addreflinkpreview(e) {
    
}

function addpreviewevents() {
}
function keypress(e) {
	if (!e) e=window.event;
	if (e.altKey) {
		var docloc = document.location.toString();
		if ((docloc.indexOf('catalog.html') == -1 && docloc.indexOf('/res/') == -1) || (docloc.indexOf('catalog.html') == -1 && e.keyCode == 80)) {
			if (e.keyCode != 18 && e.keyCode != 16) {
				if (docloc.indexOf('.html') == -1 || docloc.indexOf('board.html') != -1) {
					var page = 0;
					var docloc_trimmed = docloc.substr(0, docloc.lastIndexOf('/') + 1);
				} else {
					var page = docloc.substr((docloc.lastIndexOf('/') + 1));
					page = (+page.substr(0, page.indexOf('.html')));
					var docloc_trimmed = docloc.substr(0, docloc.lastIndexOf('/') + 1);
				}
				if (page == 0) {
					var docloc_valid = docloc_trimmed;
				} else {
					var docloc_valid  = docloc_trimmed + page + '.html';
				}
				
				if (e.keyCode == 222 || e.keyCode == 221) {
					if(match=/#s([0-9])/.exec(docloc)) {
						var relativepost = (+match[1]);
					} else {
						var relativepost = -1;
					}
					
					if (e.keyCode == 222) {
						if (relativepost == -1 || relativepost == 9) {
							var newrelativepost = 0;
						} else {
							var newrelativepost = relativepost + 1;
						}
					} else if (e.keyCode == 221) {
						if (relativepost == -1 || relativepost == 0) {
							var newrelativepost = 9;
						} else {
							var newrelativepost = relativepost - 1;
						}
					}
					
					document.location.href = docloc_valid + '#s' + newrelativepost;
				} else if (e.keyCode == 59 || e.keyCode == 219) {
					if (e.keyCode == 59) {
						page = page + 1;
					} else if (e.keyCode == 219) {
						if (page >= 1) {
							page = page - 1;
						}
					}
					
					if (page == 0) {
						document.location.href = docloc_trimmed;
					} else {
						document.location.href = docloc_trimmed + page + '.html';
					}
				} else if (e.keyCode == 80) {
					document.location.href = docloc_valid + '#postbox';
				}
			}
		}
	}
}
function updatecaptcha()
{
   var xmlhttp = new XMLHttpRequest();
   xmlhttp.open('GET', '/captcha_update.php', true);
   xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4) {
      var captcha_td = document.getElementById("simple_captcha_td");
      if(xmlhttp.status == 200) {
	 if (captcha_td !=null) {
		captcha_td.innerHTML="";
		captcha_td.innerHTML=xmlhttp.responseText;
         }
      var captcha_pic = document.getElementById("recaptcha_image");
	 if (captcha_pic !=null) {
	     captcha_pic.addEventListener("click", updatecaptcha); 
	 } 
      }
      else
      {
         captcha_td.innerHTML="Captcha update epic fail";            
         captcha_td.addEventListener("click", updatecaptcha); 
      }
   }
   };
   xmlhttp.send(null);
}
window.onload=function(e) {
    if (getCookie("kumod") == "allboards") {
        kumod_set = true
    }
    else if(getCookie("kumod") != "") {
        var listofboards = getCookie("kumod").split('|');
        var thisboard = document.getElementById("postform").board.value;
        for (var cookieboard in listofboards) {
            if (listofboards[cookieboard] == thisboard) {
                kumod_set = true;
                break
            }
        }
    }
	delandbanlinks();
	addpreviewevents();
	checkhighlight();
    document.onkeydown = keypress;
}

function contentLoaded(win, fn) {
var done = false, top = true,
doc = win.document,
root = doc.documentElement,
modern = doc.addEventListener,
add = modern ? 'addEventListener' : 'attachEvent',
rem = modern ? 'removeEventListener' : 'detachEvent',
pre = modern ? '' : 'on',
init = function(e) {
if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
(e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
if (!done && (done = true)) fn.call(win, e.type || e);
},
poll = function() {
try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
init('poll');
};
if (doc.readyState == 'complete') fn.call(win, 'lazy');
else {
if (!modern && root.doScroll) {
try { top = !win.frameElement; } catch(e) { }
if (top) poll();
}
doc[add](pre + 'DOMContentLoaded', init, false);
doc[add](pre + 'readystatechange', init, false);
win[add](pre + 'load', init, false);
}
}
contentLoaded(window, updatecaptcha);
if(style_cookie) {
	var cookie = getCookie(style_cookie);
	var title = cookie ? cookie : get_preferred_stylesheet();

	if (title != get_active_stylesheet())
		set_stylesheet(title);
}

if(style_cookie_txt) {
	var cookie=getCookie(style_cookie_txt);
	var title=cookie?cookie:get_preferred_stylesheet();

	set_stylesheet(title, true);
}

if(style_cookie_site) {
	var cookie=getCookie(style_cookie_site);
	var title=cookie?cookie:get_preferred_stylesheet();

	set_stylesheet(title, false, true);
}
