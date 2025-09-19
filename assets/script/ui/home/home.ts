
import { _decorator, Component, Node, LabelComponent, sys, Vec3, Widget, Label, Color } from 'cc';
import { AudioManager } from '../../framework/audioManager';
import { ClientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
import { PlayerData } from '../../framework/playerData';
import { UIManager } from '../../framework/uiManager';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData'

const { ccclass, property } = _decorator;
const LANGUAGE_LABEL_COLOR = {
    NONE: new Color(255, 255, 255),
    CHOOSE: new Color(0, 0, 0),
}

@ccclass('Home')
export class Home extends Component {
    @property(LabelComponent)
    scoreLabel: LabelComponent = null!;

    @property(Node)
    settingNode: Node = null!;

    @property(Node)
    dotNode: Node = null!;

    @property(Label)
    public languageZhLabel: Label = null!;

    @property(Label)
    public languageEnLabel: Label = null!;

    start () {
        // [3]
        //解决web界面一开始无音乐问题
        AudioManager.instance.stop(Constant.AUDIO_MUSIC.BACKGROUND);
        AudioManager.instance.playMusic(Constant.AUDIO_MUSIC.BACKGROUND, true);

        if (sys.platform === sys.Platform.WECHAT_GAME) {
            let widget: Widget = this.settingNode.getComponent(Widget) as Widget;
            let wigetRight: number = 200;
            widget.right = 200;
            widget.updateAlignment();
        }
    }

    public show () {
        this._initLanguage();

        this.scoreLabel.string = PlayerData.instance.playerInfo[Constant.PLAYER_BEST_SCORE] + '';
    }

    /**
     * 点击开始按钮
     */
    public onBtnPlayClick () {
        ClientEvent.dispatchEvent(Constant.EVENT_NAME.GAME_START);
        UIManager.instance.hideDialog(Constant.PANEL_NAME.HOME)
    }

    /**
     * 点击设置按钮
     */
    public onBtnSettingClick () {
        UIManager.instance.showDialog(Constant.PANEL_NAME.SETTING, []);
    }

    /**
     * 点击帮助按钮
     */
    public onBtnHelpClick () {
        UIManager.instance.showDialog(Constant.PANEL_NAME.HELP, []);
    }


    private _initLanguage () {
        let ndDotPos = this.dotNode.position;
        if (i18n._language === Constant.I18_LANGUAGE.ENGLISH) {
            this.dotNode.setPosition(27, ndDotPos.y, ndDotPos.z);

            this.languageZhLabel.color = LANGUAGE_LABEL_COLOR.NONE;
            this.languageEnLabel.color = LANGUAGE_LABEL_COLOR.CHOOSE;
        } else {
            this.dotNode.setPosition(-27, ndDotPos.y, ndDotPos.z);

            this.languageZhLabel.color = LANGUAGE_LABEL_COLOR.CHOOSE;
            this.languageEnLabel.color = LANGUAGE_LABEL_COLOR.NONE;
        }
    }

    public changeLanguage () {
        let ndDotPos = this.dotNode.position;
        let nowLanguage;
        if (i18n._language === Constant.I18_LANGUAGE.CHINESE) {
            nowLanguage = Constant.I18_LANGUAGE.ENGLISH;

            this.dotNode.setPosition(27, ndDotPos.y, ndDotPos.z);

            this.languageZhLabel.color = LANGUAGE_LABEL_COLOR.NONE;
            this.languageEnLabel.color = LANGUAGE_LABEL_COLOR.CHOOSE;
        } else {
            nowLanguage = Constant.I18_LANGUAGE.CHINESE;

            this.dotNode.setPosition(-27, ndDotPos.y, ndDotPos.z);

            this.languageZhLabel.color = LANGUAGE_LABEL_COLOR.CHOOSE;
            this.languageEnLabel.color = LANGUAGE_LABEL_COLOR.NONE;
        }

        i18n.init(nowLanguage);
        i18n.updateSceneRenderers();
    }
}