import { _decorator, Component, Node, AnimationComponent, AnimationState } from "cc";
import { AudioManager } from "../../framework/audioManager";
import { Constant } from "../../framework/constant";
const { ccclass, property } = _decorator;

@ccclass("readyGo")
export class readyGo extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property(AnimationComponent)
    ani: AnimationComponent = null!;

    start () {
        // Your initialization goes here.
    }

    show (callback: Function) {
        this.ani.play();
        // let state: AnimationState = this.ani.getState('countDownAni');
        // state.setTime(0);
        // state.sample();
        this.ani.once(AnimationComponent.EventType.FINISHED, ()=>{
            callback && callback();
        });
    }

    tick () {
        AudioManager.instance.playSound(Constant.AUDIO_SOUND.TICK);
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
