
import { _decorator, Component, Node, CameraComponent, input, Input, tween, Vec3, Prefab, AnimationComponent, find } from 'cc';
import { ClientEvent } from '../framework/clientEvent';
import { Constant } from '../framework/constant';
import { PlayerData } from '../framework/playerData';
import { PoolManager } from '../framework/poolManager';
import { ResourceUtil } from '../framework/resourceUtil';
import { UIManager } from '../framework/uiManager';
import { Background } from './background';
import { Equipment } from './equipment';
import { Worm } from './worm';
const { ccclass, property } = _decorator;

let v3_1 = new Vec3();
@ccclass('GameManager')
export class GameManager extends Component {
    @property(CameraComponent)
    camera: CameraComponent = null!;

    @property(Node)
    bgNode: Node = null!;

    @property(Node)
    wormNode: Node = null!;

    @property(Node)
    equipmentNode: Node = null!;

    private static CAMERA_FOV_UI: number = 23;       //初始相机视角
    private static CAMERA_FOV_GAME: number = 32; //游戏中相机视角
    public static CAMERA_SEP: number = 0.04;      //虫虫和相机间隔距离

    private _background: Background = null!;
    private _worm: Worm = null!;
    public equipment: Equipment = null!;

    public isGameStart: boolean = false;
    private _isTouchFlag: boolean = false;
    private _currentCameraMove: number = 0;
    public currentScore: number = 0;


    public start () {
        // 创建远景
        this._background = this.bgNode.getComponent(Background) as Background;
        this._background.setParent(this, this.camera);

        this._worm = this.wormNode.getComponent(Worm) as Worm;
        this._worm.setParent(this, this.camera);

        this.equipment = this.equipmentNode.getComponent(Equipment) as Equipment;
        this.equipment.setParent(this, this.camera);
        this.camera.fov = GameManager.CAMERA_FOV_UI;
    }

    public onEnable () {
        ClientEvent.on(Constant.EVENT_NAME.GAME_START, this._onGameStart, this);
        ClientEvent.on(Constant.EVENT_NAME.GAME_OVER, this._onGameOver, this);
        ClientEvent.on(Constant.EVENT_NAME.GAME_PAUSE, this._onGamePause, this);
        ClientEvent.on(Constant.EVENT_NAME.GAME_RESUME, this._onGameResume, this);
        ClientEvent.on(Constant.EVENT_NAME.GAME_RELIVE, this._onGameRelive, this);
        ClientEvent.on(Constant.EVENT_NAME.GAME_RESET, this._onGameReset, this);
        ClientEvent.on(Constant.EVENT_NAME.GET_SCORE, this._onGetScore, this);

        input.on(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this._onTouchEnded, this);
        input.on(Input.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
    }

    public onDestroy () {
        ClientEvent.off(Constant.EVENT_NAME.GAME_START, this._onGameStart, this);
        ClientEvent.off(Constant.EVENT_NAME.GAME_OVER, this._onGameOver, this);
        ClientEvent.off(Constant.EVENT_NAME.GAME_PAUSE, this._onGamePause, this);
        ClientEvent.off(Constant.EVENT_NAME.GAME_RESUME, this._onGameResume, this);
        ClientEvent.off(Constant.EVENT_NAME.GAME_RELIVE, this._onGameRelive, this);
        ClientEvent.off(Constant.EVENT_NAME.GAME_RESET, this._onGameReset, this);
        ClientEvent.off(Constant.EVENT_NAME.GET_SCORE, this._onGetScore, this);


        input.off(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this._onTouchEnded, this);
        input.off(Input.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
    }

    /**
     * 游戏重置回调
     */
    private _onGameReset (isTransition: boolean) {
        if (!isTransition) {
            this._gameReset();
            UIManager.instance.showDialog(Constant.PANEL_NAME.HOME, []);
            return;
        }

        this._playTransition(() => {
            this._gameReset();
        }, () => {
            UIManager.instance.showDialog(Constant.PANEL_NAME.HOME, []);
        });
    }

    /**
    * 游戏重置
    */
    private _gameReset () {
        this._background.init();
        this._worm.reset();
        this.equipment.reset();
        let pos: Vec3 = this.camera.node.getPosition();
        v3_1.set(this.wormNode.position.x + GameManager.CAMERA_SEP, pos.y, pos.z)
        this.camera.node.setPosition(v3_1);
        this.camera.fov = GameManager.CAMERA_FOV_UI;
        UIManager.instance.hideDialog(Constant.PANEL_NAME.FIGHT_UI);
    }

    /**
     * 游戏开始
     */
    private _onGameStart () {
        this.currentScore = 0;
        this._isTouchFlag = false;
        this.equipment.init();
        UIManager.instance.showDialog(Constant.PANEL_NAME.FIGHT_UI, [this]);
        UIManager.instance.showDialog(Constant.PANEL_NAME.READY_GO, [() => {
            this._worm.init();
            this.isGameStart = true;
        }]);
    }


    /**
     * 游戏结束
     */
    private _onGameOver () {
        if (!this.isGameStart) {
            return;
        }

        this.isGameStart = false;
        let pos: Vec3 = this.camera.node.getPosition();
        v3_1.set(this.wormNode.position.x, pos.y, pos.z)
        tween(this.camera.node)
            .to(0.5, { position: v3_1 })
            .start();
        console.log(this.wormNode.position, this.camera.node.position);

        this._worm.setDieAnim(() => {
            if (PlayerData.instance.revivalCount < 1) {
                UIManager.instance.showDialog(Constant.PANEL_NAME.RELIVE, [this]);
            } else {
                this.showSettlement();
            }
        });
    }

    /**
     * 游戏暂停
     */
    private _onGamePause () {
        this.isGameStart = false;
    }

    /**
     * 游戏恢复
     */
    private _onGameResume () {
        UIManager.instance.showDialog(Constant.PANEL_NAME.READY_GO, [() => {
            this.isGameStart = true;
        }]);
    }

    /**
     * 游戏复活
     */
    private _onGameRelive () {
        this._worm.init(true);
        this.equipment.init();
        let pos: Vec3 = this.camera.node.getPosition();
        v3_1.set(this.wormNode.position.x + GameManager.CAMERA_SEP, pos.y, pos.z);
        this.camera.node.setPosition(v3_1);
        UIManager.instance.showDialog(Constant.PANEL_NAME.READY_GO, [() => {
            this.isGameStart = true;
        }]);
    }

    /**
     * 得分事件
     */
    private _onGetScore (num: number = 1) {
        this.currentScore += num;
    }

    /**
     * 触摸开始事件
     */
    private _onTouchStart () {
        console.log('onTouchStart');

        if (!this.isGameStart) return;
        if (this._isTouchFlag) return;

        this._isTouchFlag = true;
        this._worm.stoop();
    }

    /**
     * 触摸移动事件
     */
    private _onTouchMove () {
        console.log('onTouchMove');

    }

    /**
     * 触摸结束事件
     */
    private _onTouchEnded () {
        console.log('onTouchCancel');
        if (!this.isGameStart) return;
        if (!this._isTouchFlag) return;

        this._isTouchFlag = false;
        this._worm.recovery();
    }

    /**
     * 触摸取消事件
     */
    private _onTouchCancel () {
        console.log('onTouchCancel');
        if (!this.isGameStart) return

        if (!this._isTouchFlag) return

        this._isTouchFlag = false;
        this._worm.recovery();
    }

    update (deltaTime: number) {
        this._background.updateBackground();
        if (!this.isGameStart) return;

        // 摄像机视角大小从28渐变为32
        if (this.camera.fov < GameManager.CAMERA_FOV_GAME) {
            var minusRatio = 0.05;
            this.camera.fov += minusRatio;
        } else if (this.camera.fov > GameManager.CAMERA_FOV_GAME) {
            this.camera.fov = GameManager.CAMERA_FOV_GAME;
        }

        this._worm.move(deltaTime);
        this.equipment.updateEquipment(deltaTime);
        this._worm.checkCollision(deltaTime);
    }

    /**
     * 显示结算界面
     */
    public showSettlement () {
        let newFlag: boolean = false;
        this._playTransition(() => {
            this.camera.fov = GameManager.CAMERA_FOV_UI;
            newFlag = PlayerData.instance.gameOver(this.currentScore);
            UIManager.instance.hideDialog(Constant.PANEL_NAME.FIGHT_UI);
            this._gameReset();
        }, () => {
            UIManager.instance.showDialog(Constant.PANEL_NAME.SETTLEMENT, [this, newFlag]);
        })

    }

    /**
     * 过场动画
     * @param cb1 动画进入回调
     * @param cb2 动画常驻回调
     */
    private _playTransition (cb1: Function, cb2: Function) {
        ResourceUtil.loadEffectRes(Constant.TRANSITION_EFFECT_NAME).then((prefab: unknown) => {
            let node: Node = PoolManager.instance.getNode(prefab as Prefab, find('Canvas') as Node) as Node;
            let animation: AnimationComponent = node.getComponent(AnimationComponent) as AnimationComponent;
            animation.play(Constant.TRANSITION_IN_ANIMATION_NAME);
            animation.once(AnimationComponent.EventType.FINISHED, () => {
                cb1 && cb1();
                animation.play(Constant.TRANSITION_OUT_ANIMATION_NAME);
                animation.once(AnimationComponent.EventType.FINISHED, () => {
                    cb2 && cb2();
                    PoolManager.instance.putNode(node);
                });
            });
        });
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
