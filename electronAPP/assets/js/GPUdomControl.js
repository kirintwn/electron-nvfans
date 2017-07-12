var GPU  = function (index) {
    this.index = index;
    this.gpuContentID = 'gpuContent' + index.toString();
    this.iconID       = 'icon' + index.toString();
    this.GPUnameID    = 'GPUname' + index.toString();
    this.svgID        = 'svg' + index.toString();
    this.svgOuterID   = 'svgOuter' + index.toString();
    this.tempID       = 'temp' + index.toString();
    this.fanSpeedID   = 'fanSpeed' + index.toString();
    this.checkboxID   = 'checkbox' + index.toString();

    this.currentTemp  = 0;
    this.currentFanSpeed = 0;
    this.lastTemp  = 0;
    this.lastFanSpeed = 0;

    $(".subPartRight")
        .append('<div class="gpuContent" id="gpuContent' + index.toString() + '"></div>');

    $("#gpuContent"+index.toString())
        .append('<div class="icon" id="icon' + index.toString()+ '"></div>');

    $("#icon"+index.toString())
        .append('<div class = "GPUname" id = "GPUname' + index.toString() + '"></div>');
    $("#icon"+index.toString())
        .append('<svg class="svg" id="svg' + index.toString()+ '"></svg>');
    $("#icon"+index.toString())
        .append('<svg class="svgOuter" id="svgOuter' + index.toString()+ '"></svg>');


    $("#gpuContent"+index.toString())
        .append('<div class="temp" id="temp' + index.toString()+ '"></div>');
    $("#gpuContent"+index.toString())
        .append('<div class="fanSpeed" id="fanSpeed' + index.toString()+ '"></div>');
    $("#gpuContent"+index.toString())
        .append('<input class="checkbox" type="checkbox" value="checked" id="checkbox' + index.toString()+ '">');

    this.updateInfo();
}
GPU.prototype.runInner = function() {
    var canvasSize = 95,
        centre = canvasSize/2,
        radius = canvasSize*0.8/2,
        s = Snap("#"+this.svgID),
        path = "",
        arc = s.path(path),
        startY = centre-radius;

    s.clear();
    var endpoint = this.currentTemp/100*360;
    var startpoint = this.lastTemp/100*360;
    Snap.animate(startpoint, endpoint,   function (val) {
        arc.remove();

        var d = val,
            dr = d-90;
            radians = Math.PI*(dr)/180,
            endx = centre + radius*Math.cos(radians),
            endy = centre + radius * Math.sin(radians),
            largeArc = d>180 ? 1 : 0;
            path = "M"+centre+","+startY+" A"+radius+","+radius+" 0 "+largeArc+",1 "+endx+","+endy;

        arc = s.path(path);
        arc.attr({
          stroke: '#3da08d',
          fill: 'none',
          strokeWidth: 5
        });
    }, 500, mina.easeinout);
};
GPU.prototype.runOuter = function() {
    var canvasSize = 95,
        centre = canvasSize/2,
        radiusOuter = canvasSize*0.9/2,
        sOuter = Snap("#"+this.svgOuterID),
        pathOuter = "",
        arcOuter = sOuter.path(pathOuter),
        startYouter = centre-radiusOuter;

    sOuter.clear();
    var endpoint = this.currentFanSpeed/100*360;
    var startpoint = this.lastFanSpeed/100*360;

        //console.log(startpoint , endpoint);

    Snap.animate(startpoint, endpoint,   function (val) {
        arcOuter.remove();
        var d = val,
            dr = d-90;
            radiansOuter = Math.PI*(dr)/180,
            endxOuter = centre + radiusOuter * Math.cos(radiansOuter),
            endyOuter = centre + radiusOuter * Math.sin(radiansOuter),
            largeArcOuter = d>180 ? 1 : 0;
            pathOuter = "M"+centre+","+startYouter+" A"+radiusOuter+","+radiusOuter+" 0 "+largeArcOuter+",1 "+endxOuter+","+endyOuter;

        arcOuter = sOuter.path(pathOuter);
        arcOuter.attr({
          stroke: '#3da0ff',
          fill: 'none',
          strokeWidth: 5
        });
    }, 500, mina.easeinout);
}

GPU.prototype.updateToggle = function() {
    var self = this;
    $('#'+self.checkboxID).change(function() {
        console.log(this.checked);
        toggleCustomByIndex(self.index , this.checked);

        customToggleData[self.index] = this.checked;
        saveCustomToggleData(customToggleData);
    });
}

GPU.prototype.updateInfo = function() {
    var self = this;
    self.updateToggle();
    setInterval(function () {
        self.lastTemp = self.currentTemp;
        self.lastFanSpeed = self.currentFanSpeed;
        self.currentTemp = GPUinfo.GPUobject[self.index].temperature;
        self.currentFanSpeed = GPUinfo.GPUobject[self.index].fanSpeed;
        //console.log("currentTemp,lastTemp" , self.currentTemp , self.lastTemp);
        //console.log("currentFanSpeed,lastFanSpeed" , self.currentFanSpeed , self.lastFanSpeed);
        self.runInner();
        self.runOuter();
        document.getElementById(self.GPUnameID).innerHTML = GPUinfo.GPUobject[self.index].name;
        document.getElementById(self.tempID).innerHTML = GPUinfo.GPUobject[self.index].temperature;
        document.getElementById(self.fanSpeedID).innerHTML = GPUinfo.GPUobject[self.index].fanSpeed;
        document.getElementById(self.checkboxID).checked = GPUinfo.GPUobject[self.index].toggleCustom;
    }, 3000);
}
