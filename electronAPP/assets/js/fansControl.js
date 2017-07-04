const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');

var myDataPath = path.resolve(__dirname, "assets/data/customSpeedData.json");

var fetchCustomSpeedData = () => {
    try {
        var customSpeedData = fs.readFileSync(myDataPath);
        return JSON.parse(customSpeedData);
    }
    catch(e) {
        console.log(e);
        return [];
    }
}
var customSpeedData = fetchCustomSpeedData();
var GPUinfo = {
    totalQuantity: 0,
    GPUobject:[/*{ index: 0,
        name: 'GeForce GTX 1070',
        temperature: '69',
        fanSpeed: '50',
        toggleCustom: false,
        customSpeed: -1 }*/]
};

var executeCMD = (cmd) => {
    return new Promise((resolve , reject) => {
        try {
            var cmdChild = spawn(cmd ,[""], {shell: true});
        } catch (e) {
            reject(e);
        };

        var res="";

        cmdChild.stdout.on('data', (data) => {
            res += data.toString();
        });

        cmdChild.on('close', (code) => {
            resolve(res);
        });
    });
}

var updateTemperatureByIndex = (gpuNum) => {
    var cmd = `nvidia-settings -q '[gpu:${gpuNum}]/GPUCoreTemp'`;
    executeCMD(cmd)
    .then((res) => {
        GPUinfo.GPUobject[gpuNum].temperature = parseInt(res.split(" ")[5].slice(0,-2));
    })
    .catch((e) => {
        console.log(e);
    })
}
var updateFanSpeedByIndex = (gpuNum) => {
    var cmd = `nvidia-settings -q '[fan:${gpuNum}]/GPUCurrentFanSpeed'`;
    executeCMD(cmd)
    .then((res) => {
        GPUinfo.GPUobject[gpuNum].fanSpeed = parseInt(res.split(" ")[5].slice(0,-2));
    })
    .catch((e) => {
        console.log(e);
    })
}
var interpolator = (tempNow) => {
    if(tempNow <= customSpeedData[0].temperature ) {
        return customSpeedData[0].speed;
    }
    else if(tempNow >= customSpeedData[customSpeedData.length-1].temperature) {
        return customSpeedData[customSpeedData.length-1].speed;
    }
    for(var i = 0 ; i < customSpeedData.length ; i++) {
        if(tempNow === customSpeedData[i].temperature) {
            return customSpeedData[i].speed;
        }
        else if(tempNow < customSpeedData[i].temperature) {
            if(customSpeedData[i-1].temperature === customSpeedData[i].temperature) {
                return customSpeedData[i-1].speed;
            }
            else {
                return parseInt(customSpeedData[i-1].speed + (customSpeedData[i].speed - customSpeedData[i-1].speed) * (tempNow - customSpeedData[i-1].temperature) / (customSpeedData[i].temperature - customSpeedData[i-1].temperature) );
            }
        }
    }
}
var updateCustomSpeedByIndex = (gpuNum) => {
    if(GPUinfo.GPUobject[gpuNum].toggleCustom === true) {
        var targetSpeed = interpolator(GPUinfo.GPUobject[gpuNum].temperature);

        GPUinfo.GPUobject[gpuNum].customSpeed = targetSpeed;
        var cmd = `nvidia-settings -a '[fan:${gpuNum}]/GPUTargetFanSpeed=${targetSpeed}'`;
        executeCMD(cmd)
        .then((res) => {
            //console.log(res);
        })
        .catch((e) => {
            console.log(e);
        })
    }
}
var updateGPUstate = (mSecond) => {
    setInterval(() => {
        for (var i = 0; i < GPUinfo.totalQuantity; i++) {
            updateTemperatureByIndex(i);
            updateFanSpeedByIndex(i);
            updateCustomSpeedByIndex(i);
        }
    } , mSecond);
}

var toggleCustomByIndex = (gpuNum , value) => {
    var cmd  = `nvidia-settings -a '[gpu:${gpuNum}]/GPUFanControlState=1'`;
    if(value === false) {
        cmd  = `nvidia-settings -a '[gpu:${gpuNum}]/GPUFanControlState=0'`;
    }
    executeCMD(cmd)
    .then((res) => {
        GPUinfo.GPUobject[gpuNum].toggleCustom = value;
    })
    .catch((e) => {
        console.log(e);
    })
}
var toggleAllCustom = (value) => {
    for (var i = 0; i < GPUinfo.totalQuantity; i++) {
        toggleCustomByIndex(i , value);
    }
}

var setCustomSpeedData = (myCustomSpeedData) => {
    customSpeedData = myCustomSpeedData;
    fs.writeFile(myDataPath , JSON.stringify(myCustomSpeedData), (err) => {
        if (err) throw err;
        console.log("data saved");
    });
}

var logger = (mSecond) => {
    setInterval(function () {
        for (var i = 0; i < GPUinfo.totalQuantity; i++) {
            console.log(`[GPU${GPUinfo.GPUobject[i].index}] ${GPUinfo.GPUobject[i].name}: Temp: ${GPUinfo.GPUobject[i].temperature}, fanSpeed: ${GPUinfo.GPUobject[i].fanSpeed}, targetSpeed: ${GPUinfo.GPUobject[i].customSpeed}`);
        }
    }, mSecond);
}

var saveGPUinfo = (res) => {
    return new Promise((resolve , reject) => {
        var totalQuantity = parseInt(res.split(" ")[0].trim());
        //console.log("totalQuantity:" , totalQuantity);
        GPUinfo.totalQuantity = totalQuantity;

        resLines = res.split("\n");
        resLines.forEach((line) => {
            line = line.trim();
            words = line.split(" ");
            if(words[0].charAt(0) === "[") {
                var oneGPUobject = {
                    index: parseInt(words[0].slice(1, -1)),
                    name: line.match(/\(([^)]+)\)/)[1],
                    temperature: 0,
                    fanSpeed: 0,
                    toggleCustom: false,
                    customSpeed: -1
                };
                GPUinfo.GPUobject.push(oneGPUobject);
            }
        })
        resolve(GPUinfo);
    })
}
var initGPUinfo = () => {
    var cmd = "nvidia-settings -q gpus";
    executeCMD(cmd)
    .then(saveGPUinfo)
    .then((GPUinfo) => {
    })
    .catch((e) => {
        console.log(e);
    })
}
//////////////////////////////////////////////////////
initGPUinfo();
updateGPUstate(2500);
setTimeout(() => {
    toggleAllCustom(true);
    logger(5000);
},1000);
