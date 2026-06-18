<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may differ from older Next.js knowledge. Before changing Next.js-specific code, check the local guide in `node_modules/next/dist/docs/` when necessary. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Project Rules / 项目规则

## 1. Language / 语言

* Always reply to the user in Chinese.
* 始终用中文回复用户。
* Explanations should be beginner-friendly.
* 解释要适合初学者理解，不要写得太复杂。

---

## 2. Project Root / 项目根目录

* The project root is the directory that contains this rules file, `package.json`, and the main Next.js app.
* 项目根目录是包含本规则文件、`package.json` 和 Next.js 主项目代码的目录。
* Do not assume any fixed absolute path such as `/Users/.../...`.
* 不要写死或假设任何电脑绝对路径。
* Before running commands, confirm the current directory with `pwd`.
* 执行命令前，先用 `pwd` 确认当前位置。
* Never operate outside the project root.
* 不要在项目根目录之外操作。

---

## 3. Scope Control / 操作范围

* Do not scan the whole computer.
* 不要扫描整台电脑。
* Do not inspect parent directories or unrelated projects.
* 不要查看上级目录或无关项目。
* Only read or edit files directly related to the current task.
* 只读取或修改和当前任务直接相关的文件。

Do not read, search, list, scan, or modify these directories:

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
```

---

## 4. Before Editing / 修改前规则

Before editing code, explain in Chinese:

1. What you plan to change
2. Which files you will modify
3. Why this change is needed

修改代码前，必须先用中文说明：

1. 准备改什么
2. 会改哪些文件
3. 为什么这样改

Keep changes minimal and focused.
修改要小而精准，不要顺手重构无关代码。

---

## 5. Command Rules / 命令规则

Do not run these commands unless the user explicitly approves:

```bash
rm -rf
git reset --hard
git clean -fd
git push --force
npm install
npm uninstall
npm update
pnpm install
yarn install
```

* Do not install, remove, or update dependencies without permission.
* 未经允许，不要安装、删除或更新依赖。
* If a command may modify `package.json`, lockfiles, or `node_modules`, ask first.
* 如果命令可能修改 `package.json`、lockfile 或 `node_modules`，必须先询问用户。

---

## 6. Git / Git 规则

* Do not run `git push` unless the user asks.
* 不要执行 `git push`，除非用户明确要求。
* Do not delete user changes.
* 不要删除用户已有修改。
* Before risky Git operations, explain what will happen.
* 执行有风险的 Git 操作前，先解释会发生什么。

---

## 7. Next.js / Next.js 规则

* Respect the existing App Router structure.
* 尊重现有 App Router 结构。
* Do not convert Server Components to Client Components unless required.
* 不要随意把 Server Component 改成 Client Component。
* Add `"use client"` only when client-side hooks, browser APIs, animations, or event handlers are needed.
* 只有需要 hooks、浏览器 API、动画或事件处理时，才添加 `"use client"`。

---

## 8. Styling and Animation / 样式与动效

* Follow the existing styling approach.
* 遵守项目现有样式写法。
* Do not introduce new styling systems or animation libraries without permission.
* 不要擅自引入新的样式方案或动效库。
* Prefer CSS, existing CSS modules, and existing animation utilities.
* 优先使用 CSS、现有 CSS Module 和项目已有动效工具。
* Do not add WebGL, Three.js, p5.js, Matter.js, or other heavy libraries unless approved.
* 未经允许，不要添加 WebGL、Three.js、p5.js、Matter.js 等重型库。

---

## 9. Verification / 检查

After changes, run the smallest relevant check when possible:

```bash
npm run lint
npm run build
npm run dev
```

* Do not claim success unless the check actually passed.
* 检查没有通过时，不要声称成功。
* If a check fails, explain the error in beginner-friendly Chinese.
* 如果检查失败，用适合初学者理解的中文解释。

---

## 10. Core Principle / 核心原则

Work carefully, locally, and minimally.

操作必须谨慎、本地化、最小化。

Do only what the user asked.

只做用户要求的事情，不要擅自扩大任务范围。

## UI/UX discussion and technical planning

When the user asks to discuss UI/UX, layout, interaction, animation, responsive behavior, or technical implementation strategy, answer from both design and technical-planning perspectives, but do not write code, modify files, or run commands unless the user explicitly asks to implement.