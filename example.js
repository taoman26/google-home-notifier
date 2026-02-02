var express = require('express');
var googlehome = require('./google-home-notifier');
var ngrok = require('ngrok');
var bodyParser = require('body-parser');
var app = express();
const serverPort = 8091; // default port

// ============================================================
// デバイス設定
// ============================================================
// まず find-devices.js を実行してデバイスのmDNS名を確認してください
// 実行方法: node find-devices.js
//
// 見つかったmDNS名をここに設定:
var deviceName = 'Google-Home-Mini-abc123def456';  // 実際のmDNS名に置き換えてください
// 
// 複数デバイスがある場合は、必ず目的のデバイスのmDNS名を設定してください
// ============================================================

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.post('/google-home-notifier', urlencodedParser, function (req, res) {
  
  if (!req.body) return res.sendStatus(400)
  console.log(req.body);
  
  var text = req.body.text;

  var language = 'ja'; // default language code
  if (req.query.language) {
    language = req.query.language;
  }

  googlehome.device(deviceName, language);

  // タイムアウト設定
  var timeout = setTimeout(function() {
    console.log('ERROR: Request timed out - device may not be reachable');
    if (!res.headersSent) {
      res.status(504).send('Request timeout. Please run find-devices.js to verify device name.');
    }
  }, 10000); // 10秒でタイムアウト

  if (text){
    try {
      if (text.startsWith('http')){
        var mp3_url = text;
        googlehome.play(mp3_url, function(notifyRes) {
          clearTimeout(timeout);
          console.log('Success:', notifyRes);
          if (!res.headersSent) {
            res.send(deviceName + ' will play sound from url: ' + mp3_url + '\n');
          }
        });
      } else {
        googlehome.notify(text, function(notifyRes) {
          clearTimeout(timeout);
          console.log('Success:', notifyRes);
          if (!res.headersSent) {
            res.send(deviceName + ' will say: ' + text + '\n');
          }
        });
      }
    } catch(err) {
      clearTimeout(timeout);
      console.log('ERROR:', err);
      if (!res.headersSent) {
        res.status(500).send(err.toString());
      }
    }
  }else{
    clearTimeout(timeout);
    res.send('Please POST "text=Hello Google Home"');
  }
})

app.get('/google-home-notifier', function (req, res) {

  console.log(req.query);

  var text = req.query.text;

  var language = 'ja'; // default language code
  if (req.query.language) {
    language = req.query.language;
  }

  googlehome.device(deviceName, language);

  // タイムアウト設定
  var timeout = setTimeout(function() {
    console.log('ERROR: Request timed out - device may not be reachable');
    if (!res.headersSent) {
      res.status(504).send('Request timeout. Please run find-devices.js to verify device name.');
    }
  }, 10000); // 10秒でタイムアウト

  if (text) {
    try {
      if (text.startsWith('http')){
        var mp3_url = text;
        googlehome.play(mp3_url, function(notifyRes) {
          clearTimeout(timeout);
          console.log('Success:', notifyRes);
          if (!res.headersSent) {
            res.send(deviceName + ' will play sound from url: ' + mp3_url + '\n');
          }
        });
      } else {
        googlehome.notify(text, function(notifyRes) {
          clearTimeout(timeout);
          console.log('Success:', notifyRes);
          if (!res.headersSent) {
            res.send(deviceName + ' will say: ' + text + '\n');
          }
        });
      }
    } catch(err) {
      clearTimeout(timeout);
      console.log('ERROR:', err);
      if (!res.headersSent) {
        res.status(500).send(err.toString());
      }
    }
  }else{
    clearTimeout(timeout);
    res.send('Please GET "text=Hello+Google+Home"');
  }
})

app.listen(serverPort, function () {
  ngrok.connect(serverPort, function (err, url) {
    console.log('Endpoints:');
    console.log('    http://localhost:' + serverPort + '/google-home-notifier');
    console.log('    ' + url + '/google-home-notifier');
    console.log('GET example:');
    console.log('curl -X GET ' + url + '/google-home-notifier?text=Hello+Google+Home');
	console.log('POST example:');
	console.log('curl -X POST -d "text=Hello Google Home" ' + url + '/google-home-notifier');
  });
})
