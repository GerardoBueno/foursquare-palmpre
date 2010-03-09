function FlickrUploadAssistant(ps,vid,vn) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   this.prevScene=ps;
	   this.fileName="";
	   this.vid=vid;
	   this.venueName=vn;
}

FlickrUploadAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		zBar.hideToolbar();
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	this.controller.setupWidget('photo-title', this.titleattributes = {hintText:''}, this.titleModel = {value:'', disabled:false});
	this.controller.setupWidget('photo-description', this.descriptattributes = {hintText:'',multiline:true}, this.descriptionModel = {value:'', disabled:false});
	this.controller.setupWidget('photo-tags', this.tagsattributes = {hintText:''}, this.tagsModel = {value:'', disabled:false});
	this.controller.setupWidget('uploadButton', this.accattributes = {type:Mojo.Widget.activityButton}, this.uploadBtnModel = {label:'Upload', disabled:false});
    this.controller.setupWidget("uploadProgress",
         this.progattributes = {
             title: 'Uploading...',
             modelProperty: "progress"
         },
         this.progModel = {
             progress: 0
         });
	/* add event handlers to listen to events from widgets */
		Mojo.Event.listen(this.controller.get("uploadButton"),Mojo.Event.tap, this.doUpload.bind(this));
      this.controller.setupWidget("photohostList",
        this.phAttributes = {
            choices: [
                {label: "Flickr", value: "flickr"},
               /* {label: "TweetPhoto", value: "tweetphoto"},*/ //tweetphoto forces a checkin on upload... not good
                {label: "Pikchur", value: "pikchur"},
                {label: "FSPic", value: "fspic"}

            ]},
        this.phModel = {
            value: "flickr",
            disabled: false
        }
    ); 

	 this.controller.get("uploadProgress").hide();
Mojo.FilePicker.pickFile({'actionName':'Upload','kinds':['image'],'defaultKind':'image','onSelect':function(fn){this.controller.get("img_preview").update('<img src="'+fn.fullPath+'" width="100"/>');this.fileName=fn.fullPath;}.bind(this)},this.controller.stageController);

}

FlickrUploadAssistant.prototype.doUpload = function(event) {
	this.controller.get("uploadButton").mojo.activate();
	//this.progattributes.title="Uploading...";

	//params we need:
	//title,description,tags,format,nojsoncallback,api_key,auth_token,api_sig,photo
	
	
	
	switch(this.phModel.value){
		case "flickr":
			this.flickrUpload();
			break;
		case "tweetphoto":
			this.tweetphotoUpload();
			break;
		case "pikchur":
			this.pikchurUpload();	
			break;
		case "fspic":
			this.fspicUpload();		
			break;
	}
	
	
	
	 
}

FlickrUploadAssistant.prototype.fspicUpload = function() {
					var eauth=_globals.auth.replace("Basic ","");
					var plaintext=Base64.decode(eauth);
					var creds=plaintext.split(":");
					var un=creds[0];
					var pw=creds[1];

					var params=[];
					params.push({"key":"api_key","data":"q9hpcah58aaqtd7pp40orr21rga1wi","contentType":"text/plain"});
					params.push({"key":"vid","data":this.vid,"contentType":"text/plain"});
					params.push({"key":"phone_or_email","data":un,"contentType":"text/plain"});
					params.push({"key":"password","data":pw,"contentType":"text/plain"});

					var controller = Mojo.Controller.stageController.activeScene();
			        // Queue the upload request with the download manager service.
			        controller.serviceRequest('palm://com.palm.downloadmanager/', {
            			method: 'upload',
			            parameters: {
            			    'url': "http://fspic.com/api/uploadPhoto",
			                'fileLabel': 'photo',
            			    'fileName': this.fileName,
			                'postParameters': params,
            			    'subscribe': true
			            },
            			onSuccess: function (resp,j){
						 	if(resp.responseString){
							 	Mojo.Log.error('Success : ' + Object.toJSON(resp));
							 	this.controller.get("uploadButton").mojo.deactivate();
							 	this.controller.stageController.popScene("flickr-upload");
							}
					  	}.bind(this),
			            onFailure: function (resp){
						 	Mojo.Log.error('Fail : ' + Object.toJSON(resp));
						 	this.controller.get("uploadButton").mojo.deactivate();
						 	this.controller.stageController.popScene("flickr-upload");
					 	}.bind(this)
			        });


}


FlickrUploadAssistant.prototype.pikchurUpload = function() {
					var eauth=_globals.auth.replace("Basic ","");
					var plaintext=Base64.decode(eauth);//Njk1
					var creds=plaintext.split(":");
					var un=creds[0];
					var pw=creds[1];
					var params=[];
					params.push({"key":"api_key","data":"QTG1n51CVNEJNDkkiMQIXQ","contentType":"text/plain"});
					params.push({"key":"encodedAuth","data":eauth,"contentType":"text/plain"});
					params.push({"key":"message","data":this.descriptionModel.value,"contentType":"text/plain"});
					params.push({"key":"geolat","data":_globals.lat,"contentType":"text/plain"});
					params.push({"key":"geolon","data":_globals.long,"contentType":"text/plain"});
					params.push({"key":"service","data":"foursquare","contentType":"text/plain"});
					params.push({"key":"source","data":"Njk1","contentType":"text/plain"});
					params.push({"key":"venue_id","data":this.vid,"contentType":"text/plain"});
					Mojo.Log.error("params="+Object.toJSON(params));
				
					var controller = Mojo.Controller.stageController.activeScene();
			        // Queue the upload request with the download manager service.
			        controller.serviceRequest('palm://com.palm.downloadmanager/', {
            			method: 'upload',
			            parameters: {
            			    'url': "http://api.pikchur.com/geosocial/upload/json",
			                'fileLabel': 'media',
            			    'fileName': this.fileName,
			                'postParameters': params,
            			    'subscribe': true
			            },
            			onSuccess: function (resp,j){
						 	if(resp.responseString){
							 	Mojo.Log.error('Success : ' + Object.toJSON(resp));
							 	this.controller.get("uploadButton").mojo.deactivate();
							 	this.controller.stageController.popScene("flickr-upload");
							}
					  	}.bind(this),
			            onFailure: function (resp){
						 	Mojo.Log.error('Fail : ' + Object.toJSON(resp));
						 	this.controller.get("uploadButton").mojo.deactivate();
						 	this.controller.stageController.popScene("flickr-upload");
					 	}.bind(this)
			        });


}


FlickrUploadAssistant.prototype.tweetphotoUpload = function() {
					var eauth=_globals.auth.replace("Basic ","");
					var plaintext=Base64.decode(eauth);
					var creds=plaintext.split(":");
					var un=creds[0];
					var pw=creds[1];

					var params=[];
					params.push({"key":"api_key","data":"78c45db0-e4eb-467c-9215-695072bcf85a","contentType":"text/plain"});
					params.push({"key":"tpservice","data":"Foursquare","contentType":"text/plain"});
					params.push({"key":"message","data":this.descriptionModel.value,"contentType":"text/plain"});
					params.push({"key":"tags","data":this.tagsModel.value,"contentType":"text/plain"});
					params.push({"key":"latitude","data":_globals.lat,"contentType":"text/plain"});
					params.push({"key":"longitude","data":_globals.long,"contentType":"text/plain"});
					params.push({"key":"response_format","data":"JSON","contentType":"text/plain"});
					params.push({"key":"username","data":un,"contentType":"text/plain"});
					params.push({"key":"password","data":pw,"contentType":"text/plain"});
					params.push({"key":"vid","data":this.vid,"contentType":"text/plain"});

					var controller = Mojo.Controller.stageController.activeScene();
			        // Queue the upload request with the download manager service.
			        controller.serviceRequest('palm://com.palm.downloadmanager/', {
            			method: 'upload',
			            parameters: {
            			    'url': "http://tweetphotoapi.com/api/upload.aspx",
			                'fileLabel': 'media',
            			    'fileName': this.fileName,
			                'postParameters': params,
            			    'subscribe': true
			            },
            			onSuccess: function (resp,j){
						 	if(resp.responseString){
							 	Mojo.Log.error('Success : ' + Object.toJSON(resp));
							 	this.controller.get("uploadButton").mojo.deactivate();
							 	this.controller.stageController.popScene("flickr-upload");
							}
					  	}.bind(this),
			            onFailure: function (resp){
						 	Mojo.Log.error('Fail : ' + Object.toJSON(resp));
						 	this.controller.get("uploadButton").mojo.deactivate();
						 	this.controller.stageController.popScene("flickr-upload");
					 	}.bind(this)
			        });


}


FlickrUploadAssistant.prototype.flickrUpload = function() {
	var ptitle=this.titleModel.value;
	var pdesc=this.descriptionModel.value;
	var ptags=this.tagsModel.value + " foursquare:venue="+this.vid;
	var format="json";
	var nojsoncallback="1";
	var api_key=_globals.flickr_key;
	var auth_token=_globals.flickr_token;
	var presig=_globals.flickr_secret+"api_key"+api_key+"auth_token"+auth_token+"description"+pdesc+"format"+format+"nojsoncallback"+nojsoncallback+"tags"+ptags+"title"+ptitle;
	var api_sig=hex_md5(presig);
	
	var params={
		"title":ptitle,
		"description":pdesc,
		"tags":this.venueName+","+ptags
	};
	//added the venue's name as a tag to fix a bug with flickr where
	//machine tags won't work unless at least 1 normal tag is added also
	
	
	Mojo.Log.error("##set up params");
	
	var params=[];
	params.push({"key":"api_key","data":api_key,"contentType":"text/plain"});
	params.push({"key":"auth_token","data":auth_token,"contentType":"text/plain"});
	params.push({"key":"api_sig","data":api_sig,"contentType":"text/plain"});
	params.push({"key":"description","data":pdesc,"contentType":"text/plain"});
	params.push({"key":"format","data":format,"contentType":"text/plain"});
	params.push({"key":"nojsoncallback","data":nojsoncallback,"contentType":"text/plain"});
	params.push({"key":"tags","data":ptags,"contentType":"text/plain"});
	params.push({"key":"title","data":ptitle,"contentType":"text/plain"});
	
	Mojo.Log.error("##created params array");
	

	 var controller = Mojo.Controller.stageController.activeScene();
        // Queue the upload request with the download manager service.
        controller.serviceRequest('palm://com.palm.downloadmanager/', {
            method: 'upload',
            parameters: {
                'url': "http://api.flickr.com/services/upload/",
                'fileLabel': 'photo',
                'fileName': this.fileName,
                'postParameters': params,
                'subscribe': true
            },
            onSuccess: function (resp){
						 	if(resp.responseString){
							 	Mojo.Log.error('Success : ' + Object.toJSON(resp));
							 	this.controller.get("uploadButton").mojo.deactivate();
							 	this.controller.stageController.popScene("flickr-upload");
							}
	  	}.bind(this),
            onFailure: function (e){
	  				Mojo.Log.error('Failure : ' + Object.toJSON(resp));
			 	this.controller.stageController.popScene("flickr-upload");
	  				
	 	}.bind(this)
        });

}

FlickrUploadAssistant.prototype.escape_and_sign= function(params, post) {
	//from: http://github.com/lmorchard/flickr-uploadr-webos/blob/master/src/javascripts/FlickrUploadr/API.js
	params.api_key = _globals.flickr_key;
	var sig = [];
	var esc_params = {api_key: '', api_sig: ''};
	for (var p in params) {
		if ('object' === typeof params[p]) {
			esc_params[p] = params[p];
		} else {
			sig.push(p);
			esc_params[p] = this.escape_utf8('' + params[p], !post).replace(/(^\s+|\s+$)/g, '');
		}
	}
	sig.sort();
	var calc = [];
	var ii = sig.length;
	for (var i = 0; i < ii; ++i) {
		calc.push(sig[i] + (post ? esc_params[sig[i]] : this.escape_utf8('' +params[sig[i]], false)));
    }
 
    var clear = _globals.flickr_secret + calc.join('');
    esc_params.api_sig = hex_md5(clear);
	return esc_params;
}

FlickrUploadAssistant.prototype.escape_utf8= function(data, url) {
	//from: http://github.com/lmorchard/flickr-uploadr-webos/blob/master/src/javascripts/FlickrUploadr/API.js
        if (null === url) {
            url = false;
        }
        if ('' === data || null === data || undefined === data) {
            return '';
        }
            
        var chars = '0123456789abcdef';
        data = data.toString();
        var buffer = [];
        var ii = data.length;
        for (var i = 0; i < ii; ++i) {
            var c = data.charCodeAt(i);
            var bs = [];
            if (c > 0x10000) {
                bs[0] = 0xf0 | ((c & 0x1c0000) >>> 18);
                bs[1] = 0x80 | ((c & 0x3f000) >>> 12);
                bs[2] = 0x80 | ((c & 0xfc0) >>> 6);
                bs[3] = 0x80 | (c & 0x3f);
            } else if (c > 0x800) {
                bs[0] = 0xe0 | ((c & 0xf000) >>> 12);
                bs[1] = 0x80 | ((c & 0xfc0) >>> 6);
                bs[2] = 0x80 | (c & 0x3f);
            } else if (c > 0x80) {
                bs[0] = 0xc0 | ((c & 0x7c0) >>> 6);
                bs[1] = 0x80 | (c & 0x3f);
            } else {
                bs[0] = c;
            }
            var j = 0, jj = bs.length;
            if (1 < jj) {
                if (url) {
                    for (j = 0; j < jj; ++j) {
                        var b = bs[j];
                        buffer.push('%' + chars.charAt((b & 0xf0) >>> 4) +
                            chars.charAt(b & 0x0f));
                    }
                } else {
                    for (j = 0; j < jj; ++j) {
                        buffer.push(String.fromCharCode(bs[j]));
                    }
                }
            } else {
                if (url) {
                    buffer.push(encodeURIComponent(String.fromCharCode(bs[0])));
                } else {
                    buffer.push(String.fromCharCode(bs[0]));
                }
            }
        }
        return buffer.join('');
}
    
    
FlickrUploadAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */

}


FlickrUploadAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

FlickrUploadAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	   zBar.showToolbar();
}
