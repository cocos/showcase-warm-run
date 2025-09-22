
import { _decorator, Component, Node } from 'cc';
import { GameManager } from '../../fight/gameManager';
import { ClientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
import { UIManager } from '../../framework/uiManager';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData'

const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Pause
 * DateTime = Fri Oct 29 2021 15:05:33 GMT+0800 (中国标准时间)
 * Author = yanli.huang
 * FileBasename = pause.ts
 * FileBasenameNoExtension = pause
 * URL = db://assets/script/ui/fight/pause.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('Pause')
export class Pause extends Component {

    public show () {
        i18n.updateSceneRenderers();
    }

    /**
     * 点击关闭按钮
     */
    public onBtnCloseClick () {
        ClientEvent.dispatchEvent(Constant.EVENT_NAME.GAME_RESUME);
        UIManager.instance.hideDialog(Constant.PANEL_NAME.PAUSE)
    }

    /**
     * 点击开始按钮
     */
    public onBtnPlayClick () {
        ClientEvent.dispatchEvent(Constant.EVENT_NAME.GAME_RESUME);
        UIManager.instance.hideDialog(Constant.PANEL_NAME.PAUSE);
    }

    /**
     * 点击首页按钮
     */
    public onBtnHomeClick () {
        ClientEvent.dispatchEvent(Constant.EVENT_NAME.GAME_RESET, true);
        UIManager.instance.hideDialog(Constant.PANEL_NAME.PAUSE);
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
