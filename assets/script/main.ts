
import { _decorator, Component, Node, CameraComponent, find, game, sys } from 'cc';
import { AudioManager } from './framework/audioManager';
import { Constant } from './framework/constant';
import { LocalConfig } from './framework/localConfig';
import { PlayerData } from './framework/playerData';
import { UIManager } from './framework/uiManager';
import { Util } from './framework/util';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    private _minLoadDuration: number = 5;//加载开屏最小持续时间
    start () {
        if (Util.checkIsLowPhone()) {
            game.frameRate = 30;
        }

        if (sys.platform == sys.Platform.WECHAT_GAME) {
            //@ts-ignore
            wx.showShareMenu({
                withShareTicket: true
            });
        }

        AudioManager.instance.init();
        PlayerData.instance.loadGlobalCache();
        if (!PlayerData.instance.userId) {
            PlayerData.instance.generateRandomAccount();
            console.log("###生成随机userId", PlayerData.instance.userId);
        }

        PlayerData.instance.loadFromCache();

        if (!PlayerData.instance.playerInfo || !PlayerData.instance.playerInfo.createDate) {
            PlayerData.instance.createPlayerInfo();
        }

        //加载CSV相关配置
        LocalConfig.instance.loadConfig(() => {
            UIManager.instance.showDialog(Constant.PANEL_NAME.HOME, []);
            this.scheduleOnce(() => {
                find("CanvasLogin")?.destroy();
                console.log("###开屏界面展示时长", Date.now() - Constant.LOGIN_TIME);
            }, this._minLoadDuration)

        })

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
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
