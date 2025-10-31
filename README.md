# wRogueClone
Pure JS RogueClone (porting study)

# References
* [Rogue5.4](http://rogue.rogueforge.net/rogue-5-4/) original rogue source code
* [wGCs](https://github.com/e3sh/WebGameCoreSystem) Display and Input Control
        (https://e3sh.github.io/WebGameCoreSystem/documents/) Documents

Incomplete, in progress

##　完全移植は目指さない
最終目標　機能削除して最低限動くようにする（ゲームエンジン機能の学習と参考で）
- 移動・操作の簡略化
- ・回数指定や部屋内の自動移動の削除
- ・アクションコマンドの簡略化（装備やイベント、バトルやアイテム使用を選択式にする）
- ・操作系の見直し（移動をテンキーで行い、コマンドキーは省略）
- 表示の改善
- ・文字をアイコンで表示する（未実施）
- ・任意の名前を割り当てなし。（変名もアイテムをアイコンにする場合はなしでよい）

現在の仕様
- ・回数指定を削除したことにより操作不能や遅くなる効果の薬は効果が出てくれない(表示のみ)
- ・アイテム使用後にアイテムを指定する操作がないので識別は一括して効果が発生する
- ・指輪は左指から優先して装備する。

既知の不具合
- ・様々な効果が正しく発生しているか検証出来ていません。
- ・表示周りもオリジナルと同じように表示されていないと思われます。
- ・オブジェクトリスト処理周りも怪しい動作あり
（Cのプログラムそのままの形でのリスト処理の為、javascriptに変更時参照の処理で誤り記述している可能性あり。
オブジェクテーブルで処理するように変更したいが全体の処理見直しが必要になる為、一先ずは一通り機能の実装を目指す

2025/10末
