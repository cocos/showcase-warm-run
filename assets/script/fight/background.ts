
import { _decorator, Component, Node, Prefab, CameraComponent, view, Vec3, ModelComponent } from 'cc';
import { Constant } from '../framework/constant';
import { PoolManager } from '../framework/poolManager';
import { GameManager } from './gameManager';
const { ccclass, property } = _decorator;

let v3_1 = new Vec3();
@ccclass('Background')
export class Background extends Component {
    @property(Prefab)
    sceneViewPrefab: Prefab = null!;

    private _instanceCount: number = 3;
    private _parent: GameManager = null!;
    private _camera: CameraComponent = null!;
    private _distantViewArr: Node[] = [];

    start () {
        // [3]
        //优化网格清理 
        let models: ModelComponent[] = this.node.getComponentsInChildren(ModelComponent);
        models.forEach((value: ModelComponent) => {
            value.mesh?._nativeAsset.slice(0, 0);
        });

    }

    public setParent(parent: GameManager, camera: CameraComponent) {
        this._parent = parent;
        this._camera = camera;
        this._createBackground();
    }

    /**
     * 创建场景所需元素
     */
    private _createBackground() {
        while(this.node.children.length) {
            PoolManager.instance.putNode(this.node.children[0]);
        }
        let x: number = 0;
        for (let i = 0; i < this._instanceCount; i++) {
            let node: Node = PoolManager.instance.getNode(this.sceneViewPrefab, this.node);
            v3_1.set(x, 0, 0);
            node.position = v3_1;
            this._distantViewArr.push(node);
            x += Constant.SCENE_VIEW_WIDTH;
        }
    }

    /**
     * 设置场景状态为初始状态
     */
    public init() {
        let x: number = 0;
        for (let i = 0; i < this._instanceCount; i++) {
            let node: Node = this._distantViewArr[i];
            v3_1.set(x, 0, 0);
            node.position = v3_1;
            x += Constant.SCENE_VIEW_WIDTH;
        } 
    }

    /**
     * 更新场景背景
     */
    public updateBackground() {
        for (let i = 0; i < this._instanceCount; i++) {
            let node: Node = this._distantViewArr[i];
            let position: Vec3 = node.position;
            if (position.x + Constant.SCENE_VIEW_WIDTH * 1.5 <= this._camera.node.position.x) {
                v3_1.set(position.x + Constant.SCENE_VIEW_WIDTH * 3, 0, 0);
                node.position = v3_1;
            }
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
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */