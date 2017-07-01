const fs = require('fs');

var onApplyClick = () => {
    //console.log(MyGlobal.myChart.points);
    var pointsShortCut = MyGlobal.myChart.points;

    var csvString = "temperature,fanSpeed" + "\n";

    for (var i = 0; i < pointsShortCut.length; i++) {
        csvString += `${parseInt(pointsShortCut[i].x)},${parseInt(pointsShortCut[i].y)}\n`;
    }
    fs.writeFile("../../shellscripts/index.csv", csvString, (err) => {
        if(err) throw err;
        console.log("csv saved!");
    });

    fs.readFile("../../shellscripts/NVshTemplate" , (err , data) => {
        if(err) throw err;

        var shString = "#!/usr/bin/env bash\n\n" + "declare -A index;   declare -a orders;\n" + "#nodeFSstart\n";
        for (var i = 0; i < pointsShortCut.length; i++) {
            shString += `index["${parseInt(pointsShortCut[i].x)}"]="${parseInt(pointsShortCut[i].y)}"; orders+=( "${parseInt(pointsShortCut[i].x)}" )\n`;
        }
        shString += "#nodeFSend\n"

        var templateString = data.toString();
        shString += templateString;

        fs.writeFile("../../shellscripts/NvidiaCustom.sh", shString, (err) => {
            if(err) throw err;
            console.log("sh1 saved!");
            reRun();
        });
    });



}
