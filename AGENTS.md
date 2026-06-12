<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
# Project Rules  /  项目规则

## Language / 语言

- Always reply to the user in Chinese.
- 始终用中文回复用户。

- Explanations should be beginner-friendly.
- 解释要适合初学者理解，不要写得太复杂。

---

## Project Root / 项目根目录

- The project root is `/Users/freesh/new-portfolio`.
- 当前项目根目录是 `/Users/freesh/new-portfolio`。

- Never operate outside `/Users/freesh/new-portfolio`.
- 不允许在 `/Users/freesh/new-portfolio` 之外操作。

- Before running any command, confirm `pwd` is `/Users/freesh/new-portfolio`.
- 执行任何命令前，必须确认当前路径 `pwd` 是 `/Users/freesh/new-portfolio`。

---

## Scope Control / 操作范围控制

- Do not scan the whole computer.
- 不要扫描整台电脑。

- Do not read, search, index, or modify files outside this project root.
- 不要读取、搜索、索引或修改项目根目录之外的文件。

- Do not inspect parent directories such as `/Users/freesh`.
- 不要检查上级目录，例如 `/Users/freesh`。

- Do not open unrelated folders or old portfolio projects.
- 不要打开无关文件夹，也不要打开旧作品集项目。

- Only inspect files that are directly relevant to the current task.
- 只查看和当前任务直接相关的文件。

---

## Forbidden Directories / 禁止读取的目录

Never read, search, list, scan, or modify these directories:

不要读取、搜索、列出、扫描或修改以下目录：

```text
node_modules/
.next/
.git/
dist/
build/
.turbo/
.vercel/
coverage/
.cache/
out/
public/videos/
public/raw/
public/backup/
public/archive/
public/large-assets/