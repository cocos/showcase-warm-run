import { _decorator, Component, Node, SpriteFrame, SpriteComponent, EditBox } from 'cc';
import { AudioManager } from '../../framework/audioManager';
import { Constant } from '../../framework/constant';
import { PlayerData } from '../../framework/playerData';
import { UIManager } from '../../framework/uiManager';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData'

const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Setting
 * DateTime = Tue Oct 26 2021 13:55:11 GMT+0800 (中国标准时间)
 * Author = yanli.huang
 * FileBasename = setting.ts
 * FileBasenameNoExtension = setting
 * URL = db://assets/script/ui/home/setting.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('Setting')
export class Setting extends Component {
    @property(SpriteFrame)
    spMusicOff: SpriteFrame = null!;

    @property(SpriteFrame)
    spMusicOn: SpriteFrame = null!;

    @property(SpriteFrame)
    spSoundOff: SpriteFrame = null!;

    @property(SpriteFrame)
    spSoundOn: SpriteFrame = null!;

    @property(SpriteComponent)
    soundSprite: SpriteComponent = null!;

    @property(SpriteComponent)
    musicSprite: SpriteComponent = null!;

    @property(Node)
    debugNode: Node = null!;

    @property(Node)
    debugBtnNode: Node = null!;

    @property(EditBox)
    debugEditBox: EditBox = null!;

    private _debugId: number = 0;

    start () {
        // [3]
        this.debugNode.active = false;
    }

    public show () {
        i18n.updateSceneRenderers();

        this.soundSprite.spriteFrame = AudioManager.instance.getAudioSetting(false) ? this.spSoundOff : this.spSoundOn;
        this.musicSprite.spriteFrame = AudioManager.instance.getAudioSetting(true) ? this.spMusicOff : this.spMusicOn;
        let flag: boolean = PlayerData.instance.getSetting(Constant.DEBUG_INFO.INVINCIBLE);
        let equipmentId: string = PlayerData.instance.getSetting(Constant.DEBUG_INFO.EQUIPMENT_ID);
        this.debugEditBox.string = equipmentId ? equipmentId + '' : '';
        (this.debugBtnNode.getComponent(SpriteComponent) as SpriteComponent).grayscale = !flag;
    }

    /**
     * 点击关闭按钮
     */
    public onBtnCloseClick () {
        UIManager.instance.hideDialog(Constant.PANEL_NAME.SETTING)
    }

    /**
     * 点击音效按钮
     */
    public onBtnSoundClick () {
        if (AudioManager.instance.getAudioSetting(false)) {
            this.soundSprite.spriteFrame = this.spSoundOn;
            AudioManager.instance.closeSound();
        } else {
            this.soundSprite.spriteFrame = this.spSoundOff;
            AudioManager.instance.openSound();
        }

    }

    /**
     * 点击音乐按钮
     */
    public onBtnMusicClick () {
        if (AudioManager.instance.getAudioSetting(true)) {
            this.musicSprite.spriteFrame = this.spMusicOn;
            AudioManager.instance.closeMusic();
        } else {
            this.musicSprite.spriteFrame = this.spMusicOff;
            AudioManager.instance.openMusic();
        }
    }

    /**
     * 点击调试按钮
     */
    public onBtnDebug1Click () {
        this._debugId++;
        if (this._debugId > 3) {
            this.debugNode.active = true;
        }
    }

    /**
     * 点击无敌模式按钮
     */
    public onBtnDebug2Click () {
        let flag: boolean = PlayerData.instance.getSetting(Constant.DEBUG_INFO.INVINCIBLE);
        PlayerData.instance.setSetting(Constant.DEBUG_INFO.INVINCIBLE, !flag);
        (this.debugBtnNode.getComponent(SpriteComponent) as SpriteComponent).grayscale = flag;
    }

    /**
     * 编辑框结束
     */
    public onEditingReturn () {
        PlayerData.instance.setSetting(Constant.DEBUG_INFO.EQUIPMENT_ID, this.debugEditBox.string);
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
