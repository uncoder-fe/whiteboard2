# whiteboard

白板工具，可以自己插入一些绘制的形状，使用 react + rxjs 编写

# 设计

- 坐标系，已初始大小的左上角为相对定位点(0, 0)
- 视窗移动，平移坐标系
- 新建 shape 坐标位置，相对于(0, 0)

# 运行

```
npm install
npm run start
```

# 功能

1. 支持拖拽缩放大小
2. 支持无限画布
3. 支持辅助线
4. 支持插件注册机制

TODO：

1. 铅笔生成的图片，高清化

# 截图

![alt 截图](https://github.com/uncoder-fe/whiteboard2/blob/master/screenshot/screenshot-20211021-112524.png '截图')
