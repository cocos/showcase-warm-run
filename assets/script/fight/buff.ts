
import { _decorator, Component, ProgressBar, LabelComponent, Node, AnimationComponent, AnimationClip, find, Vec3, view, Size } from 'cc';
import { Constant } from '../framework/constant';
import { PoolManager } from '../framework/poolManager';
import { Worm } from './worm';
import * as i18n from '../../../extensions/i18n/assets/LanguageData'

const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Buff
 * DateTime = Tue Nov 02 2021 11:18:45 GMT+0800 (中国标准时间)
 * Author = yanli.huang
 * FileBasename = buff.ts
 * FileBasenameNoExtension = buff
 * URL = db://assets/script/fight/buff.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

let v3_1 = new Vec3();
@ccclass('Buff')
export class Buff extends Component {
    @property(ProgressBar)
    progressBar: ProgressBar = null!;

    @property(LabelComponent)
    textLabel: LabelComponent = null!;


    @property(LabelComponent)
    numLabel: LabelComponent = null!;

    private _parent: Worm = null!;
    private _propName: string = '';
    private _curProgress: number = 0;
    private _time: number = 0;

    start () {
        // [3]
    }

    public show (parent: Worm, name: string, text: string, time: number) {
        i18n.updateSceneRenderers();

        this._parent = parent;
        this.textLabel.node.getComponent(AnimationComponent)?.stop();
        this.numLabel.node.getComponent(AnimationComponent)?.stop();
        this._hideSnowFlakeEffect();

        this.progressBar.node.active = true;
        this.textLabel.node.active = true;
        this.numLabel.node.active = false;
        this.textLabel.string = text;


        if (name === Constant.EQUIPMENTS.GOLD || name === Constant.EQUIPMENTS.SILVER) {
            this.progressBar.node.active = false;
            this.textLabel.node.active = false;
            this.numLabel.node.active = true;
            this.numLabel.string = text;
            let animation: AnimationComponent = this.numLabel.node.getComponent(AnimationComponent) as AnimationComponent;
            animation.play();
            animation.on(AnimationComponent.EventType.FINISHED, () => {
                PoolManager.instance.putNode(this.node);
            });
            return;
        } else if (name === Constant.EQUIPMENTS.SNOW_FLAKE) {
            v3_1.set(0, 0, 0);
            this._parent.showPropEffect(Constant.PROP_EFFECTS.SNOW_FLAKE_EFFECT, v3_1);
        }

        if (this._propName) this._parent.buffDisappear(this._propName);
        this._propName = name;
        this._time = time;
        this.progressBar.progress = 1;
        this.textLabel.node.getComponent(AnimationComponent)?.play();
        this._parent.buffAppear(this._propName);
        this._startProgress();

    }

    private _startProgress () {
        this._curProgress = 0;
        this.unschedule(this._callbackFun);
        this.schedule(this._callbackFun, 0.08);
    }

    private _callbackFun () {
        this._curProgress += 80;
        this.progressBar.progress = (this._time * 1000 - this._curProgress) / (this._time * 1000);
        if (this._curProgress >= this._time * 1000) {
            this.close();
        }
    }

    public close () {
        if (this._propName) this._parent.buffDisappear(this._propName);
        this._propName = '';
        this._hideSnowFlakeEffect();
        this.unschedule(this._callbackFun);
        PoolManager.instance.putNode(this.node);
    }

    private _hideSnowFlakeEffect () {
        let node: Node = find('Canvas/' + Constant.PROP_EFFECTS.SNOW_FLAKE_EFFECT) as Node;
        if (node) {
            let animation: AnimationComponent = node.getComponent(AnimationComponent) as AnimationComponent;
            animation.play(Constant.SNOW_FLAKE_EFFECTS.OVER);
            animation.once(AnimationComponent.EventType.FINISHED, () => {
                PoolManager.instance.putNode(node);
            });
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
