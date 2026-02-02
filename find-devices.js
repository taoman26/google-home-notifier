var mdns = require('mdns');
var Client = require('castv2-client').Client;

console.log('Google Home Device Scanner');
console.log('='.repeat(60));
console.log('Scanning for Google Home/Nest devices on your network...');
console.log('This may take up to 10 seconds.');
console.log('');

// デバイスのフレンドリー名を取得
function getDeviceFriendlyName(host, callback) {
  var client = new Client();
  
  client.connect(host, function() {
    // 接続後、receiverオブジェクトからフレンドリー名を取得
    var friendlyName = client.receiver ? client.receiver.friendlyName : null;
    client.close();
    callback(friendlyName);
  });
  
  client.on('error', function(err) {
    callback(null);
  });
  
  // タイムアウト
  setTimeout(function() {
    try {
      client.close();
    } catch(e) {}
    callback(null);
  }, 5000);
}

// デバイス検索機能
function findDevices(callback) {
  var browser = mdns.createBrowser(mdns.tcp('googlecast'));
  var foundDevices = {};
  var pendingRequests = 0;
  var scanTimeout;
  var checkTimeout;
  
  function checkComplete() {
    if (pendingRequests === 0) {
      clearTimeout(scanTimeout);
      clearTimeout(checkTimeout);
      browser.stop();
      var devices = Object.values(foundDevices);
      callback(devices);
    }
  }
  
  browser.on('serviceUp', function(service) {
    var ip = service.addresses[0];
    
    // 重複を避ける
    if (foundDevices[ip]) {
      return;
    }
    
    foundDevices[ip] = {
      mdnsName: service.name,
      ip: ip,
      port: service.port,
      friendlyName: null
    };
    
    console.log('Found device at ' + ip + ', checking details...');
    
    // フレンドリー名を取得
    pendingRequests++;
    getDeviceFriendlyName(ip, function(friendlyName) {
      pendingRequests--;
      if (friendlyName) {
        foundDevices[ip].friendlyName = friendlyName;
      }
      checkComplete();
    });
  });
  
  browser.start();
  
  // 5秒後にスキャン停止
  scanTimeout = setTimeout(function() {
    browser.stop();
  }, 5000);
  
  // 10秒後に強制終了
  checkTimeout = setTimeout(function() {
    browser.stop();
    var devices = Object.values(foundDevices);
    callback(devices);
  }, 10000);
}

// スキャン実行
findDevices(function(devices) {
  console.log('');
  console.log('='.repeat(60));
  console.log('Scan Complete!');
  console.log('='.repeat(60));
  console.log('');
  
  if (devices.length === 0) {
    console.log('No Google Home/Nest devices found on your network.');
    console.log('');
    console.log('Please check:');
    console.log('  - Your devices are powered on');
    console.log('  - Your devices are on the same network');
    console.log('  - Your firewall allows mDNS traffic');
    console.log('');
    process.exit(0);
  }
  
  console.log('Found ' + devices.length + ' device(s):');
  console.log('');
  
  devices.forEach(function(device, index) {
    console.log('-'.repeat(60));
    console.log('Device #' + (index + 1));
    console.log('-'.repeat(60));
    
    if (device.friendlyName) {
      console.log('Friendly Name: ' + device.friendlyName);
    } else {
      console.log('Friendly Name: [Not available]');
    }
    
    console.log('IP Address:    ' + device.ip);
    console.log('mDNS Name:     ' + device.mdnsName);
    console.log('');
    console.log('To use this device, copy the mDNS Name above and add to example.js:');
    console.log('');
    console.log("  var deviceName = '" + device.mdnsName + "';  // Example");
    console.log('');
    
    // ユニークな部分を抽出して表示
    var uniquePart = device.mdnsName.split('-').slice(-1)[0];
    if (uniquePart && uniquePart !== device.mdnsName) {
      console.log('Or use the unique part only:');
      console.log("  var deviceName = '" + uniquePart + "';");
      console.log('');
    }
  });
  
  console.log('='.repeat(60));
  console.log('');
  console.log('Next steps:');
  console.log('1. Copy the mDNS Name of your target device from above');
  console.log('2. Edit example.js and set deviceName to that value');
  console.log('3. Run: node example.js');
  console.log('');
  
  process.exit(0);
});
