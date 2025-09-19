
import { _decorator, Component, Node, MeshRenderer, ModelComponent } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Collider
 * DateTime = Fri Oct 29 2021 11:49:33 GMT+0800 (中国标准时间)
 * Author = yanli.huang
 * FileBasename = collider.ts
 * FileBasenameNoExtension = collider
 * URL = db://assets/script/fight/collider.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

 @ccclass('OptionCollider')
 export class OptionCollider{
    @property(Node)
    collider: Node = null!;
 
    @property
    isBlock: boolean = false;
 }
 
@ccclass('EquipmentItem')
export class EquipmentItem extends Component {
    @property([OptionCollider])
    colliderArr: OptionCollider[] = [];

    @property({serializable: true})
    _showMesh = true;

    @property
    isProp: boolean = false;

    @property
    set showMesh (value: boolean) {
        this._showMesh = value;
        this._handleMesh();
    }

    get showMesh () {
        return this._showMesh;
    }

    public isPlaying: boolean = false;  //是否播放

    public isCollision: boolean = false;    //是否碰撞

    public collisionDt: number = 0;         //碰撞时间

    public speed: number = 1;               //播放速度

    start () {
        //优化网格清理 
        let models: ModelComponent[] = this.node.getComponentsInChildren(ModelComponent);
        models.forEach((value: ModelComponent) => {
            value.mesh?._nativeAsset.slice(0, 0);
        });
    }

     /**
     * 障碍物碰撞范围显示
     * @param node 
     */
    private _handleMesh () {
        for (let i = 0, c = this.colliderArr.length; i < c; i++) {
            let node: Node = this.colliderArr[i].collider as Node;
            let meshRenderer: MeshRenderer = node.getComponent(MeshRenderer) as MeshRenderer;
            meshRenderer.enabled = this._showMesh;
        }
    }

    public show(speed: number) {
        this.speed = speed;
        this.isCollision = false;
        this.isPlaying = false;
        this.collisionDt = 0;
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
