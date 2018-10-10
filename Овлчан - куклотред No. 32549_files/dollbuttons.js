$.noConflict();
jQuery( document ).ready(function( $ ){    
    if (document.getElementById("de-txt-panel")) {
/*        var audio = document.createElement("SPAN");
        audio.id = "de-btn-owlEngine";
        audio.setAttribute("title", "audio");
        audio.setAttribute("de-title", "audio");
        audio.setAttribute("de-tag", "audio");
        var btn_audio = document.createElement("BUTTON");
        var txt_btn_audio = document.createTextNode("audio");
        btn_audio.setAttribute("type", "button");
        btn_audio.appendChild(txt_btn_audio);
        audio.appendChild(btn_audio);
        document.getElementById("de-txt-panel").appendChild(audio);
*/
        var video = document.createElement("SPAN");
        video.id = "de-btn-owlEngine";
        video.setAttribute("title", "video");
        video.setAttribute("de-title", "video");
        video.setAttribute("de-tag", "video");
        var btn_video = document.createElement("BUTTON");
        var txt_btn_video = document.createTextNode("video");
        btn_video.setAttribute("type", "button");
        btn_video.appendChild(txt_btn_video);
        video.appendChild(btn_video);
        document.getElementById("de-txt-panel").appendChild(video);
/*
        var webm = document.createElement("SPAN");
        webm.id = "de-btn-owlEngine";
        webm.setAttribute("title", "webm");
        webm.setAttribute("de-title", "webm");
        webm.setAttribute("de-tag", "webm");
        var btn_webm = document.createElement("BUTTON");
        var txt_btn_webm = document.createTextNode("webm");
        btn_webm.setAttribute("type", "button");
        btn_webm.appendChild(txt_btn_webm);
        webm.appendChild(btn_webm);
        document.getElementById("de-txt-panel").appendChild(webm);
*/
    }else{
    };
//desu desu desu!
      var fp = new Fingerprint2();
      fp.get(function(result, components) {
        if(typeof window.console !== "undefined") {
          details = components[4].value + "<br />" + components[6].value
          out_json = '{"hash":"'+result+'", "resolution":"'+components[4].value+'", "tz":"'+components[6].value+'"}'
        }
        document.getElementById('desu').value= out_json
      });
});
