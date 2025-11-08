# wRogueClone
```
Pure JS RogueClone (porting study)
Base　Rogue5.4.4
5ch-dnc-th16 2025.11.01 456
```
# References
* [Rogue5.4](http://rogue.rogueforge.net/rogue-5-4/) original rogue source code
* [wGCs](https://github.com/e3sh/WebGameCoreSystem) Display and Input Control
        (https://e3sh.github.io/WebGameCoreSystem/documents/) Documents
```
##　移植による変更点
* 移動・操作の簡略化
- ・操作系の見直し:GamePad対応
- ・アクションは選択アイテムにより自動判定
- ・回数指定でのコマンド指示や部屋・通路の自動移動は機能削除
- ・任意の名前を割り当てる機能削除
- ・スコアボード未実装
* 現在の仕様
- ・識別は持参の対象アイテムに一括して効果が発生する
- ・指輪は左指から優先して装備する（外す場合は一旦Dropする）

2025/11/08
```
