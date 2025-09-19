
import { _decorator, Component, Label, Node } from 'cc';
import { Constant } from '../../framework/constant';
import { UIManager } from '../../framework/uiManager';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData'
const { ccclass, property } = _decorator;

@ccclass('Help')
export class Help extends Component {
    @property(Label)
    lb1: Label = null!;

    @property(Label)
    lb2: Label = null!;

    public show () {
        i18n.updateSceneRenderers();

        if (i18n._language === Constant.I18_LANGUAGE.CHINESE) {
            this.lb1.string = '长按                                                           放开                       ';
            this.lb2.string = '        可以跑的更快                                            时速度会降低 ';
        } else {
            this.lb1.string = '       Long press                                          slow down                              ';
            this.lb2.string = '                      to go faster                                         when released ';
        }
    }

    /**
     * 点击关闭按钮
     */
    public onBtnCloseClick () {
        UIManager.instance.hideDialog(Constant.PANEL_NAME.HELP)
    }
}
