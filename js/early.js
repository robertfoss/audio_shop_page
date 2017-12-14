var util = require('./util');


var canvas = document.getElementById('canvas');
var interact = document.getElementById('interact');
var img = document.getElementById('img');
var inputFile;
var inputData;

function newFile(file) {
  var bufferReader = new FileReader();
  bufferReader.readAsArrayBuffer(file);
  bufferReader.onload = function() {
    var arrayBuffer = bufferReader.result
    fileData = new Uint8Array(arrayBuffer);
    console.log(fileData);
    util.ffmpegRunCommand("-i " + file.name + " -vf vflip out.jpg",
                          file.name,
                          fileData);
  };
  util.displayFile(interact, file);
}
util.setupFileInput(interact, newFile);
util.setupCanvas(canvas);
