
import { _decorator, Component, Node, SkeletalAnimationComponent, CameraComponent, Vec3, tween, AnimationState, AnimationComponent, AnimationClip, Tween, MeshRenderer, geometry, Prefab, ParticleSystemComponent, ModelComponent } from 'cc';
import { AudioManager } from '../framework/audioManager';
import { ClientEvent } from '../framework/clientEvent';
import { Constant } from '../framework/constant';
import { PlayerData } from '../framework/playerData';
import { PoolManager } from '../framework/poolManager';
import { ResourceUtil } from '../framework/resourceUtil';
import { Buff } from './buff';
import { EquipmentItem, OptionCollider } from './equipmentItem';
import { GameManager } from './gameManager';
const { ccclass, property } = _decorator;

let v3_1 = new Vec3();
let v3_2 = new Vec3();
@ccclass('Worm')
export class Worm extends Component {
    @property(SkeletalAnimationComponent)
    skeletalAni: SkeletalAnimationComponent = null!;

    @property(Node)
    actionNode: Node = null!;

    @property(CameraComponent)
    uiCamera: CameraComponent = null!;

    @property([Node])
    colliderArr: Node[] = [];

    @property(Node)
    leafNode: Node = null!;

    @property({ serializable: true })
    _showMesh = true;

    private _originScale: Vec3 = null!;

    @property
    set showMesh (value: boolean) {
        this._showMesh = value;
        this._handleMesh();
    }

    get showMesh () {
        return this._showMesh;
    }

    private _parent: GameManager = null!;
    private _camera: CameraComponent = null!;
    private _originPos: Vec3 = new Vec3();  //初始位置
    private _originSpeed: number = 0.02;     //初始速度
    private _currentSpeed: number = 0;      //当前速度
    private _increaseSpeed: number = 0;     //增加速度
    private _currentMoveX: number = 0;      //当前移动X
    private _oldMoveX: number = 0;          //前一个移动X
    private _isBlocked: boolean = false;    //被挡住状态
    private _increaseX: number = 0;         //增加的X值
    private _stoopTime: number = 0;         //弯腰时间
    private _maxAddSpeed = 0.1;             //最大增加速度
    private _animationSpeed: number = 1;    //动画播放速度
    private _tween: Tween<Node> = null!;
    private _increaseRatio: number = 5;  // 越小约远。与最大加速有关
    private _tweenTime: number = 0;
    private _dieCallback: Function = null!;
    private _buffNode: Node = null!;
    private _isCreateWallowSplash: boolean = false;


    /**
    * 障碍物碰撞范围显示
    * @param node 
    */
    private _handleMesh () {
        for (let i = 0, c = this.colliderArr.length; i < c; i++) {
            let node: Node = this.colliderArr[i] as Node;
            let meshRenderer: MeshRenderer = node.getComponent(MeshRenderer) as MeshRenderer;
            meshRenderer.enabled = this._showMesh;
        }
    }

    start () {
        // [3]        
        this._handleMesh();
        //优化网格清理 
        let models: ModelComponent[] = this.node.getComponentsInChildren(ModelComponent);
        models.forEach((value: ModelComponent) => {
            value.mesh?._nativeAsset.slice(0, 0);
        });
        this._originScale = this.skeletalAni.node.getScale();
        this._originPos = this.node.position.clone();
        this.skeletalAni.on(AnimationComponent.EventType.FINISHED, (type: string, state: AnimationState) => {
            if (state.name === Constant.SKELETAL_ANIMATION_NAME.STOOP && this._stoopTime) {
                this._increaseSpeed = this._maxAddSpeed;
                this._increaseX = this._maxAddSpeed / this._increaseRatio;
                if (this._tween) this._tween.stop();
                this._playAnimation(Constant.SKELETAL_ANIMATION_NAME.STOOP_KEEP);
            } else if (state.name === Constant.SKELETAL_ANIMATION_NAME.STOOP && !this._stoopTime) {
                this._increaseSpeed = 0;
                this._increaseX = 0;
                if (this._tween) this._tween.stop();
                this._playAnimation(Constant.SKELETAL_ANIMATION_NAME.GREAT_WAGGLE);
            } else if (state.name === Constant.SKELETAL_ANIMATION_NAME.GREAT_WAGGLE) {
                this._increaseSpeed = 0;
                this._playAnimation(Constant.SKELETAL_ANIMATION_NAME.LITTLE_WAGGLE);
            } else if (state.name === Constant.SKELETAL_ANIMATION_NAME.BACKWARD_DEATH) {
                this._dieCallback && this._dieCallback();
                this._dieCallback = null!;
            }
        });

        this.actionNode.on(Node.EventType.TRANSFORM_CHANGED, () => {
            let state: AnimationState = this.skeletalAni.getState(Constant.SKELETAL_ANIMATION_NAME.STOOP);
            let radio: number = 10;
            let time: number = state.time;
            let duration: number = state.duration;
            let range: number = state.playbackRange.max - state.playbackRange.min;
            let dt = (Date.now() - this._tweenTime) / 1000;
            if (this._stoopTime) {
                this._increaseSpeed = state.time / radio + time / duration * dt * this._maxAddSpeed;
                if (isNaN(this._increaseSpeed) || this._increaseSpeed > this._maxAddSpeed) {
                    this._increaseSpeed = this._maxAddSpeed;
                }
            } else {
                this._increaseSpeed = (range - time) / duration * (1 - dt) * this._maxAddSpeed;

                if (isNaN(this._increaseSpeed) || this._increaseSpeed < 0) {
                    this._increaseSpeed = 0;
                }

            }
            this._increaseX = this._increaseSpeed / this._increaseRatio;
            // console.log('this._increaseX', duration - time, (duration - time) / duration * (1 - dt));
        });
    }

    public setParent (parent: GameManager, camera: CameraComponent) {
        this._parent = parent;
        this._camera = camera;
        this.reset();
    }

    /**
     * 重置状态
     */
    public reset () {
        this.leafNode.active = false;
        this.node.setPosition(this._originPos.clone());
        this._animationSpeed = 1;
        if (this._buffNode) this._buffNode.getComponent(Buff)?.close();
        this._buffNode = null!;
        this.skeletalAni.play(Constant.SKELETAL_ANIMATION_NAME.IDLE);
    }

    /**
     * 状态设置成初始状态
     */
    public init (isRelive: boolean = false) {
        if (!isRelive) {
            this.node.setPosition(this._originPos.clone());
            this._currentMoveX = 0;
            this._oldMoveX = 0;
        } else {
            let pos: Vec3 = this.node.position;
            v3_1.set(pos.x, this._originPos.y, this._originPos.z);
            this.node.setPosition(v3_1);
        }
        this._currentSpeed = 0;
        this._increaseSpeed = 0;
        this._increaseX = 0;
        this._isBlocked = false;
        this._animationSpeed = 1;
        this._isCreateWallowSplash = false;
        this._playAnimation(Constant.SKELETAL_ANIMATION_NAME.LITTLE_WAGGLE);
    }

    public move (dt: number) {
        // 角色移动
        let speed = this._originSpeed + this._camera.node.position.x / 500;
        this._currentSpeed = (speed + this._increaseSpeed);
        let moveDis = this._currentSpeed * dt;

        this._animationSpeed = 1 + Math.sqrt(this._currentSpeed) / this._originSpeed * 0.001;

        if (!this._isBlocked) {
            this._currentMoveX += moveDis;
            let pos: Vec3 = this._camera.node.position;
            v3_1.set(pos.x + moveDis, pos.y, pos.z);
            this._camera.node.setPosition(v3_1);
            pos = this.node.position;
            v3_1.set(this._camera.node.position.x - GameManager.CAMERA_SEP + this._increaseX, pos.y, pos.z);
            this.node.setPosition(v3_1);
        }

        if (!this._oldMoveX || this._oldMoveX + Constant.SCENE_VIEW_WIDTH / 8 < this._currentMoveX) {
            this._oldMoveX = this._currentMoveX;
            ClientEvent.dispatchEvent(Constant.EVENT_NAME.GET_SCORE);
        }

        this._isBlocked = false;

        if (this._buffNode) {
            if (!this._buffNode.parent) {
                this._buffNode = null!;
                return;
            }
            let pos: Vec3 = this.node.worldPosition;
            v3_1.set(pos.x, pos.y + 0.04, pos.z);
            this._camera.worldToScreen(v3_1, v3_1);
            this.uiCamera.screenToWorld(v3_1, v3_1);
            this._buffNode.setWorldPosition(v3_1);
        }
    }

    //弯腰
    stoop () {
        this._stoopTime = Date.now();
        this._increaseSpeed = 0;
        this._setRunAnim();
        this._tweenTime = Date.now();
        let state: AnimationState = this.skeletalAni.getState(Constant.SKELETAL_ANIMATION_NAME.STOOP);
        v3_1.set(state.duration, state.duration, state.duration);
        this._tween = tween(this.actionNode)
            .by(state.duration, { position: v3_1 }, { easing: 'linear' })
            .start();
    }

    //还原
    recovery () {
        this._stoopTime = 0;
        this._tweenTime = Date.now();
        this._setBackAnim();
        this._tweenTime = Date.now();
        let state: AnimationState = this.skeletalAni.getState(Constant.SKELETAL_ANIMATION_NAME.STOOP);
        v3_1.set(state.duration, state.duration, state.duration);
        this._tween = tween(this.actionNode)
            .by(state.duration, { position: v3_1 }, { easing: 'linear' })
            .start();
    }

    /**
     * 设置为跑的动作
     * @param cb 回调函数
     */
    private _setRunAnim () {
        let stoopName: string = Constant.SKELETAL_ANIMATION_NAME.STOOP;
        let state: AnimationState = this.skeletalAni.getState(stoopName);
        let time: number = state.time;
        state.speed = this._animationSpeed;
        state.wrapMode = AnimationClip.WrapMode.Normal;
        if (state.isPlaying) {
            state.playbackRange = {
                min: time,
                max: state.duration
            }
        } else {
            state.playbackRange = {
                min: 0,
                max: state.duration
            }
        }
        this.skeletalAni.play(Constant.SKELETAL_ANIMATION_NAME.STOOP);
    }

    /**
     * 设置撤回动画
     */
    private _setBackAnim () {
        let stoopName: string = Constant.SKELETAL_ANIMATION_NAME.STOOP;
        let state: AnimationState = this.skeletalAni.getState(stoopName);
        let time: number = state.time > 0 ? state.time : 0.01;
        state.speed = this._animationSpeed;
        state.wrapMode = AnimationClip.WrapMode.Reverse;
        if (state.isPlaying) {
            state.playbackRange = {
                min: 0,
                max: time
            }
        } else {
            state.playbackRange = {
                min: 0,
                max: state.duration
            }
        }
        this.skeletalAni.play(Constant.SKELETAL_ANIMATION_NAME.STOOP);
    }

    /**
     * 设置死亡动画
     */
    public setDieAnim (cb: Function) {
        this._dieCallback = cb;
        this.skeletalAni.play(Constant.SKELETAL_ANIMATION_NAME.BACKWARD_DEATH);
    }

    /**
     * 播放虫虫动作
     * @param name 动作名称
     */
    private _playAnimation (name: string) {
        let state: AnimationState = this.skeletalAni.getState(name);
        state.speed = this._animationSpeed;
        this.skeletalAni.play(name);
    }

    //碰撞检测
    public checkCollision (deltaTime: number) {
        //无敌模式不检测碰撞
        let invincible: boolean = PlayerData.instance.getSetting(Constant.DEBUG_INFO.INVINCIBLE);
        if (invincible) return;

        let wallowSplashNode: Node = this.node.parent?.getChildByName(Constant.PROP_EFFECTS.WALLOW_SPLASH) as Node;
        let isWallowCollision: boolean = false;
        for (let i = 0; i < this.colliderArr.length; i++) {
            let node1: Node = this.colliderArr[i];
            let collArr: EquipmentItem[] = this._parent.equipmentNode.getComponentsInChildren(EquipmentItem);
            for (let j: number = 0; j < collArr.length; j++) {
                if (!collArr[j].node.active) continue;
                let optionArr: OptionCollider[] = collArr[j].colliderArr;
                for (let k: number = 0; k < optionArr.length; k++) {
                    let node2: Node = optionArr[k].collider;
                    let distance: number = Vec3.distance(node1.worldPosition, node2.worldPosition);
                    if (distance > 0.1) continue;
                    if (collArr[j].node.name === Constant.EQUIPMENTS.RATTAN_UP ||
                        collArr[j].node.name === Constant.EQUIPMENTS.RATTAN_DOWN) {
                        //上下藤蔓子弹特殊处理 未播放到喷射子弹
                        if (node2.parent?.scale.x !== 1 || distance > 0.02) continue;
                    }
                    let obb1: geometry.OBB = new geometry.OBB();
                    let obb2: geometry.OBB = new geometry.OBB();
                    obb1.halfExtents = this._getScale(node1).clone();
                    obb2.halfExtents = this._getScale(node2).clone();
                    obb1.translateAndRotate(node1.worldMatrix, node1.worldRotation, obb1);
                    obb2.translateAndRotate(node2.worldMatrix, node2.worldRotation, obb2);
                    if (geometry.intersect.obbWithOBB(obb1, obb2) && !collArr[j].isCollision) {
                        if (optionArr[k].isBlock) {
                            this._isBlocked = true;
                        } else if (collArr[j].isProp) {
                            collArr[j].isCollision = true;
                            this._handleProp(collArr[j].node);
                            console.log('collArr[j].node' + collArr[j].node.uuid, collArr[j].node.position);
                        } else if (collArr[j].node.name === Constant.EQUIPMENTS.WALLOW) {
                            if (this._parent.equipment.freezeState) return;
                            isWallowCollision = true;
                            if (collArr[j].collisionDt === 0) this._parent.equipment.playAudio(collArr[j].node.name, true);
                            collArr[j].collisionDt += deltaTime;
                            let downY = collArr[j].collisionDt * 0.1 / this._currentSpeed;
                            // console.log('downY', downY);
                            let pos: Vec3 = this.node.position;
                            let splashDistance: number = 5;
                            let dieDistance: number = 20;
                            if (downY > dieDistance) {
                                this._isCreateWallowSplash = false;
                                if (wallowSplashNode) PoolManager.instance.putNode(wallowSplashNode);
                                this._parent.equipment.stopAudio(collArr[j].node.name);
                                collArr[j].isCollision = true;
                                v3_1.set(pos.x, this._originPos.y, this._originPos.z);
                                this.showPropEffect(Constant.PROP_EFFECTS.WALLOW_DIE_EFF, v3_1);
                                this._playDeathSound(collArr[j].node.name);
                                ClientEvent.dispatchEvent(Constant.EVENT_NAME.GAME_OVER);
                                return;
                            }
                            v3_1.set(pos.x, this._originPos.y - downY / 1000, this._originPos.z);
                            this.node.setPosition(v3_1);
                            v3_1.set(pos.x, this._originPos.y, this._originPos.z);
                            if (downY > splashDistance && wallowSplashNode) {
                                this._isCreateWallowSplash = false;
                                wallowSplashNode.setPosition(v3_1);
                            } else if (downY > splashDistance && !this._isCreateWallowSplash) {
                                this._isCreateWallowSplash = true;
                                this.showPropEffect(Constant.PROP_EFFECTS.WALLOW_SPLASH, v3_1);
                            }
                        } else {
                            collArr[j].isCollision = true;
                            if (this.leafNode.active) {
                                this.leafNode.active = false;
                                AudioManager.instance.playSound(Constant.AUDIO_SOUND.LEAF_DISAPPEARED, false);
                                this.showPropEffect(Constant.PROP_EFFECTS.LEAF_BROKEN, this.node.worldPosition);
                                return;
                            }
                            this._playDeathSound(collArr[j].node.name);
                            ClientEvent.dispatchEvent(Constant.EVENT_NAME.GAME_OVER);
                        }
                    }
                }
            }
        }

        if (!isWallowCollision && this.node.position.y !== this._originPos.y) {
            this._isCreateWallowSplash = false;
            if (wallowSplashNode) PoolManager.instance.putNode(wallowSplashNode);
            this._parent.equipment.stopAudio(Constant.EQUIPMENTS.WALLOW);
            let pos: Vec3 = this.node.position;
            v3_1.set(pos.x, this._originPos.y, this._originPos.z);
            this.node.setPosition(v3_1);
        }
    }

    private _getScale (node: Node) {
        Vec3.multiplyScalar(v3_1, node.scale, 0.5);
        if (node.parent) {
            Vec3.multiply(v3_1, v3_1, node.parent.scale as Vec3);
            if (node.parent.parent) {
                Vec3.multiply(v3_1, v3_1, node.parent.parent.scale as Vec3);
            }
        }
        return v3_1;
    }

    update (deltaTime: number) {
        // [4]
    }

    private _playDeathSound (name: string) {
        let soundName: string = 'death/';
        switch (name) {
            case Constant.EQUIPMENTS.BIRDIE01: // 小鸟
            case Constant.EQUIPMENTS.TREE: // 树
            case Constant.EQUIPMENTS.STONE: // 石板
                AudioManager.instance.playSound(soundName + Constant.AUDIO_SOUND.CRUSHED, false);
                AudioManager.instance.playSound(soundName + Constant.AUDIO_SOUND.CHIP_DEATH, false);
                break;
            case Constant.EQUIPMENTS.CHOMPER: // 食人花
                AudioManager.instance.playSound(soundName + Constant.AUDIO_SOUND.CUTTED, false);
                AudioManager.instance.playSound(soundName + Constant.AUDIO_SOUND.SLICE_DEATH, false);
                break;
            case Constant.EQUIPMENTS.INSECTICIDE: //杀虫剂
            case Constant.EQUIPMENTS.RATTAN_UP: //上面的藤蔓
            case Constant.EQUIPMENTS.RATTAN_DOWN: //下面的藤蔓
            case Constant.EQUIPMENTS.THORN: //地刺
            case Constant.EQUIPMENTS.PENDULUM: //钟摆
            case Constant.EQUIPMENTS.WINDMILL: //风车
                AudioManager.instance.playSound(soundName + Constant.AUDIO_SOUND.FALL_DEATH, false);
                break;
            case Constant.EQUIPMENTS.MANTIS: //螳螂
                AudioManager.instance.playSound(soundName + Constant.AUDIO_SOUND.CUT_IN_HALF_DEATH, false);
                break;
            case Constant.EQUIPMENTS.WALLOW: //泥洼
                AudioManager.instance.playSound(soundName + Constant.AUDIO_SOUND.SINK_DEATH, false);
                break;
        }
    }

    /**
     * 道具逻辑处理
     * @param name 道具名
     */
    private _handleProp (node: Node) {
        switch (node.name) {
            case Constant.EQUIPMENTS.LEAF:
                this.leafNode.active = true;
                break;
            case Constant.EQUIPMENTS.GOLD:
                //金币加10
                ClientEvent.dispatchEvent(Constant.EVENT_NAME.GET_SCORE, Constant.GOLD_SCORE);
                this._showBuff(node.name, Constant.PROP_TEXT.GOLD);
                break;
            case Constant.EQUIPMENTS.MINIFY:
                //香肠变小
                this._showBuff(node.name, Constant.PROP_TEXT.MINIFY, Constant.BUFF_LASTING_TIME.SMALLER);
                this.showPropEffect(Constant.PROP_EFFECTS.MINIFY_EFFECTS, this.node.worldPosition);
                break;
            case Constant.EQUIPMENTS.LARGEN:
                //香肠变大
                this._showBuff(node.name, Constant.PROP_TEXT.LARGEN, Constant.BUFF_LASTING_TIME.BIGGER);
                this.showPropEffect(Constant.PROP_EFFECTS.LARGEN_EFFECTS, this.node.worldPosition);
                break;
            case Constant.EQUIPMENTS.SILVER:
                //分数加1
                ClientEvent.dispatchEvent(Constant.EVENT_NAME.GET_SCORE, Constant.SILVER_SCORE);
                this._showBuff(node.name, Constant.PROP_TEXT.SILVER);
                break;
            case Constant.EQUIPMENTS.SNOW_FLAKE:
                //障碍停止
                this._showBuff(node.name, Constant.PROP_TEXT.SNOW_FLAKE, Constant.BUFF_LASTING_TIME.FROZEN);
                break;
        }
        AudioManager.instance.playSound(Constant.AUDIO_SOUND.EAT_PROP, false);
        this.showPropEffect(Constant.PROP_EFFECTS.PROPS_EAT, node.worldPosition);
        PoolManager.instance.putNode(node);
    }

    /**
     * 显示buff
     * @param name 道具名
     * @param text 道具文案
     * @param time 展示时间
     */
    private _showBuff (name: string, text: string, time: number = 0) {
        if (this._buffNode) {
            this._buffNode.getComponent(Buff)?.close();
        }
        ResourceUtil.getUIPrefabRes(Constant.PANEL_NAME.BUFF, (err: any, prefab: Prefab) => {
            this._buffNode = PoolManager.instance.getNode(prefab, this.uiCamera.node.parent as Node);
            this._buffNode.getComponent(Buff)?.show(this, name, text, time);
        });
    }

    /**
     * 显示道具特效
     * @param name 特效名
     */
    public showPropEffect (name: string, worldPos: Vec3) {
        let parent: Node = this.node;
        if (name === Constant.PROP_EFFECTS.SNOW_FLAKE_EFFECT) {
            parent = this.uiCamera.node.parent as Node;
        } else if (name === Constant.PROP_EFFECTS.WALLOW_SPLASH) {
            parent = this.node.parent as Node;
        }

        ResourceUtil.loadEffectRes(name).then((prefab: unknown) => {
            let node: Node = PoolManager.instance.getNode(prefab as Prefab, parent);
            if (name === Constant.PROP_EFFECTS.SNOW_FLAKE_EFFECT) {
                node.setPosition(worldPos);
            } else {
                node.setWorldPosition(worldPos);
            }

            let particleSystemArr: ParticleSystemComponent[] = node.getComponentsInChildren(ParticleSystemComponent) as ParticleSystemComponent[];
            let time: number = 0;
            particleSystemArr.forEach((value: ParticleSystemComponent) => {
                value.clear();
                value.stop();
                value.play();
                if (time < value.duration) {
                    time = value.duration;
                }
            });

            if (name === Constant.PROP_EFFECTS.SNOW_FLAKE_EFFECT) {
                let animation: AnimationComponent = node.getComponent(AnimationComponent) as AnimationComponent;
                animation.play(Constant.SNOW_FLAKE_EFFECTS.START);
                animation.once(AnimationComponent.EventType.FINISHED, () => {
                    animation.play(Constant.SNOW_FLAKE_EFFECTS.IDLE);
                });
            } else if (name !== Constant.PROP_EFFECTS.WALLOW_SPLASH) {
                this.scheduleOnce(() => {
                    PoolManager.instance.putNode(node);
                }, time);
            }
        });
    }

    /**
     * 显示buff效果
     * @param name 
     */
    public buffAppear (name: string) {
        if (name === Constant.EQUIPMENTS.SNOW_FLAKE) {
            this._parent.equipment.pauseAllAnimation();
        } else if (name === Constant.EQUIPMENTS.LARGEN) {
            Vec3.multiplyScalar(v3_1, this._originScale, 1.2);
            this.skeletalAni.node.setScale(v3_1);
        } else if (name === Constant.EQUIPMENTS.MINIFY) {
            Vec3.multiplyScalar(v3_1, this._originScale, 0.8);
            this.skeletalAni.node.setScale(v3_1);
        }
    }

    /**
     * buff效果消失
     * @param name 
     */
    public buffDisappear (name: string) {
        if (name === Constant.EQUIPMENTS.SNOW_FLAKE) {
            this._parent.equipment.resumeAllAnimation();
        } else if (name === Constant.EQUIPMENTS.LARGEN) {
            this.skeletalAni.node.setScale(this._originScale);
        } else if (name === Constant.EQUIPMENTS.MINIFY) {
            this.skeletalAni.node.setScale(this._originScale);
        }
    }
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
