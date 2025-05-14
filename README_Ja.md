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
```javascript
var googlehome = require('google-home-notifier');
var language = 'ja'; // 設定しない場合は'us'言語が使用されます

googlehome.device('Google Home', language); // あなたのGoogle Home名に変更してください
// またはGoogle HomeのIPアドレスがわかっている場合
// googlehome.ip('192.168.1.20', language);

googlehome.notify('こんにちは', function(res) {
  console.log(res);
});
```

#### リスナー
リスナーを実行したい場合は、example.jsファイルをご覧ください。これはRaspberry Pi、PC、Macから実行できます。
この例ではngrokを使用しているため、サーバーはネットワーク外からアクセスできます。
ifttt.com Makerチャンネルでテストしたところ、問題なく動作しました。

```sh
$ git clone https://github.com/noelportugal/google-home-notifier
$ cd google-home-notifier
$ npm install
$ node example.js
エンドポイント:
    http://192.168.1.20:8091/google-home-notifier
    https://xxxxx.ngrok.io/google-home-notifier
GETの例:
curl -X GET https://xxxxx.ngrok.io/google-home-notifier?text=Hello+Google+Home  - 指定したテキストを再生
curl -X GET https://xxxxx.ngrok.io/google-home-notifier?text=http%3A%2F%2Fdomain%2Ffile.mp3 - 指定したURLから再生
POSTの例:
curl -X POST -d "text=Hello Google Home" https://xxxxx.ngrok.io/google-home-notifier - 指定したテキストを再生
curl -X POST -d "http://domain/file.mp3" https://xxxxx.ngrok.io/google-home-notifier - 指定したURLから再生

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
