import { _decorator, Component, game, Node, assetManager, director, LabelComponent } from 'cc';
import { Constant } from '../../framework/constant';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData'

//挂载到login场景下的canvas节点
const { ccclass, property } = _decorator;

@ccclass('Login')
export class Login extends Component {
    @property(Node)
    public ndCanvas: Node = null!;

    @property(LabelComponent)
    public numberLabel: LabelComponent = null!;

    /**
     * 初始化i18n
     * @param nowLanguage 
     */
    private _initLanguage (nowLanguage?: string) {
        if (i18n.ready) return;
        if (!nowLanguage) {
            nowLanguage = Constant.I18_LANGUAGE.CHINESE;
        }
        i18n.init(nowLanguage);
    }

    protected onLoad (): void {
        this._initLanguage();
    }

    start () {
        console.log("login");
        director.addPersistRootNode(this.ndCanvas);

        Constant.LOGIN_TIME = Date.now();

        let bundleRoot = ["resources", "main"];
        let arr: any = [];

        //微信优化开屏加载性能
        //@ts-ignore
        if (window.wx) {
            bundleRoot.forEach((item: string) => {
                let p = new Promise((resolve, reject) => {
                    assetManager.loadBundle(item, function (err, bundle) {
                        if (err) {
                            return reject(err);
                        }

                        resolve(bundle);
                    });
                })

                arr.push(p);
            })

            Promise.all(arr).then(() => {
                director.loadScene("main", () => {
                }, () => {

                })
            })
        } else {
            director.loadScene("main", () => {
            }, () => {

            })
        }

        if (!this.numberLabel) return;
        this.numberLabel.string = '0';
        this.schedule(() => {
            let num: number = parseInt(this.numberLabel.string);
            if (num < 99) {
                num++;
                this.numberLabel.string = num + '';
            }
        }, 0.01);
    }
}
