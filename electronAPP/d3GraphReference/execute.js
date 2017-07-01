const spawn = require('child_process').spawn;

var child;

var runScript = () => {
    //child = spawn('./../../shellscripts/test.sh',[""], {shell: true , detached: true});
    child = spawn('./../../shellscripts/NvidiaCustom.sh',[""], {shell: true , detached: true});

    child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    child.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
    child.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });

    console.log("this is PID:", child.pid);
}

var reRun = () => {
    console.log("pre-reRun PID:", child.pid);
    process.kill(-child.pid);
    runScript();
}

var onKillClick = () => {
    console.log("kill PID:", child.pid);
    process.kill(-child.pid);
}

runScript();
