# 提取算法详解（remove-mascot-bg.py）

> 来源：commit `8446639a feat(frontend): add agent mascot and refresh agent hub`  
> 脚本路径：`frontend/scripts/remove-mascot-bg.py`

## 算法总览

```
输入：RGB PNG（带纯色/棋盘背景）
     ↓
1. 转 RGBA；分离 R/G/B
2. 中性像素判定：|R-G|≤18 且 |G-B|≤18
3. 灰度分段：white (≥235) / light_gray (175-235) / medium_gray (140-175)
4. 背景 mask = 中性像素 AND 三段灰度
5. 泛洪填充（BFS）：从四边开始标记连通背景
6. alpha = 0（背景）/ 255（前景）
7. 边缘 fringe 清理：相邻透明 + 自身非透明 + 中性 + R≥130 → 也透明
8. 保存 RGBA + optimize
```

## 关键参数

| 参数 | 当前值 | 含义 |
|---|---|---|
| `neutral_threshold` | 18 | R/G/B 通道差值上限（控制对彩色前景的容忍度） |
| `white_floor` | 235 | 纯白判定下限 |
| `light_gray_max` | 235 | 浅灰上限 |
| `medium_gray_max` | 175 | 中灰上限 |
| `fringe_min_r` | 130 | 边缘清理的最低 R 值（避免吃掉暗色前景） |
| `fringe_iterations` | 2 | 边缘清理轮次（避免锯齿+保留细节） |

## 适用 vs 不适用

| 适用 | 不适用 |
|---|---|
| 纯色/棋盘/低饱和灰度背景 | 复杂场景背景（树木、办公室…） |
| 人物/物体有清晰边缘 | 半透明前景（玻璃、烟雾） |
| 输出 ≤ 2MB 的源图 | 1MB+ 源图（先压缩到 1500KB 以下） |

## 已知失败案例与修复

| 失败 | 原因 | 修复 |
|---|---|---|
| 头发被吃掉 | 黑色头发满足 `neutral & R≥130` | 提高 `fringe_min_r` 到 150 |
| 浅色衣服被吃 | 浅灰衣服被划入背景 | 提高 `light_gray` 阈值到 200 |
| 背景漏掉 | 背景不是纯灰（如淡蓝灰） | 改用色相距离而非灰度判定 |
| 边缘锯齿 | fringe 清理太狠 | 减小 `fringe_iterations` 到 1 |

## 通用化版本（待写）

`frontend/scripts/extract-mascot.py` 应支持：

```python
python extract-mascot.py --src X.png --out Y.png [--threshold N] [--iter N]
```

并提供 batch 模式：扫描 `inbox/module-mascots/`，对照 `public/console/mascots/modules/` 跳过已提取（透明比例 > 30%）。

## 验证

每次提取后必跑：

```python
from PIL import Image
im = Image.open(out).convert("RGBA")
alpha = list(im.getdata(3))
ratio = sum(1 for a in alpha if a < 10) / len(alpha)
assert 0.3 < ratio < 0.95, f"Unusual alpha ratio: {ratio:.1%}"
```

透明比例 < 30% 说明背景没去干净；> 95% 说明前景也被吃掉了。
