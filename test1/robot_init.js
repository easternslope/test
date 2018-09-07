const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
var async = require('async');
var fs = require('fs');
var debug_queue = async.queue(function(task, callback) {
	if (task.id == 1) {
		// ping();    
		console.log('----------------------------------------------------------------');
		console.log('正在检测网络连接........');
		var flag = 0;
		const ping = spawn('ping', ['www.baidu.com']);
		ping.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
			flag = 1;
		});
		ping.stderr.on('data', (data) => {
			flag = 2;
			//console.log(`stderr: ${data}`);
		});
		ping.on('close', (code) => {
			//  console.log(`child process exited with code ${code}`);
			if (flag == 1) {
				console.log('网络连接成功');
			} else
				console.log('网络连接失败');
			callback();
		});
		setTimeout(() => {
			ping.kill();
		}, 3000)
	} else if (task.id == 2) {
		console.log('----------------------------------------------------------------');
		console.log();
		console.log('正在检测声卡设备');
		const arecord = spawn('arecord', ['-l']);
		arecord.stdout.on('data', (data) => {
			//	console.log(`stdout: ${data}`);
			var temp = data.toString();
			var temp1 = temp.split('\n');
			for (var i = 0; i < temp1.length; i++) {
				if ((temp1[i].indexOf('card 2:') != -1) && (temp1[i].indexOf('device 0:') != -1)) {
					console.log('USB设备正常');
					break;
				} else if (i == temp1.length)
					console.log('USB设备not正常');
			}
			// if(temp.indexOf('Set') != -1)
			/*  if(temp.indexOf('USB') != -1)
	  {
	   console.log('USB设备正常');
  	  }else
 	 {
  	 console.log('USB设备缺失');
 	 }*/
			if (temp.indexOf('audiocodec') != -1) {
				console.log('麦克风设备正常');
			} else {
				console.log('麦克风设备缺失');
			}
			if (temp.indexOf('sndhdmi') != -1) {
				console.log('声卡正常');
			} else {
				console.log('没有声卡');
			}
		});
		arecord.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
		});
		arecord.on('close', (code) => {
			//  console.log(`child process exited with code ${code}`);
			callback();
		});
	} else if (task.id == 3) {
		console.log();
		console.log('----------------------------------------------------------------');
		console.log();
		console.log('正在麦克风录音,请对麦克风说话...');
		exec('arecord -d 5 -r 16000 -c 1 -t wav -f S16_LE test.wav', (err, stdout, stderr) => {
			console.log('正在播放刚才的录音...');
			if (err) console.log('arecord wav error');
			else
				exec('play test.wav', (err, stdout, stderr) => {
					if (err) console.log(err);
					if (stdout) console.log(stdout);
					if (stderr) console.log(stderr);
					console.log('如果你没有听到刚才的录音，请检查麦克风和喇叭是否正常...');
					callback();
				})
		})
	} else if (task.id == 4) {
		console.log();
		console.log('----------------------------------------------------------------');
		console.log();
		console.log('正在播放示例音乐，启动USB声卡回路录音...');
		const play = spawn('play', ['example.mp3']);
		play.stdout.on('data', (data) => {});
		play.stderr.on('data', (data) => {});
		play.on('close', (code) => {});


		const test = spawn('arecord', ['-D', 'hw:2,0', '-f', 'S16_LE', '-V', 'mono', '-r44100', '-c', '1', '-t', 'wav', 'test.wav']);
		test.stdout.on('data', (data) => {});
		test.stderr.on('data', (data) => {});
		test.on('close', (code) => {
			console.log('录音结束...');
		});

		setTimeout(() => {
			play.kill();
			test.kill();
			setTimeout(() => {
				console.log('正在播放回路录音......');
				var debug = spawn('play', ['test.wav']);
				debug.stdout.on('data', (data) => {});
				debug.stderr.on('data', (data) => {});
				debug.on('close', (code) => {
					console.log('播放结束,如果你没有听到刚才的音频，请检查麦克风、喇叭、USB设备是否正常....');
					callback();
				});
			}, 1000);
		}, 5000);
	} else if (task.id == 5) {
		console.log();
		console.log('----------------------------------------------------------------');
		console.log();
		console.log('正在进行LED灯测试，观察LED灯会闪烁两次...');
		exec('matrix-gpio_out', (err, stdout, stderr) => {
			console.log('LED灯测试结束，如果没有闪烁，请检查是否插上头部LED灯...');
			callback();
		});

	} else {
		console.log();
		console.log('----------------------------------------------------------------');
		console.log();
		console.log('clear network file..');
		fs.writeFile('/etc/udev/rules.d/70-persistent-net.rules', '');
		callback();
	}
}, 1)


function ping() {
	const ping = spawn('ping', ['www.baidu.com']);
	ping.stdout.on('data', (data) => {
		console.log(`stdout: ${data}`);
	});
	ping.stderr.on('data', (data) => {
		console.log(`stderr: ${data}`);
	});
	ping.on('close', (code) => {
		//  console.log(`child process exited with code ${code}`);
		callback();
	});
	setTimeout(() => {
		ping.kill();
	}, 3000)
}

function check_Hardware() {
	const arecord = spawn('arecord', ['-l']);
	arecord.stdout.on('data', (data) => {
		console.log(`stdout: ${data}`);
	});
	arecord.stderr.on('data', (data) => {
		console.log(`stderr: ${data}`);
	});
	arecord.on('close', (code) => {
		console.log(`child process exited with code ${code}`);
	});
}

//启动区域
debug_queue.push({
	id: 1
});
debug_queue.push({
	id: 2
});
debug_queue.push({
	id: 3
});
debug_queue.push({
	id: 4
});
debug_queue.push({
	id: 5
});
debug_queue.push({
	id: 6
});