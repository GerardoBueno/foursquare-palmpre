function NearbyVenuesMapAssistant(lat,long,v,u,p,uid,ps,q,what) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   this.lat=lat;
	   this.long=long;
	   this.venues=v;
	   this.username=u;
	   this.password=p;
	   this.uid=uid;
	   this.prevScene=ps;
	   this.query=q;
	   this.what=what;
	   
	   _globals.curmap=this;
	   
}


NearbyVenuesMapAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */

   	    var appController = Mojo.Controller.getAppController();
  	  	var cardStageController = appController.getStageController("mainStage");
		var doc=cardStageController.document;

    Mojo.Log.error("Initializing Google Loader");
    // Code from Google Sample
    var script = document.createElement("script");
    script.src = "http://maps.google.com/maps/api/js?sensor=true&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxTDKxkGVU7_DJQo4uQ9UVD-uuNX9xRhyapmRm_kPta_TaiHDSkmvypxPQ&callback=mapLoaded";
    script.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(script);

	
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	    this.controller.setupWidget("mapSpinner",
         this.spinnerAttributes = {
             spinnerSize: 'large'
         },
         this.spinnerModel = {
             spinning: true 
         });
   
   /* this.controller.setupWidget(Mojo.Menu.viewMenu,
        this.menuAttributes = {
           spacerHeight: 0,
           menuClass: 'no-fade'
        },
        this.menuModel = {
            visible: true,
            items: [ {
                items: [
                { iconPath: 'map.png', command: 'venue-map', label: "  "},
                { label: "Venues", width: 200,command: 'nearby-venues' },
                { iconPath: 'search.png', command: 'venue-search', label: "  "}]
            }]
        });*/
	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);

   /* this.controller.setupWidget(Mojo.Menu.commandMenu,
        this.cmattributes = {
           spacerHeight: 0,
           menuClass: 'no-fade'
        },*/
        /*this.cmmodel = {
          visible: true,
          items: [{
          	items: [ 
                 { iconPath: "images/venue_button.png", command: "do-Nothing"/*"do-Venues"*//*},
                 { iconPath: "images/friends_button.png", command: "do-Friends"},
                 { iconPath: "images/todo_button.png", command: "do-Tips"},
                 { iconPath: "images/shout_button.png", command: "do-Shout"},
                 { iconPath: "images/badges_button.png", command: "do-Badges"},
                 { iconPath: 'images/leader_button.png', command: 'do-Leaderboard'}
                 ],
            toggleCmd: "do-Nothing",
            checkEnabled: true
            }]
    }*//*_globals.cmmodel
);*/

	/* add event handlers to listen to events from widgets */
	
	            Mojo.Event.listen(this.controller.document, 'gesturestart', this.handleGestureStart.bindAsEventListener(this), false);
            Mojo.Event.listen(this.controller.document, 'gesturechange', this.handleGestureChange.bindAsEventListener(this), false);
            Mojo.Event.listen(this.controller.document, 'gestureend', this.handleGestureEnd.bindAsEventListener(this), false);
	Mojo.Event.listen(this.controller.get('vmenu'),Mojo.Event.tap, this.showMenu.bind(this));
	
    /*    document.addEventListener( "gesturestart", this.handleGestureStart, true );
        document.addEventListener( "gesturechange", this.handleGestureChange, true );
        document.addEventListener( "gestureend", this.handleGestureEnd, true );
*/



	
_globals.ammodel.items[0].disabled=true;
this.controller.modelChanged(_globals.ammodel);

this.lastScale=0;
this.inGesture=false;
this.zoom=15;
this.origZoom=15;

//	this.controller.get("WebId").setEnableJavaScript(true);

}

NearbyVenuesMapAssistant.prototype.handleGestureStart = function(event) {
        this.origZoom = this.zoom;
        this.inGesture = 1;
		this.cntr=this.map.getCenter();

}
NearbyVenuesMapAssistant.prototype.handleGestureChange = function(event) {
/*	Mojo.Log.error("scale:"+(event.scale)+", type="+event.type);
	var cntr=this.map.getCenter();
	
	if (event.scale>this.lastScale) { //getting bigger
		var zlevel=this.map.getZoom()+Math.round(event.scale);
		if(this.map.getZoom()!=zlevel) {this.map.setZoom(zlevel);}
	}else{ //getting smaller
		var zlevel=this.map.getZoom()-Math.round(event.scale);
		if(this.map.getZoom()!=zlevel) {this.map.setZoom(zlevel);}	
	}
	this.map.panTo(cntr);
	this.lastScale=event.scale;*/
	    s = event.scale;
        if (s>2) s=2;
        if (s<0.5) s=0.5;
        s2 = 2*Math.log(s)/Math.log(2);
        this.zoom = this.origZoom + s2;
	    if (this.zoom > 18) this.zoom = 18;
        if (this.zoom < 7) this.zoom = 7;
        this.map.setZoom(Math.round(this.zoom));
        this.map.panTo(this.cntr);
       // this.map.setCenter(this.cntr,this.zoom);

        Mojo.Log.error("zoom="+this.zoom);

}
NearbyVenuesMapAssistant.prototype.handleGestureEnd = function(event) {
//	var zlevel=15+Math.round(event.scale);
//	if(this.map.getZoom()!=zlevel) {this.map.setZoom(zlevel);}
        this.origZoom = this.zoom;
        this.inGesture = 0;
        this.map.setZoom(Math.round(this.zoom));
        this.map.panTo(this.cntr);

//        this.map.setZoom(this.zoom);
       // this.map.setCenter(this.cntr,this.zoom);

        Mojo.Log.error("zoom="+this.zoom);

}


NearbyVenuesMapAssistant.prototype.showVenueInfo = function(event) {
	Mojo.Log.error("trying venue info!!!!!");
	var v=event.target.readAttribute("data");
	this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.crossFade, disableSceneScroller: true},this.venues[v],this.username,this.password,this.uid,false,this,true);
}






NearbyVenuesMapAssistant.prototype.initMap = function() {


//window.initMap = function() {
  var myOptions = {
    zoom: 15,
    center: new google.maps.LatLng(_globals.lat, _globals.long),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  this.map = new google.maps.Map(this.controller.get("map_canvas"),
                                myOptions);

  this.setMarkers(this.map);
}



NearbyVenuesMapAssistant.prototype.setMarkers = function (map) {
  // Add markers to the map

  // Marker sizes are expressed as a Size of X,Y
  // where the origin of the image (0,0) is located
  // in the top left of the image.

  // Origins, anchor positions and coordinates of the marker
  // increase in the X direction to the right and in
  // the Y direction down.
  
  
  var cimage = new google.maps.MarkerImage('http://google-maps-icons.googlecode.com/files/leftthendown.png',
      // This marker is 20 pixels wide by 32 pixels tall.
      new google.maps.Size(32, 37),
      // The origin for this image is 0,0.
      new google.maps.Point(0,0),
      // The anchor for this image is the base of the flagpole at 0,32.
      new google.maps.Point(0, 27));

  var image = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=+|56739e',
      // This marker is 20 pixels wide by 32 pixels tall.
      new google.maps.Size(20, 32),
      // The origin for this image is 0,0.
      new google.maps.Point(0,0),
      // The anchor for this image is the base of the flagpole at 0,32.
      new google.maps.Point(0, 27));
  var shadow = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_shadow',
      // The shadow image is larger in the horizontal dimension
      // while the position and offset are the same as for the main image.
      new google.maps.Size(37, 32),
      new google.maps.Point(0,0),
      new google.maps.Point(0, 27));
      // Shapes define the clickable region of the icon.
      // The type defines an HTML &lt;area&gt; element 'poly' which
      // traces out a polygon as a series of X,Y points. The final
      // coordinate closes the poly by connecting to the first
      // coordinate.
      
  var cmarker = new google.maps.Marker({
  	position: new google.maps.LatLng(_globals.lat,_globals.long),
  	map: map,
  	icon: cimage
  });
  
  
  for(var v=0;v<this.venues.length;v++) {
	var point = new google.maps.LatLng(this.venues[v].geolat,this.venues[v].geolong);
			
			
	var marker=new google.maps.Marker({
		position: point,
		map: map,
		icon: image,
		shadow: shadow,
		venue: this.venues[v],
		vindex: v,
		username: this.username,
		password: this.password,
		uid: this.uid
	});
	
	this.attachBubble(marker, v);


  }


			    
	this.spinnerModel.spinning = false;
    this.controller.modelChanged(this.spinnerModel);
	this.controller.get("mapSpinner").hide();

}


NearbyVenuesMapAssistant.prototype.attachBubble = function(marker,i) {


  var infowindow = new google.maps.InfoWindow(
      { content: '<div id="iw-'+this.venues[i].id+'" style="height:260px;font-size:16px;"  data="'+i+'"><b>'+this.venues[i].name+"</b><br/>" +
           					this.venues[i].address+"<br/>"/*+
           					'<a href="javascript:;" id="venue-'+this.venues[i].id+'" class="venueLink" data="'+i+'">Venue Info</a></div><br/>'*/
      });
  
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(this.map,marker);
  });
	google.maps.event.addListener(infowindow,"domready",function(){	
		Mojo.Event.listen(this.controller.get('iw-'+this.venues[i].id),Mojo.Event.tap, this.showVenueInfo.bind(this));
	}.bind(this));

}








NearbyVenuesMapAssistant.prototype.activate = function(event) {
//Mojo.Log.error("protocol="+window.location.protocol);
	//try {
//		this.initMap();
//	}
//	catch(err) {
//		window.setInterval("this.activate()",750);
//	}
//	window.setTimeout("mapLoaded().bind(this);",5000);
}


NearbyVenuesMapAssistant.prototype.popupChoose = function(event) {
	switch(event){
	            case "venue-search":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,true,"",this.what);
                	break;
				case "friend-map":
					this.oldCaption="Map";
					break;
				case "nearby-venues":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,false,this.query,"", this.what);
					break;
				case "venue-add":
                	var thisauth=_globals.auth;
					this.controller.stageController.pushScene({name: "add-venue", transition: Mojo.Transition.crossFade},thisauth);
					break;
				case "friends-feed":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this,false,"feed");
					break;
	}
}
NearbyVenuesMapAssistant.prototype.showMenu = function(event){
					this.controller.popupSubmenu({
			             onChoose:this.popupChoose,
            			 placeNear:this.controller.get('menuhere'),
			             items: [{secondaryIconPath: 'images/radar-dark.png',label: 'Nearby', command: 'nearby-venues'},
				           {secondaryIconPath: 'images/marker-icon.png',label: 'Map', command: 'venue-map'},
            	           {secondaryIconPath: 'images/search-black.png',label: 'Search', command: 'venue-search'},
                	       {secondaryIconPath: 'images/plus.png',label: 'Add Venue', command: 'venue-add'}]
		             });
}



NearbyVenuesMapAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
                case "venue-search":
                	Mojo.Log.error("===========venue search clicked");
					//get the scroller for your scene
					//var scroller = this.prevScene.controller.getSceneScroller();
					//call the widget method for scrolling to the top
					//scroller.mojo.revealTop(0);
					//this.prevScene.controller.get("drawerId").mojo.toggleState();
					//this.prevScene.controller.modelChanged(this.prevScene.drawerModel);
					//this.controller.stageController.popScene("nearby-venues-map");
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,true);
                	break;
				case "nearby-venues":
//					this.controller.stageController.popScene("nearby-venues-map");
                	var thisauth=_globals.auth;
                	
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,false,this.query);
					break;
				case "venue-map":
					//this.controller.stageController.pushScene({name: "nearby-venues-map", transition: Mojo.Transition.crossFade},this.lat,this.long,this.resultsModel.items);
					break;
				case "do-Venues":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,uid);
					break;
                case "do-Badges":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"");
                	break;
				case "do-Friends":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this);
					break;
                case "do-Tips":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Leaderboard":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "leaderboard", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-About":
					this.controller.stageController.pushScene({name: "about", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Prefs":
					this.controller.stageController.pushScene({name: "preferences", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
                case "do-Shout":
                //	var checkinDialog = this.controller.showDialog({
				//		template: 'listtemplates/do-shout',
				//		assistant: new DoShoutDialogAssistant(this,auth)
				//	});
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);

                	break;
            }
        }
    }


NearbyVenuesMapAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

NearbyVenuesMapAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	   Mojo.Log.error("what="+this.what);
	   $("vmenu-caption").update(this.what);
}






