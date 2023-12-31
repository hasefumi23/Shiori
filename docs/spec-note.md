# Shiori の仕様メモ

以下の「作りたい chrome extension」に書いたような chrome extension を作ることを考えています。
いい名前を提案してください。
できれば日本語的な単語を選びたいと思っています。
「Chikamichi」という chrome extension は、日本語的であり、その機能を端的に表現することに成功しているので、そのような名前付けが理想的です。

## 作りたい chrome extension

```txt
ブラウザでwebページを見ているときに、メモを取りたいことがある。
そういう時に、サクッとメモを取ることができるchrome extensionを作りたい。
ctrl-iを押すと、inputが出てきて、メモを入力してenterを押すと保存される。
メモを1行のみ入力できるinputと、複数行入力できるtextareaの2つを用意する。
また、タグを入力することもできる。が、タグの入力は、優先度低。
保存したメモをエクスポートすることができる。期間を指定して。1日単位。
メモは、最終更新日時を持っていて、エクスポートする時は、その日付を見る。
エクスポートしたメモは、markdownで出力される。出力する項目は選択することができる。
メモは、一週間や一ヶ月などの定期的な振り返りに使うことを想定している。
```

chatgpt と相談して、思織（Shiori）にすることにした。

> 思織（Shiori）：「思」は思考を、「織」は織りなす、つくるという意味をそれぞれ持っています。また、「しおり」はブックマークの意味もあるため、Web ページを見ながら思ったことを織りなす、またはブックマークのように使えるメモというイメージができます。

その時のやりとり: https://chat.openai.com/share/bb504adb-03b2-4bab-8d20-1477e375ff42

## 仕様

- ショートカットを押せば、モーダル的な画面が表示されてメモを取れる
  - 選択しているテキストがあれば、引用された状態でメモに追加される
    - この機能を追加するためには、input ではなく textArea にする必要がある
- メモは、url 毎に保存される
  - https://example.com と https://example.com/hoge は別のメモになる
  - スキーマはみないため、http と https は同じメモになる
- メモはエクスポートすることができる
  - 期間を絞ることができる
    - 1 日、1 周間、1 月、日付指定
- メモを取るときに vim を使うことができる
  - これは firenvim でいいかもしれない
- 入力した文字列をシンプルに追加するだけのモードがある
- 名前
  - push-memo
  - shiori
- ui
  - メモを追記する(追記オンリー)
    - ポップアップ
    - ショートカット(ctrl+i)
  - メモを編集する(対象のメモ全体を編集できる)
    - ポップアップ
    - ショートカット(ctrl+shift+i)
  - メモをエクスポートする
    - 日付を指定できるカレンダー
  - メモを一覧できる
  - メモを編集する
    - 一覧ページからの遷移

## 画面詳細仕様

## 入力

- input タグを textarea に変更する

### 一覧

- 右側がメモの一覧
  - f: まずは、メモの一覧を表示する
  - 更新日の降順
    - 最近更新したものが上に来てほしい
  - ドメインごとのグルーピングなどは不要
  - 画像は不要
- 左側に設定？エリアがある
- メモの一覧は、以下の項目が表示されている
  - タイトル
  - url
  - 作成日
  - 最終更新日
  - メモの内容の一部
  - コピペボタン
- エクスポートボタン
  - 期間指定できる
    - デフォルトでは一週間
- この画面に編集機能をもたせるかどうか悩ましい

## モデル

```js
{
    [key: string]: { // keyは、`shioriNote:${hostname}${pathname}`で構成。例: shioriNote:example.com/hoge。`shioriNote:`は、prefixとして使う
        note: string, // メモ
        pageTitle: string, // ページのタイトル。メモのタイトルではない。メモのタイトルはない。
        createdAt: Date, // 何に使うかわからないが、とりあえず追加しておく
        updatedAt: Date, // ノートの一覧をフィルターする際に使いたい
        tags: string[], // 今は不要
    }
}
```

## オプション画面

- 一覧画面
  - 編集
  - 削除
- 設定画面
  - 出力のフォーマット
