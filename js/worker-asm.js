importScripts('ffmpeg-worker.js');

var now = Date.now;

function print(text) {
  postMessage({
    'type' : 'stdout',
    'data' : text
  });
}
function printErr(text) {
  postMessage({
    'type' : 'stderr',
    'data' : text
  });
}

onmessage = function(event) {

  var message = event.data;

  if (message.type === 'run') {
    var Module = {
      print: print,
      printErr: printErr,
      files: message.files || [],
      arguments: message.arguments || [],
      TOTAL_MEMORY: 268435456
      // Can play around with this option - must be a power of 2
      // TOTAL_MEMORY: 268435456
    };

    postMessage({
      'type' : 'start',
      'data' : Module.arguments.join(" ")
    });

    var time = now();
    var result = ffmpeg_run(Module);
    var totalTime = now() - time;

    postMessage({
      'type' : 'done',
      'data' : result,
      'time' : totalTime
    });
  }
};

postMessage({
  'type' : 'ready'
});
