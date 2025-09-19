
import { _decorator, Component, Node, LabelComponent } from 'cc';
import { GameManager } from '../../fight/gameManager';
import { ClientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
import { PlayerData } from '../../framework/playerData';
import { UIManager } from '../../framework/uiManager';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData'

const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Relive
 * DateTime = Fri Oct 29 2021 15:05:27 GMT+0800 (中国标准时间)
 * Author = yanli.huang
 * FileBasename = relive.ts
 * FileBasenameNoExtension = relive
 * URL = db://assets/script/ui/fight/relive.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('Relive')
export class Relive extends Component {
    @property(LabelComponent)
    timeLabel: LabelComponent = null!;

    private _parent: GameManager = null!;
    private static COUNTDOWN_TIME: number = 5;
    private _countdown: number = Relive.COUNTDOWN_TIME;


    public show (parent: GameManager) {
        i18n.updateSceneRenderers();

        this._parent = parent;
        this._countdown = Relive.COUNTDOWN_TIME;
        this.timeLabel.string = this._countdown + '';

        this.unschedule(this._countdownCallback);
        this.schedule(this._countdownCallback, 1);
    }

    /**
     * 点击复活按钮
     */
    public onBtnReliveClick () {
        PlayerData.instance.relive();
        ClientEvent.dispatchEvent(Constant.EVENT_NAME.GAME_RELIVE);
        UIManager.instance.hideDialog(Constant.PANEL_NAME.RELIVE);
    }

    private _countdownCallback () {
        this.timeLabel.string = --this._countdown + '';
        if (this._countdown <= 0) {
            this.unschedule(this._countdownCallback);
            UIManager.instance.hideDialog(Constant.PANEL_NAME.RELIVE);
            this._parent.showSettlement();
        }
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
