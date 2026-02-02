# google-home-notifier
Send notifications to Google Home
- This repository is a fork of noelportugal's google-home-notifier, with Pull Request #55 applied and the default language in example.js set to Japanese. While noelportugal's original source uses google-tts-api version 0.0.2, this version uses 2.0.2. Please note that as of May 2025, google-tts-api version 0.0.2 cannot be used for speech on Google Home/Nest devices.

#### Installation
```sh
$ npm install google-home-notifier
```

#### Usage

**Step 1: Check IP Address in Google Home App**

Find the IP address of your target device in the Google Home app:
1. Open Google Home app
2. Select your device
3. Settings (gear icon) → "Device information"
4. Note the IP address (e.g., 192.168.1.20)

**Step 2: Get Device mDNS Name**

Run find-devices.js to find the mDNS name corresponding to the IP address from Step 1:
```sh
$ node find-devices.js
```

Example output:
```
============================================================
Device #1
============================================================
Friendly Name: [Not available]
IP Address:    192.168.1.20  ← IP address from Google Home app
mDNS Name:     Google-Home-Mini-abc123def456  ← Use this value (example)

To use this device, add this line to example.js:

  var deviceName = 'Google-Home-Mini-abc123def456';
============================================================
```

**Step 3: Set Device Name**

Copy the mDNS name that matches the IP address from Step 1 and set it in example.js:
```javascript
var deviceName = 'Google-Home-Mini-abc123def456';  // Replace with your actual mDNS name
```

**Step 4: Use in Your Code**

```javascript
var googlehome = require('google-home-notifier');
var language = 'ja';

// Use the mDNS name found in Step 2
googlehome.device('Google-Home-Mini-abc123def456', language);  // Replace with your actual mDNS name

googlehome.notify('こんにちは', function(res) {
  console.log(res);
});
```

**Notes**: 
- If you have multiple Google Home devices, check the IP address in Google Home app first, then find the corresponding mDNS name with find-devices.js
- mDNS names are unique per device, ensuring correct identification
- Works reliably even when IP addresses change

#### Listener
If you want to run a listener, follow the steps below.
You can run this from a Raspberry Pi, PC or Mac. 
The example uses ngrok so the server can be reached from outside your network. 
I tested with ifttt.com Maker channel and it worked like a charm.

**Setup Steps:**

```sh
$ git clone https://github.com/noelportugal/google-home-notifier
$ cd google-home-notifier
$ npm install

# First, find your device's mDNS name
$ node find-devices.js

# Set the mDNS name in example.js deviceName variable, then run
$ node example.js
```

Once the server starts, you'll see:
```
Endpoints:
    http://localhost:8091/google-home-notifier
    https://xxxxx.ngrok.io/google-home-notifier
```

**Usage Examples:**

GET requests:
```sh
curl -X GET https://xxxxx.ngrok.io/google-home-notifier?text=Hello+Google+Home
curl -X GET https://xxxxx.ngrok.io/google-home-notifier?text=http%3A%2F%2Fdomain%2Ffile.mp3
```

POST requests:
```sh
curl -X POST -d "text=Hello Google Home" https://xxxxx.ngrok.io/google-home-notifier
curl -X POST -d "text=http://domain/file.mp3" https://xxxxx.ngrok.io/google-home-notifier
```
#### Raspberry Pi
If you are running from Raspberry Pi make sure you have the following before nunning "npm install":
Use the latest nodejs dist.
```sh
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install nodejs
```
Also install these packages:
```sh
sudo apt-get install git-core libnss-mdns libavahi-compat-libdnssd-dev
```

## After "npm install"

Modify the following file "node_modules/mdns/lib/browser.js"
```sh
vi node_modules/mdns/lib/browser.js
```
Find this line:
```javascript
Browser.defaultResolverSequence = [
  rst.DNSServiceResolve(), 'DNSServiceGetAddrInfo' in dns_sd ? rst.DNSServiceGetAddrInfo() : rst.getaddrinfo()
, rst.makeAddressesUnique()
];
```
And change to:
```javascript
Browser.defaultResolverSequence = [
  rst.DNSServiceResolve(), 'DNSServiceGetAddrInfo' in dns_sd ? rst.DNSServiceGetAddrInfo() : rst.getaddrinfo({families:[4]})
, rst.makeAddressesUnique()
];
```
