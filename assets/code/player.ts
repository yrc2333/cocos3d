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

  start() {
    console.log('游戏启动')
  }

  protected onLoad(): void {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this)
    // 添加触摸事件监听
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this)
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this)
    this.player_Collider.on('onTriggerEnter', this.onTriggerEnter)
  }
  protected onDestroy(): void {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this)
    input.off(Input.EventType.KEY_UP, this.onKeyUp, this)
    // 移除触摸事件监听
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this)
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this)
    this.player_Collider.off('onTriggerEnter', this.onTriggerEnter)
  }

  onTriggerEnter = ({ otherCollider }) => {
    if (this.state !== 1) {
      return
    }

    const label = this.tipsNode.getChildByName('Label') as unknown as Label

    if (otherCollider.node.name === '成功空气墙') {
      this.state = 2
      label.string = 'win'
    } else {
      this.state = 3
      label.string = '游戏结束'
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

    const touchLocation = event.getUILocation()
    const screenWidth = window.innerWidth

    // 判断触摸在屏幕左半部分还是右半部分
    if (touchLocation.x < screenWidth / 2) {
      // 左半屏 - 向左移动
      this.carMove.x = -0.02
    } else {
      // 右半屏 - 向右移动
      this.carMove.x = 0.02
    }

    // 触摸时加速前进
    this.carMove.y = 2
  }

  onTouchEnd() {
    // 停止左右移动
    this.carMove.x = 0
    // 恢复默认速度
    this.carMove.y = 1
  }

  update(deltaTime: number) {
    if (this.state !== 1) {
      return
    }
    const offsetZ = this.carSpeed * deltaTime * this.carMove.y

    const { x, y, z } = this.node.position

    let newX = x + this.carMove.x

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
