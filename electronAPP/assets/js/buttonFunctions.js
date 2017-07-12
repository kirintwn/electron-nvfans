var onApplyAllClick = () => {
    var pointsShortCut = MyGlobal.myChart.points;
    var myCustomSpeedData = [];

    for (var i = 0; i < pointsShortCut.length; i++) {
        var singleData = {
            temperature: parseInt(pointsShortCut[i].x),
            speed: parseInt(pointsShortCut[i].y)
        }
        myCustomSpeedData.push(singleData);
    }

    saveCustomSpeedData(myCustomSpeedData);
    toggleAllCustom(true);
}
