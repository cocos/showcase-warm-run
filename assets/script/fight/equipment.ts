
import { _decorator, Component, Node, CameraComponent, Vec3, Prefab, SkeletalAnimationComponent, AnimationState, AnimationComponent, ParticleSystemComponent } from 'cc';
import { AudioManager } from '../framework/audioManager';
import { Constant } from '../framework/constant';
import { LocalConfig } from '../framework/localConfig';
import { PlayerData } from '../framework/playerData';
import { PoolManager } from '../framework/poolManager';
import { ResourceUtil } from '../framework/resourceUtil';
import { Util } from '../framework/util';
import { EquipmentItem } from './equipmentItem';
import { GameManager } from './gameManager';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Equipment
 * DateTime = Wed Oct 27 2021 15:20:02 GMT+0800 (中国标准时间)
 * Author = yanli.huang
 * FileBasename = equipment.ts
 * FileBasenameNoExtension = equipment
 * URL = db://assets/script/fight/equipment.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

let v3_1 = new Vec3();
@ccclass('Equipment')
export class Equipment extends Component {
    private static FRAGMENT_TABLE_NAME: string = 'fragment';
    private static FRAGMENT_DIFFICULTY_KEY_NAME: string = 'difficulty';
    private static EQUIPMENT_TABLE_NAME: string = 'equipment';
    private static EQUIPMENT_TYPE_KEY_NAME: string = 'type';

    // @property([Prefab])
    // equipmentArr: Prefab[] = [];

    @property({ serializable: true })
    defaultEquipmentId: string = '';

    private _parent: GameManager = null!;
    private _camera: CameraComponent = null!;
    private _currentFragment: number = 1;       //当前片段等级
    private _queue: Array<any> = [];            //片段信息
    private _currentItem: any = [];             //当前装置信息

    private _updateDistance: number = 0;        //展示距离
    private _updateInterval: number = 0;        //基础距离  
    public freezeState: boolean = false;       //冻住状态

    start () {
        // [3]
    }

    public setParent (parent: GameManager, camera: CameraComponent) {
        this._parent = parent;
        this._camera = camera;
        //道具预加载
        this.scheduleOnce(() => {
            let keys: string[] = Object.keys(Constant.EQUIPMENTS);
            keys.forEach((key: string, index) => {
                ((name: string, i: number) => {
                    this.scheduleOnce(() => {
                        ResourceUtil.loadModelRes(name).then((prefab: unknown) => {
                            PoolManager.instance.getNode(prefab as Prefab, this.node);

                        });
                    }, i * 0.5);
                })(Constant.EQUIPMENTS[key], index);
            });
        }, 2);
    }

    /**
     * 重置状态
     */
    public reset () {
        while (this.node.children.length) {
            PoolManager.instance.putNode(this.node.children[0]);
        }
    }

    /**
     * 道具设置为初始状态
     */
    public init () {
        this.reset();
        this.freezeState = false;
        this._currentFragment = 1;
        this._updateDistance = this._camera.node.position.x;
        this._getFragment();
        this._showFragmentItem();
    }

    /**
     * 更新装置
     * @param dt 
     */
    public updateEquipment (dt: number) {
        //当距离大于当前等级时，提升等级
        if (this._currentFragment <= Constant.GAME_DIFFICULTY.length && Constant.GAME_DIFFICULTY[this._currentFragment - 1] < this._camera.node.position.x) {
            this._currentFragment++;
        }

        //距离在一个场景长度之内的预加载
        if (this._updateDistance - this._camera.node.position.x < Constant.SCENE_VIEW_WIDTH) {
            this._showFragmentItem();
        }

        //超出一个场景之外的移除
        let i = 0;
        while (i < this.node.children.length) {
            let node: Node = this.node.children[i];
            if (this._camera.node.position.x - node.position.x > Constant.SCENE_VIEW_WIDTH / 2) {
                this._handleAnimation(node, false);
                PoolManager.instance.putNode(node);
            } else {
                i++;
            }
        }
    }

    /**
     * 获取当前片段
     */
    private _getFragment () {
        let allFragment = this._getAllFragmentByDifficulty(this._currentFragment);
        let arr = Object.keys(allFragment);
        if (!arr.length) {
            this._currentFragment--;
            this._getFragment();
            return;
        }
        let random = Util.getRandomInt(0, arr.length - 1);
        this._queue = allFragment[arr[random]];
        this._queue.sort((a, b) => {
            return parseInt(a.ID) - parseInt(b.ID);
        });
        this._updateInterval = this._updateDistance;
        this._getFragmentItem();
    }

    /**
     * 获取子片段
     */
    private _getFragmentItem () {
        this._currentItem = this._queue[0];
        this._updateDistance = this._updateInterval + this._currentItem.distance;
    }

    /**
     * 展示子片段
     */
    private _showFragmentItem () {
        if (this.defaultEquipmentId &&
            LocalConfig.instance.queryByID(Equipment.EQUIPMENT_TABLE_NAME, this.defaultEquipmentId)) {
            this._currentItem.equipmentId = this.defaultEquipmentId;
        }

        let equipmentId: string = PlayerData.instance.getSetting(Constant.DEBUG_INFO.EQUIPMENT_ID);
        if (LocalConfig.instance.queryByID(Equipment.EQUIPMENT_TABLE_NAME, equipmentId)) {
            this._currentItem.equipmentId = equipmentId;
        }

        this._createItem(this._currentItem);

        this._queue.shift();
        if (!this._queue.length) {
            this._getFragment();
            return;
        }

        if (this._queue.length) this._getFragmentItem();
    }

    /**
     * 获取当前等级片段
     * @param difficulty 等级
     * @returns 
     */
    private _getAllFragmentByDifficulty (difficulty: number) {
        let result: any = {};
        let fragment = LocalConfig.instance.getTable(Equipment.FRAGMENT_TABLE_NAME);
        for (let key in fragment) {
            if (fragment[key][Equipment.FRAGMENT_DIFFICULTY_KEY_NAME] === difficulty) {
                let itemKey = key.substring(1, 4);
                if (!result[itemKey]) result[itemKey] = [];
                result[itemKey].push(fragment[key]);
            }
        }
        return result;
    }

    /**
     * 创建equipment
     * @param item equipment信息
     */
    private _createItem (item: any) {
        let equipment: any = null;
        let id: number = parseInt(item.equipmentId);
        if (id === Constant.EQUIPMENT_TYPE.EQUIPMENT || id === Constant.EQUIPMENT_TYPE.PROP) {
            let arr: any = LocalConfig.instance.queryAll(Equipment.EQUIPMENT_TABLE_NAME, Equipment.EQUIPMENT_TYPE_KEY_NAME, id);
            let i: number = Util.getRandomInt(0, Object.keys(arr).length - 1);
            equipment = arr[Object.keys(arr)[i]];
        } else {
            equipment = LocalConfig.instance.queryByID(Equipment.EQUIPMENT_TABLE_NAME, item.equipmentId);
        }

        ((posX: number, speed: number) => {
            ResourceUtil.loadModelRes(equipment.prefab).then((prefab: unknown) => {
                let node: Node = PoolManager.instance.getNode(prefab as Prefab, this.node);
                let pos: Vec3 = node.position;
                v3_1.set(posX, pos.y, pos.z);
                node.setPosition(v3_1);
                let item: EquipmentItem = node.getComponent(EquipmentItem) as EquipmentItem;
                item.show(speed);
                this._handleAnimation(node, !this.freezeState);
            });
        })(this._updateDistance, item.speed);
    }

    /**
     * 播放音效
     * @param name 音效名称
     * @param loop 是否循环
     */
    public playAudio (name: string, loop: boolean) {
        if (name.indexOf('rattan') !== -1) name = 'rattan';
        AudioManager.instance.playSound('equipment/' + name, loop);
    }

    /**
    * 暂停音效
    */
    public stopAudio (name: string) {
        AudioManager.instance.stop('equipment/' + name);
    }

    update (deltaTime: number) {

        this.node.children.forEach((value: Node) => {
            // console.log('equipment' + value.name);
            let animation: AnimationComponent = value.getComponent(AnimationComponent) as AnimationComponent;
            if ((Math.abs(value.position.x - this._camera.node.position.x) < Constant.SCENE_VIEW_WIDTH / 4) && animation) { //道具没有音效
                let state: AnimationState = animation.getState(animation.defaultClip?.name as string);
                let time1: number = state.duration;
                let time2: number = 0; //音效播放时机
                let name: string = value.name;
                switch (name) {
                    case Constant.EQUIPMENTS.BIRDIE01:    //鸟
                        time2 = 2;
                        break;
                    case Constant.EQUIPMENTS.CHOMPER: //食人花
                        time2 = 2.40;
                        break;
                    case Constant.EQUIPMENTS.INSECTICIDE: //杀虫剂
                        time2 = 1.50;
                        break;
                    case Constant.EQUIPMENTS.MANTIS:  //螳螂
                        time2 = 2.81;
                        break;
                    case Constant.EQUIPMENTS.RATTAN_UP: //上面的藤蔓
                        time2 = 2.79;
                        break;
                    case Constant.EQUIPMENTS.RATTAN_DOWN://下面的藤蔓
                        time2 = 2.23;
                        break;
                    case Constant.EQUIPMENTS.THORN:   //地刺
                        time2 = 1.71;
                        break;
                    case Constant.EQUIPMENTS.PENDULUM: //钟摆
                        time2 = 1;
                        //moreThan = false;
                        break;
                    case Constant.EQUIPMENTS.TREE:    //树
                        time2 = 3.82;
                        break;
                    case Constant.EQUIPMENTS.STONE:    //石板
                        time2 = 0.5;
                        break;
                    case Constant.EQUIPMENTS.WINDMILL:    //风车
                        time2 = 0.2;
                        break;
                }
                let flag = state && state.time % time1 > time2;
                // console.log('state.time' + state.time);
                // if (!moreThan) flag = state && state.time % time1 < time2;
                let script: EquipmentItem = value.getComponent(EquipmentItem) as EquipmentItem;
                if (flag) {
                    if (!script.isPlaying) {
                        this.playAudio(name, false);
                        script.isPlaying = true;
                    }
                } else {
                    script.isPlaying = false;
                }
            }
        });

    }

    /**
     * 播放所有动画
     */
    public resumeAllAnimation () {
        this.freezeState = false;
        this.node.children.forEach((element: Node) => {
            this._handleAnimation(element, true);
        });
    }

    /**
     * 暂停所有动画
     */
    public pauseAllAnimation () {
        this.freezeState = true;
        this.node.children.forEach((element: Node) => {
            this._handleAnimation(element, false);
        });
    }

    /**
     * 动画处理
     * @param node 节点
     * @param isPlay 是否播放
     */
    private _handleAnimation (node: Node, isPlay: boolean) {
        let equipmentItem: EquipmentItem = node.getComponent(EquipmentItem) as EquipmentItem;
        let skeletalAni: SkeletalAnimationComponent = node.getComponent(SkeletalAnimationComponent) as SkeletalAnimationComponent;
        if (skeletalAni) {
            let state: AnimationState = skeletalAni.getState(skeletalAni.defaultClip?.name as string);
            state.setTime(0);
            state.sample();
            if (isPlay) {
                skeletalAni.play();
                state.speed = equipmentItem.speed;
            } else {
                skeletalAni.stop();
            }
        }


        let animation: AnimationComponent = node.getComponent(AnimationComponent) as AnimationComponent;
        if (animation) {
            let state: AnimationState = animation.getState(animation.defaultClip?.name as string);
            state.setTime(0);
            state.sample();
            if (isPlay) {
                animation.play();
                state.speed = equipmentItem.speed;
            } else {
                animation.stop();
            }
        }

        let animationArr: AnimationComponent[] = node.getComponentsInChildren(AnimationComponent) as AnimationComponent[];
        animationArr.forEach((value: AnimationComponent) => {
            let state: AnimationState = value.getState(value.defaultClip?.name as string);
            state.setTime(0);
            state.sample();
            if (isPlay) {
                value.play();
                state.speed = equipmentItem.speed;
            } else {
                value.stop();
            }
        });

        let particleArr: ParticleSystemComponent[] = node.getComponentsInChildren(ParticleSystemComponent) as ParticleSystemComponent[];
        particleArr.forEach((value: ParticleSystemComponent) => {
            value.clear();
            value.stop();
            if (isPlay) {
                value.play();
                value.simulationSpeed = equipmentItem.speed;
            }
        });
    }
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
