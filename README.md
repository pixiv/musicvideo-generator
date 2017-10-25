# musicvideo-generator
ミュージックビデオを生成する, Web APIを利用したECMAScript 2017ライブラリです.
最新のMozilla FirefoxやGoogle Chromium, Electron 1.6.11と互換性があります.
NPMパッケージとして作成されています.

このパッケージは[Pawoo Music](https://music.pawoo.net/)で使用されています.

## バグ
サンプルレートが異なると, 異なる出力が発生します.

> OfflineAudioContextがまともに対応しないことには始まらない. 早すぎたんだ…

## バンドリング
musicvideo-generatorは内部に画像, 動画などのJavaScript以外のファイルを含みます.
バンドリングする際には注意することがあります.

https://github.com/defunctzombie/package-browser-field-spec
に従ってバンドリング用のエントリーポイントを提供しています.

当該エントリーポイントではJavaScript以外のファイルへのパスのリテラルを引数として`require`関数を呼んでいます.
この関数はそれらのファイルへのURLを返す必要があります.

JavaScript以外のファイルは`assets`ディレクトリに置かれています.

## PixiJS
PixiJSのshared tickerは使用していませんが, 通常だと自動的に開始し, CPU時間を消費します.
無効にするには`require('musicvideo-generator')`を最初に実行する実行コンテキストでshared
tickerの`autoStart`プロパティを偽に設定してください.

## API

### CommonJSモジュール
musicvideo-generatorはCommonJSモジュールです.
`Canvas`と`RgbaEmitter`という2つのコンストラクタをプロパティとして持つオブジェクトをエクスポートしています.

#### `Canvas`
`Canvas`は動画を描画するHTMLCanvasElementを作成します.
Mozilla FirefoxやGoogle Chromium, Electronで動作します.

##### 引数

###### 第1引数
`AudioContext`です. `AnalyserNode`はこの`AudioContext`に紐付けられます.

###### 第2引数
paramsです. ただし, `fps`を省略した場合`requestAnimationFrame`に同期します.

###### 第3引数
楽曲の現在再生されている時間を返すクロージャです. 単位は秒です.

##### メソッド

###### `getRenderer`
描画を行う`PIXI.WebGLRenderer`を取得するメソッドです.

###### `changeParams`
第1引数に指定されたparamsを適用するメソッドです. 一部の処理は非同期で実行されます.
インスタンス生成時に無効となった効果を追加することはできません.
このメソッドは`initialize`メソッドが既に実行されている場合には更新後に1フレーム描画します.

###### `initialize`
初期化するメソッドです. `start`メソッドの呼び出し前とシーク後に呼び出す必要があります.
一部の処理は非同期で実行されます. このメソッドは最初のフレームも同時に描画します.

###### `start`
描画を開始するメソッドです.

###### `stop`
描画を停止するメソッドです.

#### `RgbaEmitter`

`RgbaEmitter`は経過時間によらず描画を行い,
その結果を出力するNode.jsのreadable streamです. Electronで動作します.

##### プロパティ

###### `audioAnalyserNode`
`AnalyserNode`です. サンプリングレートは小さくても22,050 Hzでなければなりません.

#### 引数

##### 第1引数
`AudioBuffer`です.

##### 第2引数
paramsです.

#### 出力
`readPixels`に`format`として`RGBA`, `type` として`UNSIGNED_BYTE`を指定して読み出したフレームを時刻順に出力します.
解像度は横720縦720ピクセル. 曲1秒あたり30フレーム出力されます. 更に,
曲が終わったあと1フレーム追加されます.

### オブジェクト

#### params
paramsは調整を必要とするパラメーターをプロパティにもつオブジェクトです.

あるプロパティの値が`null`, `undefined`, または指定されていない場合を「省略された」とします.

##### `fps`
FPSです.

##### `image`
背景画像です. `PIXI.Texture.from`が受け付けるものと同様です. 省略した場合,
背景は黒になります.

##### `blur`
ぼかし効果について指定します. 省略した場合, ぼかし効果は無効になります.

###### `visible`
可視かどうかを指定します. 省略した場合, 可視となります.

###### `movement`
動きに関わるlimitです.

###### `blink`
明暗の変化に関わるlimitです.

##### `particle`
パーティクルについて指定します. 省略した場合, パーティクルは無効になります.

###### `visible`
可視かどうかを指定します. 省略した場合, 可視となります.

###### `limit`
パーティクルの大きさなどの変化に関わるlimitです.

###### `alpha`
パーティクルの不透明度です.

###### `color`
パーティクルの色です. 表現の仕方はPixiJSと同一です.

##### `lightLeaks`
ライトリークについて指定するオブジェクトです. 省略した場合, ライトリークは無効になります.

###### `visible`
可視かどうかを指定します. 省略した場合, 可視となります.

###### `alpha`
ライトリークの不透明度です.

###### `interval`
ライトリークの間隔です. 単位は秒です.

##### `spectrum`
波長表示について指定するオブジェクトです. 省略した場合, 波長は無効になります.

###### `visible`
可視かどうかを指定します. 省略した場合, 可視となります.

###### `mode`
波長表示のモードです. 0は直線カラム, 1は円カラム, 2は円連続, 3は直線塗りつぶしです.
実際の動作は`example/canvas`を参照してください.

###### `alpha`
波形表示の不透明度です.

###### `color`
波長表示の色です. 表現の仕方はPixiJSと同一です.

##### `text`
表示する文字について指定するオブジェクトです. 省略した場合, 文字は無効になります.

###### `visible`
可視かどうかを指定します. 省略した場合, 可視となります.

###### `alpha`
文字列の不透明度です.

###### `color`
文字列の色です.

###### `title`
アルバムの題名です. 省略した場合, 題名は表示されません.

###### `sub`
アルバムの副題です. 省略した場合, 副題は表示されません.

#### limit

limitは音の急激な変化を感知する際に必要なパラメーターを指定するオブジェクトです.

##### `band`
観察する音の周波数を指定するオブジェクトです.
[`bottom`, `top`)の範囲が観察されます. 単位はヘルツです.

##### `threshold`
しきい値です.

> 150くらい : めっちゃ反応する
> 175くらい : 良い感じに反応する
> 205くらい : あんまり反応しない 海苔波形向け

## 規格
以下の規格に準拠しています.

[defunctzombie/package-browser-field-spec: Spec document for the 'browser' field in package.json](https://github.com/defunctzombie/package-browser-field-spec)

[CommonJS Modules](http://www.commonjs.org/specs/modules/1.0/)

[CommonJS Packages](http://wiki.commonjs.org/wiki/Packages/1.0)

[ECMAScript® 2017 Language Specification (ECMA-262, 8th edition, June 2017)](https://www.ecma-international.org/ecma-262/8.0/)

ただし未対応の環境で大きなpolyfillが必要となるasync関数定義, ジェネレーター関数定義は無効です.
また, 変換無しでバージョンが明示して指定されているElectron 1.6.11で動作する必要があります.

[HTML Standard](https://html.spec.whatwg.org/)

[Web Audio API](https://www.w3.org/TR/webaudio/)

## 利用許諾

音楽とオープンソースソフトウェアを愛するピクシブ株式会社により,
AGPL-3.0の下での利用を許諾されています. 詳細は`COPYING` (英語) を参照してください.
また, `example`には著作権者が異なるファイルが含まれます. 詳細は`COPYING_EXAMPLE` (英語)
を参照してください.
