
import { _decorator, Component, Node, LabelComponent, Widget, sys } from 'cc';
import { GameManager } from '../../fight/gameManager';
import { ClientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
import { PlayerData } from '../../framework/playerData';
import { UIManager } from '../../framework/uiManager';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData'

const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Settlement
 * DateTime = Fri Oct 29 2021 15:06:24 GMT+0800 (中国标准时间)
 * Author = yanli.huang
 * FileBasename = settlement.ts
 * FileBasenameNoExtension = settlement
 * URL = db://assets/script/ui/fight/settlement.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('Settlement')
export class Settlement extends Component {
    @property(LabelComponent)
    scoreLabel: LabelComponent = null!;

    @property(LabelComponent)
    bestScoreLabel: LabelComponent = null!;

    @property(Node)
    newNode: Node = null!;

    @property(Node)
    settingNode: Node = null!;

    private _parent: GameManager = null!;

    start () {
        // [3]
        if (sys.platform === sys.Platform.WECHAT_GAME) {
            let widget: Widget = this.settingNode.getComponent(Widget) as Widget;
            let wigetRight: number = 200;
            widget.right = 200;
            widget.updateAlignment();
        }
    }

    public show (parent: GameManager, isNew: boolean) {
        i18n.updateSceneRenderers();

        this._parent = parent;
        this.bestScoreLabel.string = PlayerData.instance.playerInfo[Constant.PLAYER_BEST_SCORE];
        this.scoreLabel.string = PlayerData.instance.score + '';
        if (isNew) {
            this.newNode.active = true;
        } else {
            this.newNode.active = false
        }
    }

    /**
     * 点击设置按钮
     */
    public onBtnSettingClick () {
        UIManager.instance.showDialog(Constant.PANEL_NAME.SETTING, []);
    }

    /**
     * 点击开始按钮
     */
    public onBtnPlayClick () {
        ClientEvent.dispatchEvent(Constant.EVENT_NAME.GAME_START);
        UIManager.instance.hideDialog(Constant.PANEL_NAME.SETTLEMENT);
    }

    /**
     * 点击首页按钮
     */
    public onBtnHomeClick () {
        ClientEvent.dispatchEvent(Constant.EVENT_NAME.GAME_RESET, false);
        UIManager.instance.hideDialog(Constant.PANEL_NAME.SETTLEMENT);
    }
    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.3/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.3/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.3/manual/zh/scripting/life-cycle-callbacks.html
 */
