/**
 * Module dependencies.
 */

var Canvas = require('canvas'),
    canvas = new Canvas(320, 320),
    ctx = canvas.getContext('2d'),
    ffmpeg = require('fluent-ffmpeg'),
    through = require('through'),
    through2 = require('through')
fs = require('fs')

function getX(angle) {
    return -Math.sin(angle + Math.PI);
}

function getY(angle) {
    return Math.cos(angle + Math.PI);
}

function clock(ctx) {
    var now = new Date();
    ctx.clearRect(0, 0, 320, 320);

    ctx.save();
    ctx.translate(160, 160);
    ctx.beginPath();
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#325FA2';
    ctx.fillStyle = '#eeeeee';
    ctx.arc(0, 0, 142, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.fill();

    ctx.strokeStyle = '#000000';
    // Hour marks
    ctx.lineWidth = 8;
    for (var i = 0; i < 12; i++) {
        var x = getX(Math.PI / 6 * i);
        var y = getY(Math.PI / 6 * i);
        ctx.beginPath();
        ctx.moveTo(x * 100, y * 100);
        ctx.lineTo(x * 125, y * 125);
        ctx.stroke();
    }

    // Minute marks
    ctx.lineWidth = 5;
    for (i = 0; i < 60; i++) {
        if (i % 5 != 0) {
            var x = getX(Math.PI / 30 * i);
            var y = getY(Math.PI / 30 * i);
            ctx.beginPath();
            ctx.moveTo(x * 117, y * 117);
            ctx.lineTo(x * 125, y * 125);
            ctx.stroke();
        }
    }

    var sec = now.getSeconds();
    var min = now.getMinutes();
    var hr = now.getHours();
    hr = hr >= 12 ? hr - 12 : hr;

    ctx.fillStyle = "black";

    // write Hours
    var x = getX(hr * (Math.PI / 6) + (Math.PI / 360) * min + (Math.PI /
        21600) * sec);
    var y = getY(hr * (Math.PI / 6) + (Math.PI / 360) * min + (Math.PI /
        21600) * sec);
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(x * -20, y * -20);
    ctx.lineTo(x * 80, y * 80);
    ctx.stroke();

    // write Minutes
    var x = getX((Math.PI / 30) * min + (Math.PI / 1800) * sec);
    var y = getY((Math.PI / 30) * min + (Math.PI / 1800) * sec);

    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(x * -28, y * -28);
    ctx.lineTo(x * 112, y * 112);
    ctx.stroke();

    // Write seconds
    var x = getX(sec * Math.PI / 30);
    var y = getY(sec * Math.PI / 30);
    ctx.strokeStyle = "#D40000";
    ctx.fillStyle = "#D40000";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x * -30, y * -30);
    ctx.lineTo(x * 83, y * 83);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x * 95, y * 95, 10, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.fillStyle = "#555";
    ctx.arc(0, 0, 3, 0, Math.PI * 2, true);
    ctx.fill();

    ctx.restore();
}

clock(ctx);

// var canvasStream = canvas.jpegStream();
// console.log(canvasStream);
// create new ffmpeg processor instance using input stream
// instead of file path (can be any ReadableStream)
var stream = through(null, null, {
    autoDestroy: false
});
// var stream = through2();
// console.log(stream);

var imgPath = __dirname + '/data/clock.png';
var out = fs.createWriteStream(imgPath);
// canvasStream.on('data', function(chunk) {
//     out.write(chunk);
// });
// canvasStream.on('end', function() {
//     //
//     console.log('end canvas stream!');
//     stream.end();
// });

var fps = 30;

function image2Video(input) {
    var proc = ffmpeg(input)
        // .format('image2pipe')
        // .input(stream)
        .fromFormat('image2pipe')
        .videoCodec('png')
        .fps(fps)
        // .input(imgPath)
        .videoCodec('mpeg4')
        .fps(fps)
        // setup event handlers
        .on('start', function(commandLine) {
            console.log('Spawned Ffmpeg with command: ' +
                commandLine);
        })
        .on('codecData', function(data) {
            console.log('Input is ' + data.audio + ' audio ' +
                'with ' + data.video + ' video');
        })
        .on('end', function() {
            console.log('done processing input stream');
        })
        .on('error', function(err, stdout, stderr) {
            console.log('Cannot process video: ' + err.message);
            console.log(stdout);
            console.log(stderr);
        })
        .on('progress', function(progress) {
            console.log('Processing: ' + progress.percent +
                '% done');
        })
        // save to file
        .save(__dirname + '/data/clock.mp4')

    /*
    'ffmpeg',
    '-y', overwrite output files
    '-f', force format
    'image2pipe',
    '-vcodec', force video codec ('copy' to copy stream)
    'png',
    '-r', set frame rate (Hz value, fraction or abbreviation)
    str(fps), rate
    '-i', infile options
    '-', infile (stdin)
    '-vcodec', force video codec ('copy' to copy stream)
    'mpeg4',
    '-qscale',
    '5',
    '-r', set frame rate (Hz value, fraction or abbreviation)
    str(fps), rate
    'video.avi'
    */

}

// canvasStream.pipe(stream);
// stream.on('data', function(chunk) {
//     console.log('data', chunk);
// });
// stream.on('end', function() {
//     console.log('end through stream');
// });

var tick = function() {
    clock(ctx);

    canvas.toBuffer(function(err, sbuf) {
        // console.log(sbuf);
        // Convert Slow Buffer to Buffer
        buf = new Buffer(sbuf.length);
        sbuf.copy(buf);

        // stream.pause();
        // console.log(stream.paused);
        // setTimeout(function() {
        // console.log('write');
        stream.write(buf);
        // stream.end();
        // }, 1000);
        // console.log(stream._events)
        // image2Video(stream);
        // console.log(stream.paused);
        // stream.resume();
        // stream.end();
        // setTimeout(function() {
        //
        //     stream.resume();
        //     console.log(stream);
        // }, 1000);

        // out.write(buf);
        // out.end();
        // var inStream = fs.createReadStream(imgPath);
        // // inStream.pipe(stream);
        // inStream.on('data', function(chunk) {
        //     console.log('inStream data', chunk);
        // })
        // inStream.on('end', function() {
        //     console.log('end through inStream');
        // });
        //
        // console.log(stream, inStream);
        // // //
        // // image2Video(inStream);
        // stream.pipe(process.stdout);
        // inStream.pipe(process.stdout)
        // stream.resume();
        // stream.end();

    });

};

image2Video(stream);
// FIXME: delay the piping
setTimeout(function() {

    var t = setInterval(function() {
        tick();
    }, 1000/fps)

    setTimeout(function() {
        clearInterval(t);
        stream.end();
    }, 10000);

}, 1000);
