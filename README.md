# D2Data

暗黑资料站，包含 D2数据库、D4 Boss计时和原版百科。使用原生 HTML、CSS、JavaScript，Cloudflare Worker 仅负责页面路由与静态资源响应。

## 功能

- D2R：符文之语、暗金物品、套装物品、基底物品、合成公式、手工艺品、魔法词缀、职业技能、符文。
- 保留各模块的搜索、筛选、排序、译名对照、属性比较、套装效果、技能成长表等功能。
- D4 Boss计时：巢穴首领、世界首领的下次刷新时间和倒计时，以及临近刷新提醒。
- 百科：保留 diablo-cn 离线副本的原始内容、编码、版式及内部链接。

仓库包含可直接使用的数据快照、图片、字体和页面资源。数据库抓取、更新、导入及打包工具在本地独立维护，不上传到此仓库，也不在网页或 Worker 中运行。

## Cloudflare Worker 部署

```sh
npm ci
npm run build
npx wrangler deploy --dry-run
npx wrangler deploy
```

`--dry-run` 用于检查部署构建；最后一条命令会发布到当前登录的 Cloudflare 账户。Worker 名称由 `wrangler.jsonc` 中的 `name` 决定，当前为 `diablo-reference`，可按部署目标修改。

连接 Cloudflare Workers Builds 时使用：

| 配置 | 值 |
| --- | --- |
| 项目根目录 | 仓库根目录 |
| 构建命令 | `npm run build` |
| 部署命令 | `npx wrangler deploy` |
| 静态资源目录 | `dist`，已在 Wrangler 配置中指定 |

构建仅整理本仓库已有页面文件，不会联网抓取或更新数据库。线上运行不需要 Python、数据库服务、定时任务或数据更新接口。

百科旧页面使用原有编码声明。Worker 对百科 HTML 保留 `text/html` 类型，不强制 UTF-8；不存在的归档页面仍返回 404。

## 本地预览

使用 Worker 本地运行时：

```sh
npm ci
npm run dev
```

也可以使用 Python 3：

```sh
python3 serve.py
```

浏览器打开终端中显示的地址。macOS 可双击 `启动离线数据库.command`。请通过 HTTP 服务访问，直接打开 `dist/index.html` 无法加载模块资源。

D2R 数据库和 Boss 计时可断网使用。百科沿用原离线副本，原有外部链接、缺图与失效页面保持原状。

## 目录

| 路径 | 用途 |
| --- | --- |
| `web/` | 本站页面、样式、交互和 Boss 配置源文件 |
| `dist/` | 已准备好的完整站点和数据资源 |
| `dist/encyclopedia/` | 原样保留的百科副本及来源记录 |
| `tools/build-local.mjs` | 将页面源文件复制到静态目录，无下载行为 |
| `worker.mjs` | Worker 页面路由与百科编码处理 |
| `wrangler.jsonc` | Worker 与 Static Assets 配置 |
| `tests/` | 计时边界及 Worker 路由测试 |
| `serve.py` | 可选的本地静态预览服务 |

百科资源只在 `dist/encyclopedia/` 保存一份，避免将相同图片重复放入仓库。

## 修改页面与数据快照

修改 `web/` 中的界面文件后执行：

```sh
npm run build
npm test
```

Boss 的基准时间和周期位于 `web/data/boss-schedule.json`：`baseTime` 为带时区的时间基准，`intervalSeconds` 为刷新周期秒数。它按预设规则推算，不读取游戏服务器状态。

D2R 数据由页面外的本地工具准备。以后更新资料时，将准备好的 `dist/` 资源及对应清单提交到仓库，再重新部署即可。构建流程不会修改数据内容，也不会自动下载新资料。

## 来源

D2R 数据与图片来自 [D2Core](https://www.d2core.com/d2r)。百科来自现有 diablo-cn 离线副本，保留原页面署名和版权信息，相关来源与缺失资源记录位于 `dist/encyclopedia/`。

游戏内容与原有资源的权利归各自权利人。
