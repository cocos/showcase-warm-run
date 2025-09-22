import { Buff } from "../fight/buff";
import { Help } from "../ui/home/help";
import * as i18n from '../../../extensions/i18n/assets/LanguageData'

export class Constant {

    public static GAME_NAME = 'ccWorm';

    public static GAME_VERSION = '1.0.1';

    public static GAME_FRAME = 60;      //游戏当前帧率
    public static GAME_INIT_FRAME = 60; //游戏开发基础帧率

    //本地缓存key值
    public static LOCAL_CACHE = {
        PLAYER: 'player',               //玩家基础数据缓存，如金币砖石等信息，暂时由客户端存储，后续改由服务端管理
        SETTINGS: 'settings',           //设置相关，所有杂项都丢里面进去
        DATA_VERSION: 'dataVersion',    //数据版本
        ACCOUNT: 'account',                 //玩家账号
        // TMP_DATA: 'tmpData',             //临时数据，不会存储到云盘
        HISTORY: "history",                   //关卡通关数据
        BAG: "bag",                         //玩家背包，即道具列表，字典类型
    }

    public static AUDIO_MUSIC = {
        BACKGROUND: 'background',           //主界面背景音乐
    }

    public static AUDIO_SOUND = {
        CLICK: "click",              //点击
        EAT_PROP: "eatProp",         //吃到道具
        LEAF_DISAPPEARED: "leafDisappeared",  //叶子消失  
        FALL_DEATH: "fall",                //倒地死   
        CRUSHED: "crushed",                //被碾碎 
        SINK_DEATH: "sink",                 //下沉死
        CUTTED: "cutted",                //被切开
        CUT_IN_HALF_DEATH: "cutInHalf",                //切两段死
        SLICE_DEATH: "slice",                //切片死
        CHIP_DEATH: "chip",                //碎块死  
        TICK: "tick"                        //倒计时
    }

    public static PANEL_NAME = {
        HOME: 'home/home',        //   游戏主界面
        HELP: 'home/help',       //   游戏帮助界面
        SETTING: 'home/setting',        //   游戏设置界面
        FIGHT_UI: 'fight/fightUI',       //游戏中界面
        PAUSE: 'fight/pause',       //游戏暂停界面
        RELIVE: 'fight/relive',      //游戏复活界面
        SETTLEMENT: 'fight/settlement',       //游戏结算界面
        BUFF: 'fight/buff',                  //游戏buff
        READY_GO: 'fight/readyGo',                  //游戏倒计时
    }

    public static EVENT_NAME = {
        GAME_START: 'gameStart',        //   游戏开始事件
        GET_SCORE: 'getScore',           //得分事件
        GAME_OVER: 'gameOver',        //   游戏结束事件
        GAME_RESUME: 'gameResume',        //   游戏恢复事件
        GAME_PAUSE: 'gamePause',        //   游戏暂停事件
        GAME_RELIVE: 'gameRelive',        //   游戏复活事件
        GAME_RESET: 'gameReset',        //   游戏重置事件
    }

    public static PLAYER_BEST_SCORE: string = 'bestScore';

    public static SCENE_VIEW_WIDTH: number = 0.508;   //场景view 直接的间隔
    public static GOLD_SCORE: number = 10;  //金币分数10
    public static SILVER_SCORE: number = 1;   //银币分数1

    public static SKELETAL_ANIMATION_NAME = {
        IDLE: "idle01",  //空 
        LITTLE_WAGGLE: "waggle02",  //小小晃动
        GREAT_WAGGLE: "waggle01",     //大晃动
        RUN: "run",    //跑 
        STOOP: "stoop",            //弯腰
        STOOP_KEEP: "stoopkeep",            //持续弯腰
        BACKWARD_DEATH: "die01",              //往后倒死亡
    }

    public static GAME_DIFFICULTY: number[] = [1.25, 3.75, 8.75, 15]; //难度与距离的关系

    public static EQUIPMENTS: any = {
        BIRDIE01: "birdie01",  // 小鸟
        CHOMPER: "chomper",  //食人花
        INSECTICIDE: "insecticide",        // 杀虫剂
        MANTIS: "mantis",           //螳螂
        RATTAN_UP: "rattanUp",            //上面的藤蔓
        RATTAN_DOWN: "rattanDown",           //下面的藤蔓
        WALLOW: "wallow",        // 泥坑
        THORN: "thorn",        //地刺
        PENDULUM: "pendulum",     //钟摆
        TREE: "tree",         //树
        STONE: "stone",        //石板
        WINDMILL: "windmill",      //风车
        LEAF: "leaf",      //叶子
        GOLD: "gold",      //金币
        MINIFY: "minify",      //变小
        LARGEN: "largen",      //变大
        SILVER: "silver",           //银币
        SNOW_FLAKE: "snowFlake"     //冰冻
    }

    public static BUFF_LASTING_TIME = {
        SMALLER: 5,    // 虫子变小
        BIGGER: 5,     // 虫子变大
        FROZEN: 5      // 障碍停止
    }


    public static EQUIPMENT_TYPE = {
        EQUIPMENT: 0,    // 装置
        PROP: 1,     // 道具
    }

    public static get PROP_TEXT () {
        if (i18n._language === Constant.I18_LANGUAGE.CHINESE) {
            return Constant.PROP_TEXT_ZH;
        } else {
            return Constant.PROP_TEXT_EN;
        }
    }

    public static PROP_TEXT_ZH = {
        GOLD: "+10",      //金币
        MINIFY: "变小！",      //变小
        LARGEN: "变大！",      //变大
        SILVER: "+1",           //银币
        SNOW_FLAKE: "冻住！"     //冰冻
    }

    public static PROP_TEXT_EN = {
        GOLD: "+10",      //金币
        MINIFY: "smaller!",      //变小
        LARGEN: "bigger!",      //变大
        SILVER: "+1",           //银币
        SNOW_FLAKE: "freeze!"     //冰冻
    }

    public static PROP_EFFECTS = {
        PROPS_EAT: "propsEat",  // 吃到道具特效
        LARGEN_EFFECTS: "largenEffects",        // 变大特效
        MINIFY_EFFECTS: "minifyEff",        // 变小特效
        SNOW_FLAKE_EFFECT: "snowFlakeEff",  // 雪花特效
        LEAF_BROKEN: "leafBroken",  // 雪花特效
        WALLOW_DIE_EFF: "wallowDieEff",  // 泥洼死特效
        WALLOW_SPLASH: "wallowSplash",  // 泥洼水花
    }

    public static TRANSITION_EFFECT_NAME: string = 'transition07'; //过场动画
    public static TRANSITION_IN_ANIMATION_NAME: string = 'transitionIn';//进过场动画
    public static TRANSITION_OUT_ANIMATION_NAME: string = 'transitionOut';//出过场动画

    public static SNOW_FLAKE_EFFECTS = {    //雪花特效动画
        START: "snowFlakeEffStart",  // 开始动画
        IDLE: "snowFlakeEffIdle",        // 常驻动画
        OVER: "snowFlakeEffOver",        // 结束动画
    }

    public static DEBUG_INFO = {
        INVINCIBLE: "invincible",       //无敌模式
        EQUIPMENT_ID: "equipmentId"        //无敌模式
    }

    public static LOGIN_TIME = 0;

    public static I18_LANGUAGE = {
        ENGLISH: 'en',
        CHINESE: 'zh',
    }
}
