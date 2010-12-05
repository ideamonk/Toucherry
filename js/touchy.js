// @author ideamonk

var _survey_state = 0;
var _survey_uid;

function $$(foo){
    return document.querySelector(foo);
}

function getGUID(){
    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function setupDrawing(){
	var x, y, ctx, down=false;
	_survey_uid = getGUID();
	
	var canvas = document.createElement("canvas");
	canvas.id = "mycanvas";
	canvas.width = window.innerWidth-4;
	canvas.height = window.innerHeight - 70;
	var maxLength = (canvas.width > canvas.height) ? canvas.width : canvas.height;
	var imgStep2 = new Image(), imgStep3 = new Image();
    imgStep2.src="/images/step2.png";
    imgStep3.src="/images/step3.jpg";
	
	/*
		For touch based devices
	*/
	function onTouchMove(e){
		if (e.targetTouches.length == 1){
			e.preventDefault();
		    ctx.beginPath();
		    ctx.moveTo(x,y);
			ctx.lineTo(e.touches[0].pageX - canvas.offsetLeft, e.touches[0].pageY - canvas.offsetTop);
			x = e.touches[0].pageX - canvas.offsetLeft;
			y = e.touches[0].pageY - canvas.offsetTop;
			ctx.stroke();
		}
	}
	function onTouchEnd(e){
		if (e.targetTouches.length==1){
			e.preventDefault();
			window.removeEventListener("touchmove", onTouchMove, false);
			window.removeEventListener("touchend", onTouchEnd, false);
		}
	}
	function onTouchStart(e){
		if (e.touches.length == 1){	
			e.preventDefault();
			x = e.touches[0].pageX - canvas.offsetLeft;
			y = e.touches[0].pageY - canvas.offsetTop;
			window.addEventListener("touchmove", onTouchMove, false);
			window.addEventListener("touchend", onTouchEnd, false);
		}
	}
	function dropEvent(e)
    {
    	e.stopPropagation();
    	e.preventDefault();
    }
	
	/*
		For non-touch devices
	*/
	function onMouseDown(e){
		down=true;
		x = e.pageX - canvas.offsetLeft;
		y = e.pageY - canvas.offsetTop;
		ctx.beginPath();
		ctx.moveTo(x,y);
	}
	function onMouseUp(e){
		down=false;
	}
	function onMouseMove(e){
		if (down){
			x = e.pageX - canvas.offsetLeft;
			y = e.pageY - canvas.offsetTop;
			ctx.lineTo(x,y);
			ctx.stroke();
		}
	}
	
	// orientation handler
	function onOrientationChange(e){
	    var prevImageData = ctx.getImageData(0, 0, maxLength, maxLength);
	    canvas.width = window.innerWidth-4;
	    //canvas.height = window.innerHeight - 70;
	    ctx.putImageData(prevImageData, 0, 0);
	}
	
	
	/*
	    UI control handlers
	*/
	
	function onClearClick(e){
	    ctx.clearRect(0, 0, canvas.width, canvas.height);
	    if (_survey_state == 2){
	        ctx.drawImage(imgStep2,40,40);
	    } else if (_survey_state == 3){
	        ctx.drawImage(imgStep3,0,0);
	    }
	}
	
	function onNextClick(e){
	    switch (_survey_state){
	        case 0:
	            $("#butNext").html("next");
	            $("#titlebar").html("Step 1/4 - Try drawing a circle");
	            $("#butClear").show();
	            $("#welcome").hide();
	            $$("#canvasholder").appendChild(canvas);
	            _survey_state++;
	            break;
	        case 1:
	            // submit to the backend, along with GUID of survery, proceed
	            $("#loader").fadeIn(200);
	            $.post('/',
                    {
                        uid  : _survey_uid,
                        step : _survey_state,
                        img  : canvas.toDataURL('image/jpeg'),
                        text : ""
                    },
                    function(data) {
                        $("#loader").fadeOut(200);
                        $("#titlebar").html("Step 2/4 - Trace this pentagon");
                        _survey_state++;
                        onClearClick();
                    }
                );
	            break;
	        case 2:
	            $("#loader").fadeIn(200);
	            $.post('/',
                    {
                        uid  : _survey_uid,
                        step : _survey_state,
                        img  : canvas.toDataURL('image/jpeg'),
                        text : ""
                    },
                    function(data) {
                        $("#loader").fadeOut(200);
                        $("#titlebar").html("Step 3/4 - Trace the green park");
                        _survey_state++;
                        onClearClick();
                    }
                );
	            break;
	        case 3:
	            $("#loader").fadeIn(200);
	            $.post('/',
                    {
                        uid  : _survey_uid,
                        step : _survey_state,
                        img  : canvas.toDataURL('image/jpeg'),
                        text : ""
                    },
                    function(data) {
                        _survey_state++;
                        $("#loader").fadeOut(200);
                        $("#titlebar").html("Step 4/4 - Toughest to trace?");
                        $("#tabbar").hide(500);
                        $("#mycanvas").hide(500);
                        $("#form").show("slow");
                    }
                );
	            break;
	    }
	}
	
	function onButCircle(e){
	    $("#loader").fadeIn(200);
	    $.post('/',
            {
                uid  : _survey_uid,
                step : _survey_state,
                img  : "",
                text : "Drawing Circle"
            },
            onDone
        );
	}
	
	function onButPenta(e){
	    $("#loader").fadeIn(200);
	    $.post('/',
            {
                uid  : _survey_uid,
                step : _survey_state,
                img  : "",
                text : "Tracing Pentagon"
            },
            onDone
        );	    
	}
	
	function onButMap(e){
	    $("#loader").fadeIn(200);
	    $.post('/',
            {
                uid  : _survey_uid,
                step : _survey_state,
                img  : "",
                text : "Tracing Map"
            },
            onDone
        );
	}
	
	function onDone(){
	    // everything done :)
	    $("#titlebar").html("Thanks!");
	    $("#loader").fadeOut(200);
	    $("#form").fadeOut(200, function(){$("#thanks").fadeIn(200);});
	}
	
	/*
	    if __name__ == '__main__':
	*/
	
	if (canvas.getContext){
		ctx = canvas.getContext("2d");
		ctx.strokeStyle = "#000000";
		
		// for touch
		canvas.addEventListener("touchstart", onTouchStart, false);
		
		// for others
		canvas.addEventListener("mousedown", onMouseDown, false);
		canvas.addEventListener("mouseup", onMouseUp, false);
		canvas.addEventListener("mousemove", onMouseMove, false);
		
		// experimental
		document.addEventListener("dragenter", dropEvent, false);
		document.addEventListener("dragover", dropEvent, false);
		document.addEventListener("drop", dropEvent, false);
		
		// ui bindings
		$$("#butClear").addEventListener("click", onClearClick, false);
		$$("#butNext").addEventListener("click", onNextClick, false);
		$$("#butCircle").addEventListener("click", onButCircle, false);
		$$("#butPenta").addEventListener("click", onButPenta, false);
		$$("#butMap").addEventListener("click", onButMap, false);
	} else {
		alert("canvas context unsupported");
	}
	
	// window handling listeners
	window.addEventListener("orientationchange", onOrientationChange, false);
}
