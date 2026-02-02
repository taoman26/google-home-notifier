# google-home-notifier
Google Home/Nestに通知を送信します。
- 本リポジトリは、noelportugal氏のgoogle-home-notifierをフォークし、Pull requests #55を適用し、example.jsで日本語をデフォルト化したものです。
noelportugal氏のソースではgoogle-tts-api 0.0.2が使用されていますが、2.0.2 を使用しています。
2025年5月現在、google-tts-api 0.0.2ではGoogle Home/Nestで発話できませんのでご注意ください。

#### インストール
```sh
$ npm install google-home-notifier
```

#### 使用方法

**ステップ1: Google HomeアプリでIPアドレスを確認**

使用したいデバイスのIPアドレスをGoogle Homeアプリで確認します：
1. Google Homeアプリを開く
2. 使用したいデバイスを選択
3. 設定（歯車アイコン）→「デバイス情報」
4. IPアドレスをメモ（例: 192.168.1.20）

**ステップ2: デバイスのmDNS名を取得**

find-devices.jsを実行して、ステップ1で確認したIPアドレスに対応するmDNS名を見つけます：
```sh
$ node find-devices.js
```

出力例：
```
============================================================
Device #1
============================================================
Friendly Name: [Not available]
IP Address:    192.168.1.20  ← Google Homeアプリで確認したIPアドレス
mDNS Name:     Google-Home-Mini-abc123def456  ← この値を使用（例）

To use this device, add this line to example.js:

  var deviceName = 'Google-Home-Mini-abc123def456';
============================================================
```

**ステップ3: デバイス名を設定**

ステップ1で確認したIPアドレスと一致するデバイスのmDNS名をコピーし、
example.jsの`deviceName`変数に設定します：
```javascript
var deviceName = 'Google-Home-Mini-abc123def456';  // 実際のmDNS名に置き換えてください
```

**ステップ4: プログラムから使用**

```javascript
var googlehome = require('google-home-notifier');
var language = 'ja';

// ステップ2で見つけたmDNS名を使用
googlehome.device('Google-Home-Mini-abc123def456', language);  // 実際のmDNS名に置き換えてください

googlehome.notify('こんにちは', function(res) {
  console.log(res);
});
```

**注意**: 
- 複数のGoogle Homeデバイスがある場合は、Google HomeアプリでIPアドレスを確認してから、find-devices.jsでそのIPに対応するmDNS名を見つけてください
- mDNS名は各デバイスで一意なので、複数デバイスでも正しく識別できます
- IPアドレスが変わってもmDNS名は変わらないため、安定して動作します

#### リスナー
リスナーを実行したい場合は、以下の手順に従ってください。
これはRaspberry Pi、PC、Macから実行できます。
この例ではngrokを使用しているため、サーバーはネットワーク外からアクセスできます。
ifttt.com Makerチャンネルでテストしたところ、問題なく動作しました。

**セットアップ手順:**

```sh
$ git clone https://github.com/noelportugal/google-home-notifier
$ cd google-home-notifier
$ npm install

# まず、使用するデバイスのmDNS名を確認
$ node find-devices.js

# 出力されたmDNS名をexample.jsのdeviceNameに設定してから実行
$ node example.js
```

サーバーが起動すると以下のように表示されます：
```
エンドポイント:
    http://localhost:8091/google-home-notifier
    https://xxxxx.ngrok.io/google-home-notifier
```

**使用例:**

GETリクエスト:
```sh
curl -X GET https://xxxxx.ngrok.io/google-home-notifier?text=Hello+Google+Home
curl -X GET https://xxxxx.ngrok.io/google-home-notifier?text=http%3A%2F%2Fdomain%2Ffile.mp3
```

POSTリクエスト:
```sh
curl -X POST -d "text=Hello Google Home" https://xxxxx.ngrok.io/google-home-notifier
curl -X POST -d "text=http://domain/file.mp3" https://xxxxx.ngrok.io/google-home-notifier
```
#### Raspberry Pi
Raspberry Piから実行している場合は、"npm install"を実行する前に以下のものがあることを確認してください。
最新のnodejsディストリビューションを使用します。
```sh
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install nodejs
```
また、これらのパッケージもインストールしてください：
```sh
sudo apt-get install git-core libnss-mdns libavahi-compat-libdnssd-dev
```

## "npm install"の後

以下のファイルを修正してください "node_modules/mdns/lib/browser.js"
```sh
vi node_modules/mdns/lib/browser.js
```
次の行を探します：
```javascript
Browser.defaultResolverSequence = [
  rst.DNSServiceResolve(), 'DNSServiceGetAddrInfo' in dns_sd ? rst.DNSServiceGetAddrInfo() : rst.getaddrinfo()
, rst.makeAddressesUnique()
];
```
そして次のように変更します：
```javascript
Browser.defaultResolverSequence = [
  rst.DNSServiceResolve(), 'DNSServiceGetAddrInfo' in dns_sd ? rst.DNSServiceGetAddrInfo() : rst.getaddrinfo({families:[4]})
, rst.makeAddressesUnique()
];
```
