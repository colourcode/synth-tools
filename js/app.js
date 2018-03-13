import '../css/app.scss'
import $ from "jquery"
import '../node_modules/bootstrap/dist/js/bootstrap.min.js'
import p5 from 'p5'
import 'p5/lib/addons/p5.sound'

import * as screenfull from 'screenfull'
import enquire from 'enquire.js'
import { saveAs } from 'file-saver'
import FastClick from 'fastclick'


const assets = {
  BD: require('../assets/sound/1.mp3'),
  SD: require('../assets/sound/2.mp3'),
  PD: require('../assets/sound/3.mp3'),
  HH: require('../assets/sound/4.mp3'),
}

var FskModem = function() { this.init.apply(this, arguments) };
FskModem.prototype = {

	init : function(opts) {
		var self = this;

		self.markFreq  = opts.markFreq  || 1200;
		self.spaceFreq = opts.spaceFreq || 2200;
		self.baudrate  = opts.baudrate  || 300;
		self.startBit  = opts.startBit  || 1;
		self.stopBit   = opts.stopBit   || 1;
		self.threshold = opts.threshold || 0.0001;
		self.byteUnit  = 8;

		if (!FskModem.context) FskModem.context = new AudioContext();
		self.context = FskModem.context;
		self.DOWNSAMPLE_FACTOR = opts.DOWNSAMPLE_FACTOR || 8;
		self.audioNodes = [];
	},


	modulate : function (byte) {
		var self = this;


	},

	send : function(bytes, opts) {
		var self = this;
		if (!opts) opts = {};

		console.log("Send");


		var unit      = self.context.sampleRate / self.baudrate;
		var wait      = opts.wait || 5;
		var bitsPerByte = self.byteUnit + self.startBit + self.stopBit;

		var buffer    = self.context.createBuffer(1, bytes.length * bitsPerByte * unit + (wait * 2 * unit), self.context.sampleRate);
		var data      = buffer.getChannelData(0);
		var position  = 0;

		var phase = 0;
		var markToneDelta = 2 * Math.PI * self.markFreq / self.context.sampleRate;
		var spaceToneDelta = 2 * Math.PI * self.spaceFreq / self.context.sampleRate;

		function sendBit (bit, length) {
			var tone = bit ? markToneDelta : spaceToneDelta;
			var len = length * unit;
			for (var i = 0; i < len; i++) {
				phase += tone;
				data[position++] = Math.sin(phase);
			}
		}

		function sendByte (byte) {
			sendBit(0, self.startBit);
			for (var b = 0; b < self.byteUnit; b++) {
				//  least significant bit first
				if (byte & (1<<b)) {
					sendBit(1, 1);
				} else {
					sendBit(0, 1);
				}
			}
			sendBit(1, self.stopBit);
		}

		sendBit(1, wait);
		for (var i = 0, len = bytes.length; i < len; i++) {
			sendByte(bytes[i]);
		}
		sendBit(1, wait);

		if (opts.play) {
			var source = self.context.createBufferSource();
			source.buffer = buffer;
			source.connect(opts.play);
			source.start(0);
		}

		return buffer;

	}

};

// XXX Missing http://markusslima.github.io/jquery-filestyle/
//
/* jshint undef: false, unused: false, -W020, -W083  */
/* global jQuery */

/*
Author: Arturs Gulbis / cherijs
*/

const sketch = p => {
  var Kick, Snare, Percussion, Hat, Pattern;
  var KickPat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var SnarePat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var PercussionPat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var HatPat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  var tr_id = ['KickPat', 'SnarePat', 'HatPat', 'PercussionPat'];

  var msg = 'click to play';
  var bpm = 120;

  const loadSound = p.loadSound

  p.preload = () => {
      Kick = loadSound(assets.BD);
      Snare = loadSound(assets.SD);
      Percussion = loadSound(assets.PD);
      Hat = loadSound(assets.HH);
  }

  p.setup = () => {
      console.log('calling setup()')
      p.noStroke();
      p.fill(255);
      p.textAlign(p.CENTER);

      var KickPhrase = new p5.Phrase('Kick', playKick, KickPat);
      var SnarePhrase = new p5.Phrase('Snare', playSnare, SnarePat);
      var PercussionPhrase = new p5.Phrase('Percussion', playPercussion, PercussionPat);
      var HatPhrase = new p5.Phrase('Hat', playHat, HatPat);
      Pattern = new p5.Part(16, 1/14);
      Pattern.addPhrase(KickPhrase);
      Pattern.addPhrase(SnarePhrase);
      Pattern.addPhrase(PercussionPhrase);
      Pattern.addPhrase(HatPhrase);
      Pattern.setBPM(120);
      // Pattern.onStep(function () {
      //     console.log('ste');
      // });
      p.masterVolume(1);
  }

  p.draw = () => {
      // background(0);
      // text(msg, width / 2, height / 2);
  }

  function playKick(time, playbackRate) {
      Kick.rate(playbackRate);
      Kick.play(time);
  }

  function playSnare(time, playbackRate) {
      Snare.rate(playbackRate);
      Snare.play(time);
  }

  function playPercussion(time, playbackRate) {
      Percussion.rate(playbackRate);
      Percussion.play(time);
  }

  function playHat(time, playbackRate) {
      Hat.rate(playbackRate);
      Hat.play(time);
      Hat.setVolume(0.7);
  }

  function mouseClicked() {
      if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
          Pattern.start();
          msg = 'playing part';
      }
  }

  $(function() {
      //------------------------  CONSOLE FIX
      // Avoid `console` errors in browsers that lack a console.
      var method;
      var noop = function () {};
      var methods = [
          'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
          'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
          'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
          'timeStamp', 'trace', 'warn'
      ];
      var length = methods.length;
      var console = (window.console = window.console || {});
      while (length--) {
          method = methods[length];
          // Only stub undefined methods.
          if (!console[method]) {
              console[method] = noop;
          }
      }
      //------------------------  CONSOLE END
      var wW;
      var wH;
      var $screenXxs = 320;
      var $screenXs = 480;
      var $screenSm = 768;
      var $screenMd = 992;
      var $screenLg = 1200;
      var playing = 0;

      $(function () {
          // JQUERY READY, MY FUNCTIONS HERE

          if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
              var args = [
                  '\n\n %c ✰ ERICA SYNTHS ✰ ' + '%c' + ' by: cherijs / 2016 \n\n\n',
                  'background: #000000; padding:4px 0; color: white;',
                  'background: black; padding:4px 0; color: white; ',

              ];

              window.console.log.apply(console, args); //jshint ignore:line
          } else if (window.console) {
              window.console.log('ERICA SYNTHS by: SLURP ♥ cherijs'); //jshint ignore:line
          }

          $(document).ready(function () {
              var $el = $('#main');

              // $(document).on('touchmove', function (e) {
              //     e.preventDefault();
              // });
              $('.dropdown-menu a').click(function (event) {
                  event.preventDefault();
              });

              $(window).resize(function () {
                  resize();
              });

              function resize() {
                  wW = $(window).width();
                  wH = $(window).height();

                  var new_w = $('#pattern-table2 td:first-child').width();
                  // $('#pattern-table2 td span').height(new_w).width(new_w);
                  // $('#pattern-table2 td, #track-group >div').height(new_w).width(new_w);
                  $('#pattern-table2 td').height(new_w);
                  $('#track-selects2').width(new_w * 2);
                  $('#track-group>div .cell button').height(new_w);

                  // $('#pattern-table2 td, #track-group >div:first-child').width();
                  $('#pattern-table2').width((wW - 20 - new_w * 2));
                  $('.c16').css({
                      width: (wW - 20 - new_w * 2) + 'px',
                      height: new_w + 'px',
                      left: (new_w * 2) + 'px'
                  }).find('a').css({
                      height: new_w + 'px',
                      lineHeight: new_w + 'px'
                      // paddingTop: (new_w / 2) - 4
                  });

                  var scale, origin;
                  var elWidth = $('#main').width(); //920;
                  var elHeight = $('#main').height(); //447;
                  var elWidth = 920;
                  var elHeight = 420;

                  if (wW > wH) {
                      // console.log('horizontal');
                      scale = Math.min(
                          wW / elWidth,
                          wH / elHeight
                      );

                      $el.css({
                          transform: "translateX(-50%) translateY(-50%)  scale(" + scale + ")"
                      });
                  } else {
                      // console.log('vertical');

                      scale = Math.min(
                          wW / elHeight,
                          wH / elWidth
                      );

                      $el.css({
                          transform: "translateX(-50%) translateY(-50%) rotate(90deg) scale(" + scale + ")"
                      });
                  }

              }

              function hideAddressBar() {

                  if (!window.location.hash) {
                      if (document.height < window.outerHeight) {
                          document.body.style.height = (window.outerHeight + 50) + 'px';
                      }

                      setTimeout(function () {
                          window.scrollTo(0, 1);
                      }, 50);
                  }

                  resize();
              }

              window.addEventListener("load", function () {
                  if (!window.pageYOffset) {
                      hideAddressBar();
                  }
              });
              window.addEventListener("orientationchange", hideAddressBar);

              var device;
              enquire.register('screen and (min-width:359px) and (max-width:767px)', {

                  match: function () {
                      device = 'tablet';
                      console.log('TABLET (min-width:359px) and (max-width:767px)');
                      resize();
                  }

              });

              enquire.register('screen and (max-width:359px)', {

                  match: function () {
                      device = 'mobile';
                      console.log('MOBILE max-width:359px');
                      resize();
                  }

              });

              enquire.register('screen and (min-width:768px)', {

                  match: function () {
                      device = 'desktop';
                      console.log('DESKTOP min-width:768px');
                      resize();
                  }

              });

              resize();

              navigator.getMedia = (
                  navigator.getUserMedia ||
                  navigator.webkitGetUserMedia ||
                  navigator.mozGetUserMedia ||
                  navigator.msGetUserMedia
              );

              window.AudioContext = (
                  window.AudioContext ||
                  window.webkitAudioContext ||
                  window.mozAudioContext ||
                  window.msAudioContext
              );

              var Modem = {
                  init: function () {
                      console.log("Modem init!");
                  },

                  send: function (data) {
                      Modem.Transmitter = new FskModem({});
                      Modem.Transmitter.send(data, {
                          play: Modem.Transmitter.context.destination
                      });
                      //, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x5A
                  }
              }

              Modem.init();

              function makePatern() {

                  var r_i = 0;
                  $('#pattern-table2 tr').each(function () {

                      var row = $(this);
                      var c_i = 0;

                      row.find('td').each(function () {

                          if ($(this).hasClass("on")) {
                              if (r_i === 0) {
                                  KickPat[c_i] = 1;
                              }
                              if (r_i === 1) {
                                  SnarePat[c_i] = 1;
                              }
                              if (r_i === 3) {
                                  PercussionPat[c_i] = 1;
                              }
                              if (r_i === 2) {
                                  HatPat[c_i] = 1;
                              }
                          } else if ($(this).hasClass("off")) {
                              if (r_i === 0) {
                                  KickPat[c_i] = 0;
                              }
                              if (r_i === 1) {
                                  SnarePat[c_i] = 0;
                              }
                              if (r_i === 3) {
                                  PercussionPat[c_i] = 0;
                              }
                              if (r_i === 2) {
                                  HatPat[c_i] = 0;
                              }

                          }
                          c_i++;
                      });

                      r_i++;
                  });

                  // console.log(KickPat);

                  if (playing === 1) {
                      Pattern.stop();
                      Pattern.start();
                      Pattern.loop();
                  }
              }

              window.onload = function () {
                  resize();
                  var table = $('<table></table>').attr({
                      id: "pattern-table2"
                  });

                  var rows = 4;
                  var cols = 16;

                  // for (var i = 0; i < rows; i++) {
                  //     var row = $('<tr></tr>').attr({
                  //         id: tr_id[i],
                  //         class: ["class1", "class2", "class3"].join(' ')
                  //     }).appendTo(table);
                  //     for (var j = 0; j < cols; j++) {
                  //         $('<td></td>').append("<span style='width:0px;'></span>").attr({
                  //             class: ["off", "cell"].join(' ')
                  //         }).appendTo(row);
                  //     }
                  // }

                  // table.appendTo("#pattern-grid");

                  $(".cell").click(function () {
                      var col = $(this).parent().children().index($(this));
                      var row = $(this).parent().parent().children().index($(this).parent());
                      var row_ = $(this).parent().parent().children();

                      if (!$(this).hasClass("disabled")) {

                          if ($(this).hasClass("off")) {
                              $(this).removeClass("off");
                              $(this).addClass("on");

                              // if (row === 0) {
                              //     KickPat[col] = 1;
                              // }
                              // if (row === 1) {
                              //     SnarePat[col] = 1;
                              // }
                              // if (row === 2) {
                              //     PercussionPat[col] = 1;
                              // }
                              // if (row === 3) {
                              //     HatPat[col] = 1;
                              // }

                          } else {
                              $(this).removeClass("on");
                              $(this).addClass("off");
                              // if (row === 0) {
                              //     KickPat[col] = 0;
                              // }
                              // if (row === 1) {
                              //     SnarePat[col] = 0;
                              // }
                              // if (row === 2) {
                              //     PercussionPat[col] = 0;
                              // }
                              // if (row === 3) {
                              //     HatPat[col] = 0;
                              // }

                          }
                          makePatern();
                      }

                      console.log('Row: ' + row + ', Column: ' + col);
                  });

                  $("#bpm-input").change(function () {
                      bpm = $("#bpm-input").val();

                      if (bpm < 20) bpm = 20;
                      if (bpm > 420) bpm = 420;
                      if (isNaN(bpm)) bpm = 120;

                      Pattern.setBPM(parseInt(bpm));
                  });

                  $("#save-btn").click(function () {

                      var data = {
                          KickPat: KickPat,
                          SnarePat: SnarePat,
                          PercussionPat: PercussionPat,
                          HatPat: HatPat,
                          bpm: bpm
                      };
                      var json = JSON.stringify(data);
                      var blob = new Blob([json], {
                          type: "application/json"
                      });

                      saveAs(blob, "trigger-pattern.json");

                  });

                  /* XXX
                  $(':file').jfilestyle({
                      input: false,
                      buttonText: 'LOAD'
                  });

                  $("#load-btn").click(function () {

                      $(":file").jfilestyle('clear');
                  });
                  */

                  $("#load-btn").change(function () {

                      var file = document.querySelector('input[type=file]').files[0];
                      var reader = new FileReader();

                      reader.addEventListener("load", function () {

                          var data = JSON.parse(reader.result);
                          console.log(data);
                          if (typeof data.HatPat !== 'undefined') {

                              // HatPat = data.HatPat;
                              // KickPat = data.KickPat;
                              // PercussionPat = data.PercussionPat;
                              // SnarePat = data.SnarePat;
                              bpm = data.bpm;

                              Pattern.setBPM(parseInt(bpm));

                              $("#pattern-table2 tr").each(function () {
                                  var pat_id = this.id;
                                  var track_id = parseInt($(this).index()) + 1;
                                  console.log(pat_id);
                                  console.log(track_id);
                                  // console.log(window[pat_id]);
                                  $("td", this).each(function () {
                                      var index = $(this).index();
                                      if (typeof data[pat_id][index] === 'undefined') {
                                          var track_length = data[pat_id].length;
                                          $(this).addClass("disabled");
                                          $(this).removeClass("off");
                                          $(this).removeClass("on");
                                          window[pat_id].splice(0, track_length);
                                          console.log(track_id);
                                          $('#track' + track_id + '-title').text(track_length);

                                      } else if (data[pat_id][index] === 1) {
                                          $(this).addClass("on");
                                          $(this).removeClass("off");
                                      } else if (data[pat_id][index] === 0) {
                                          $(this).removeClass("on");
                                          $(this).addClass("off");
                                      }

                                  });
                              });
                              makePatern();

                              $('#play-btn').text('Stop');
                              playing = 1;
                              Pattern.stop();
                              Pattern.start();
                              Pattern.loop();

                          }

                      }, false);

                      if (file) {
                          reader.readAsText(file);
                      }
                  });

                  $("#slot-select li > a").click(function () {
                      $("#slot-title").text(this.innerHTML);
                  });

                  $("#track1-select li > a").click(function () {
                      $("#track1-title").text(this.innerHTML);

                      var track_length = parseInt($("#track1-title").text())
                      $("#pattern-table2 tr").each(function () {

                          if ($(this).index() == 0) {
                              $("td", this).each(function () {

                                  if ($(this).index() < track_length) {
                                      $(this).removeClass("disabled");
                                      if (!$(this).hasClass("on")) {
                                          $(this).addClass("off");
                                      }
                                  } else {
                                      $(this).removeClass("on");
                                      $(this).removeClass("off");
                                      $(this).addClass("disabled");

                                  }
                                  KickPat.splice(0, track_length);

                              });
                          }
                      });

                      makePatern();
                  });

                  $("#track2-select li > a").click(function () {
                      $("#track2-title").text(this.innerHTML);

                      var track_length = parseInt($("#track2-title").text())
                      $("#pattern-table2 tr").each(function () {

                          if ($(this).index() == 1) {
                              $("td", this).each(function () {

                                  if ($(this).index() < track_length) {
                                      $(this).removeClass("disabled");
                                      if (!$(this).hasClass("on")) {
                                          $(this).addClass("off");
                                      }
                                  } else {
                                      $(this).removeClass("on");
                                      $(this).removeClass("off");
                                      $(this).addClass("disabled");
                                  }
                                  SnarePat.splice(0, track_length);
                              });
                          }
                      });
                      makePatern();
                  });

                  $("#track3-select li > a").click(function () {
                      $("#track3-title").text(this.innerHTML);

                      var track_length = parseInt($("#track3-title").text())
                      $("#pattern-table2 tr").each(function () {

                          if ($(this).index() == 2) {
                              $("td", this).each(function () {

                                  if ($(this).index() < track_length) {
                                      $(this).removeClass("disabled");
                                      if (!$(this).hasClass("on")) {
                                          $(this).addClass("off");
                                      }
                                  } else {
                                      $(this).removeClass("on");
                                      $(this).removeClass("off");
                                      $(this).addClass("disabled");
                                  }
                                  HatPat.splice(0, track_length);
                              });
                          }
                      });
                      makePatern();
                  });

                  $("#track4-select li > a").click(function () {
                      $("#track4-title").text(this.innerHTML);

                      var track_length = parseInt($("#track4-title").text())
                      $("#pattern-table2 tr").each(function () {

                          if ($(this).index() == 3) {
                              $("td", this).each(function () {

                                  if ($(this).index() < track_length) {
                                      $(this).removeClass("disabled");
                                      if (!$(this).hasClass("on")) {
                                          $(this).addClass("off");
                                      }
                                  } else {
                                      $(this).removeClass("on");
                                      $(this).removeClass("off");
                                      $(this).addClass("disabled");
                                  }
                                  PercussionPat.splice(0, track_length);
                              });
                          }
                      });
                      makePatern();
                  });

                  $("#clear-btn").click(function () {

                      // KickPat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                      // SnarePat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                      // PercussionPat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                      // HatPat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                      Pattern.stop();
                      $("#pattern-table2 tr").each(function () {
                          $("td", this).each(function () {
                              if ($(this).hasClass("on")) {
                                  $(this).removeClass("on");
                                  $(this).addClass("off");
                              }
                          });
                      });
                      makePatern();
                  });

                  $("#play-btn").click(function () {
                      if (playing === 0) {
                          $(this).text('Stop');
                          playing = 1;
                          Pattern.stop();
                          Pattern.start();
                          Pattern.loop();
                      } else {
                          $(this).text('Play');
                          playing = 0;
                          Pattern.stop();
                      }

                  });

                  $("#transmit-btn").click(function () {
                      //Pattern.stop();
                      var trig = [0, 0, 0, 0];
                      var trig_length = [3, 7, 11, 15]; // For testing
                      var i = 0;
                      var output = new ArrayBuffer(1 + 1 + 12 + 1 + 1 + 2); // Sync + Slot + Data + Checksum + End + BPM
                      var outputView = new DataView(output);
                      var outputIdx = 0;
                      outputView.setUint8(outputIdx++, 0xA5);
                      outputView.setUint8(outputIdx++, parseInt($("#slot-title").text()) - 1);

                      trig_length[0] = parseInt($("#track1-title").text()) - 1;
                      trig_length[1] = parseInt($("#track2-title").text()) - 1;
                      trig_length[2] = parseInt($("#track3-title").text()) - 1;
                      trig_length[3] = parseInt($("#track4-title").text()) - 1;

                      $("#pattern-table2 tr").each(function () {
                          $("td", this).each(function () {
                              trig[i] <<= 1;
                              if ($(this).hasClass("on")) {
                                  trig[i] |= 1;
                              }
                          });

                          outputView.setUint16(outputIdx, trig[i], false);
                          outputIdx += 2;
                          outputView.setUint8(outputIdx, trig_length[i], false);
                          outputIdx += 1;

                          i++;
                      });

                      var bpm = parseInt($("#bpm-input").val());
                      if (bpm < 20) bpm = 20;
                      if (bpm > 420) bpm = 420;
                      if (isNaN(bpm)) bpm = 120;
                      $("#bpm-input").val(bpm);
                      console.log("BPM:", bpm);

                      outputView.setUint16(outputIdx, bpm, false);
                      outputIdx += 2;

                      var checksum = 0;
                      var arr = new Uint8Array(output);
                      for (var i = 1; i < arr.length; i++) {
                          checksum += arr[i];
                      }

                      outputView.setUint8(outputIdx++, (checksum % 256) ^ 0xFF);
                      outputView.setUint8(outputIdx, 0x5A);

                      console.log(new Uint8Array(output));
                      Modem.send(new Uint8Array(output));
                  });
              }

          });

          FastClick.attach(document.body);

      });
  })
}

new p5(sketch);
