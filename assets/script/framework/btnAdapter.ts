
import { _decorator, Component, Button, Node } from "cc";
const { ccclass, property, menu, requireComponent, disallowMultiple } = _decorator;
import { AudioManager } from "./audioManager";


@ccclass("BtnAdapter")
@menu('自定义组件/BtnAdapter')
@requireComponent(Button)
@disallowMultiple
export class BtnAdapter extends Component {

    /**
     * 点击后是否播放点击音效
     * @property isPlaySound
     * @type {Boolean}
     * @default true
     */
    @property({ tooltip: '点击后是否播放点击音效' })
    isPlaySound: Boolean = true;

    /**
     * 点击音效名
     * @property clickSoundName
     * @type {String}
     * @default true
     */
    @property({ tooltip: '点击音效名' })
    clickSoundName: string = 'click';

    /**
     * 是否禁止快速二次点击
     * @property isPreventSecondClick
     * @type {Boolean}
     * @default true
     */
    @property({ tooltip: '是否禁止快速二次点击' })
    isPreventSecondClick: Boolean = false;

    /**
     * 点击后多久才能再次点击,仅isPreventSecondClick为true生效
     * @property preventTime
     * @type {number}
     * @default true
     */
    @property({ tooltip: '点击后多久才能再次点击,仅isPreventSecondClick为true生效' })
    preventTime: number = 2;

    start () {
        const button = this.node.getComponent(Button) as Button;
        //Node.EventType.CLICK 没有定义
        this.node.on('click', () => {
            if (this.isPreventSecondClick) {
                button.interactable = false;
                this.scheduleOnce(() => {
                    if (button.node) button.interactable = true;
                }, this.preventTime);
            }

            if (this.isPlaySound) AudioManager.instance.playSound(this.clickSoundName, false);
        });
    }

    // update (dt) {},
};
