
import { _decorator, Component, Node, LabelComponent, Widget, sys } from 'cc';
import { GameManager } from '../../fight/gameManager';
import { ClientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
import { UIManager } from '../../framework/uiManager';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData'

const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = FightUI
 * DateTime = Wed Oct 27 2021 14:55:39 GMT+0800 (中国标准时间)
 * Author = yanli.huang
 * FileBasename = fightUI.ts
 * FileBasenameNoExtension = fightUI
 * URL = db://assets/script/ui/fight/fightUI.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('FightUI')
export class FightUI extends Component {
    @property(LabelComponent)
    scoreLabel: LabelComponent = null!;

    @property(Node)
    pauseNode: Node = null!;


    @property(Node)
    tipsNode: Node = null!;

    private _parent: GameManager = null!;
    private _lastScore: number = 0;

    start () {
        // [3]
        if (sys.platform === sys.Platform.WECHAT_GAME) {
            let widget: Widget = this.pauseNode.getComponent(Widget) as Widget;
            let wigetRight: number = 200;
            widget.right = 200;
            widget.updateAlignment();
        }
    }

    public show (parent: GameManager) {
        this._parent = parent;
        this.scoreLabel.string = this._lastScore + '';
        this.tipsNode.active = true;
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.tipsNode.active = false;
        }, 5);

        i18n.updateSceneRenderers();
    }

    /**
     * 点击暂停按钮
     */
    public onBtnStopClick () {
        if (!this._parent.isGameStart) return;
        ClientEvent.dispatchEvent(Constant.EVENT_NAME.GAME_PAUSE);
        UIManager.instance.showDialog(Constant.PANEL_NAME.PAUSE, []);
    }

    update (deltaTime: number) {
        // [4]
        if (this._parent && this._parent.currentScore !== this._lastScore) {
            this._lastScore = this._parent.currentScore;
            this.scoreLabel.string = this._lastScore + '';
        }
    }
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
