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
- ・回数指定や部屋内の自動移動の削除（通路の移動は自動でもよい
- ・アクションコマンドの簡略化（装備やイベント、バトルやアイテム使用を選択式にする）
- ・操作系の見直し（移動をテンキーで等、コマンドキーは段階的に省略）
- 表示の改善
- ・文字をアイコンで表示する
- ・任意の名前を割り当てなし。（変名もアイテムをアイコンにする場合はなしでよい）

操作系案
itemselect/use digit
1234567890-^\  shift page

788 move numkey
4+6
123
