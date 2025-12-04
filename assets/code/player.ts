import {
  _decorator,
  Collider,
  Component,
  director,
  EventKeyboard,
  input,
  Input,
  Label,
  EventTouch,
  Node,
} from 'cc'
const { ccclass, property } = _decorator

@ccclass('player')
export class player extends Component {
  @property(Node) // 绑定相机节点
  cameraNode: Node = null

  @property(Collider) // 绑定碰撞节点
  player_Collider: Collider = null

  @property(Node) // 弹窗提示节点
  tipsNode: Node = null

  @property
  carSpeed = 200 // 向前移动速度

  // 状态 0 暂停 1 运行 2 成功 3 失败
  state: 0 | 1 | 2 | 3 = 1

  carMove = {
    x: 0, // 左右
    y: 1, // 前后
  }

  // 触摸初始位置
  private touchStartLocation: { x: number; y: number } | null = null
  // 小车初始位置
  private carStartPositionX: number = 0

  start() {}

  protected onLoad(): void {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this)
    // 添加触摸事件监听
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this)
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this)
    this.player_Collider.on('onTriggerEnter', this.onTriggerEnter, this)
  }
  protected onDestroy(): void {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this)
    input.off(Input.EventType.KEY_UP, this.onKeyUp, this)
    // 移除触摸事件监听
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this)
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this)
    this.player_Collider.off('onTriggerEnter', this.onTriggerEnter)
  }

  onTriggerEnter = ({ otherCollider }) => {
    if (this.state !== 1) {
      return
    }

    const label = this.tipsNode.getComponentInChildren(Label)

    if (otherCollider.node.name === '成功空气墙') {
      this.state = 2
      if (label) {
        label.string = 'win'
      }
    } else {
      this.state = 3
      if (label) {
        label.string = '游戏结束'
      }
    }

    this.tipsNode.active = true
  }

  onKeyDown(key: EventKeyboard) {
    if (this.state !== 1) {
      return
    }

    switch (key.keyCode) {
      case 65: // a
      case 37: // left
        this.carMove.x = -0.02

        break
      case 68: // d
      case 39: // right
        this.carMove.x = 0.02
        break
      case 87: // w
      case 38: // up
        this.carMove.y = 2
        break

      case 83: // s
      case 40: // down
        this.carMove.y = 0.5
        break
    }
  }

  onKeyUp(key: EventKeyboard) {
    switch (key.keyCode) {
      case 65: // a
      case 37: // left
      case 68: // d
      case 39: // right
        this.carMove.x = 0
        break

      case 87: // w
      case 38: // up
      case 83: // s
      case 40: // down
        this.carMove.y = 1
        break
    }
  }

  // 触摸控制方法
  onTouchStart(event: EventTouch) {
    if (this.state !== 1) {
      return
    }

    // 记录初始触摸位置
    this.touchStartLocation = event.getUILocation()
    // 记录小车的初始位置
    this.carStartPositionX = this.node.position.x

    // 触摸时加速前进
    this.carMove.y = 2
  }

  onTouchMove(event: EventTouch) {
    if (this.state !== 1 || !this.touchStartLocation) {
      return
    }

    const currentLocation = event.getUILocation()
    const screenWidth = window.innerWidth

    // 计算触摸位置在屏幕上的比例（-1 到 1）
    // 相对于触摸起始位置
    const touchOffsetRatio =
      (currentLocation.x - this.touchStartLocation.x) / (screenWidth / 2)

    // 直接计算小车的目标位置：小车位置 = 初始位置 + 偏移量
    // 其中偏移量 = 触摸偏移比例 * 道路半宽
    const roadHalfWidth = 0.63
    this.carMove.x = this.carStartPositionX + touchOffsetRatio * roadHalfWidth
  }

  onTouchEnd() {
    // 停止左右移动（重置目标位置）
    this.carMove.x = 0
    // 恢复默认速度
    this.carMove.y = 1
    // 清空触摸起始位置
    this.touchStartLocation = null
    // 清空小车起始位置
    this.carStartPositionX = 0
  }

  update(deltaTime: number) {
    if (this.state !== 1) {
      return
    }
    const offsetZ = this.carSpeed * deltaTime * this.carMove.y

    const { x, y, z } = this.node.position

    let newX = x

    // 根据控制方式计算新位置
    if (this.touchStartLocation) {
      // 触摸控制：直接使用设置的目标位置（与触摸位置对应）
      newX = this.carMove.x
    } else if (this.carMove.x !== 0) {
      // 键盘控制：使用速度增量
      newX = x + this.carMove.x
    }

    // 限制在道路范围内
    if (newX < -0.63) {
      newX = -0.63
    } else if (newX > 0.63) {
      newX = 0.63
    }

    // 缓慢向前移动
    this.node.setPosition(newX, y, z - offsetZ)

    const pos = this.cameraNode
    // 移动相机z轴
    this.cameraNode.setPosition(pos.x, pos.y, pos.z - offsetZ)
  }

  newGame() {
    // 1.重置数据
    // this.state = 1
    // this.tipsNode.active = false
    // this.node.setPosition(x, x, x)
    // this.cameraNode.setPosition(x, x, x)

    // 2.类似于刷新页面
    director.loadScene('c1')
  }
}
