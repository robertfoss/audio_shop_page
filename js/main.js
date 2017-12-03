var sox = require('sox');
var ffmpeg = require("ffmpeg.js/ffmpeg-mp4.js");
var util = require('./util');

var stdout = "";
var stderr = "";

var img_data = util.getImgDataID('img');
util.drawImageProp('canvas', img_data);

ffmpeg({
  arguments: ["-version"],
  print: function(data) { stdout += data + "\n"; },
  printErr: function(data) { stderr += data + "\n"; },
  onExit: function(code) {
    console.log("Process exited with code " + code);
    console.log(stdout);
  },
});
