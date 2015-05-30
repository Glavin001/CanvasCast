var ffmpeg = require('fluent-ffmpeg'),
    through = require('through'),
    Transcoder = require('stream-transcoder')


module.exports = function(canvas, options, output) {
    var fps = options.fps || 25;

    // output = __dirname + '/data/clock2.mp4'

    var input = through(null, null, {
        // autoDestroy: false
    });
    // var output = through(null, function() {
    //     input.end();
    // });

    input.on('data', function(chunk) {
        // console.log('ic');
    });

    // ffmpeg()
    //     .input(input)
    //     .inputFormat('image2pipe')
    //     .videoCodec('png')
    //     .fps(fps)
    //     // .input(imgPath)
    //     // .videoCodec('mpeg4')
    //     .videoCodec('h264')
    //     .fps(fps)
    //     .audioCodec('aac')
    //     .outputFormat('mp4')
    //     // .outputOptions('-movflags frag_keyframe+empty_moov')
    //     // .outputFormat('matroska')
    //     // setup event handlers
    //     .on('start', function(commandLine) {
    //         console.log('Spawned Ffmpeg with command: ' +
    //             commandLine);
    //     })
    //     .on('codecData', function(data) {
    //         console.log('Input is ' + data.audio + ' audio ' +
    //             'with ' + data.video + ' video');
    //     })
    //     .on('end', function() {
    //         console.log('done processing input stream');
    //     })
    //     .on('error', function(err, stdout, stderr) {
    //         console.log('Cannot process video: ' + err.message);
    //         console.log(stdout);
    //         console.log(stderr);
    //     })
    //     // .on('progress', function(progress) {
    //     //     console.log('Processing: ', progress,
    //     //         '% done');
    //     // })
    //     // .pipe(output, {end: true})
    //     .save(output)
    //     // .run();

    new Transcoder(input)
        .custom('f', 'image2pipe')
        .custom('vcodec', 'png')
        .fps(fps)
        // .maxSize(320, 240)
        .videoCodec('h264')
        // .videoBitrate(800 * 1000)
        // .fps(fps)
        // .audioCodec('libfaac')
        // .sampleRate(44100)
        // .channels(2)
        // .audioBitrate(128 * 1000)
        .format('mp4')
        .custom('strict', 'experimental')
        .on('finish', function() {
            next();
        })
        .on('error', function(err) {
            console.log("Error:", err);
        })
        .stream()
        .pipe(output);

    var tick = function() {
        // console.log('tick');
        canvas.toBuffer(function(err, sbuf) {
            // console.log('buf', input._events);
            // input.resume();
            input.write(sbuf);
        });
    };

    // Record frames
    var refreshRate = 1000 / fps;
    var t = setInterval(function() {
            tick();
        }, refreshRate)
    // Stop on end
    input.on('end', function() {
        clearInterval(t);
        // input.end();
    })

    return input;
};