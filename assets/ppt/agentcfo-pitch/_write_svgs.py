# -*- coding: utf-8 -*-
from pathlib import Path

WIDTH = 1280
HEIGHT = 720

COLORS = {
    "bg": "#0B1220",
    "card": "#111827",
    "primary": "#22D3EE",
    "accent": "#8B5CF6",
    "text": "#F1F5F9",
    "secondary": "#94A3B8",
}

FONT_FAMILY = "Microsoft YaHei, Arial, sans-serif"


def text(x, y, value, size=24, color=None, weight="400", anchor="start"):
    color = color or COLORS["text"]
    return (
        f'<text x="{x}" y="{y}" fill="{color}" font-size="{size}" '
        f'font-family="{FONT_FAMILY}" font-weight="{weight}" text-anchor="{anchor}">{value}</text>'
    )


def icon(name, x, y, size=30, color=None):
    color = color or COLORS["primary"]
    edge = size - 4
    half = size // 2
    end = size - 8
    return (
        f'<g data-icon="tabler-outline/{name}" transform="translate({x},{y})" '
        f'stroke="{color}" fill="none" stroke-width="2">'
        f'<rect x="2" y="2" width="{edge}" height="{edge}" rx="6"/>'
        f'<path d="M8 {half} H{end}"/>'
        f'<path d="M{half} 8 V{end}"/>'
        "</g>"
    )


def card(x, y, w, h, title_value, desc_value, icon_name="sparkles"):
    return "".join(
        [
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="18" fill="{COLORS["card"]}" '
            f'stroke="{COLORS["accent"]}" stroke-opacity="0.35"/>',
            icon(icon_name, x + 20, y + 18, size=28),
            text(x + 60, y + 42, title_value, size=28, weight="700"),
            text(x + 20, y + 86, desc_value, size=21, color=COLORS["secondary"]),
        ]
    )


def wrap_slide(page_no, body):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" '
        f'viewBox="0 0 {WIDTH} {HEIGHT}">'
        f'<rect width="{WIDTH}" height="{HEIGHT}" fill="{COLORS["bg"]}"/>'
        f"{body}"
        f'<text x="1220" y="686" fill="{COLORS["secondary"]}" font-size="20" '
        f'font-family="{FONT_FAMILY}" text-anchor="end">{page_no:02d}</text>'
        "</svg>"
    )


def slide_01_cover():
    body = "".join(
        [
            f'<rect x="90" y="90" width="1100" height="540" rx="28" fill="{COLORS["card"]}" '
            f'stroke="{COLORS["primary"]}" stroke-opacity="0.35"/>',
            icon("robot", 130, 140, size=40),
            text(200, 182, "AgentCFO", size=92, weight="800", color=COLORS["text"]),
            text(200, 254, "DAO AI 财务官项目路演", size=36, weight="600", color=COLORS["primary"]),
            text(200, 340, "给每个 DAO 一个带受控钱包的 AI 财务官", size=34, color=COLORS["text"]),
            text(200, 412, "Cobo Agentic Commerce 赛道", size=30, color=COLORS["accent"], weight="600"),
            text(200, 500, "Contribution -> Plan -> Risk -> Human -> CAW -> Audit", size=24, color=COLORS["secondary"]),
        ]
    )
    return wrap_slide(1, body)


def slide_02_problem():
    body = "".join(
        [
            text(80, 92, "痛点：DAO 财务执行链路存在四个核心问题", size=42, weight="700"),
            card(80, 150, 540, 220, "人工表格易错", "多来源手工录入导致金额与收款方错误", "table"),
            card(660, 150, 540, 220, "支出不透明", "决策依据与执行结果分散在不同工具", "eye"),
            card(80, 400, 540, 220, "多签效率低", "流程长、签名慢、关键付款经常延迟", "signature"),
            card(660, 400, 540, 220, "全自动有风险", "缺少风控与人工闸门会放大资金风险", "shield"),
        ]
    )
    return wrap_slide(2, body)


def slide_03_solution():
    roles = [
        ("Agent", "解析贡献并生成 Payment Plan", "brain"),
        ("Risk Engine", "预算、白名单、单笔限额校验", "shield-check"),
        ("Human Approval", "关键节点人工确认", "user-check"),
        ("CAW", "受控钱包执行转账", "wallet"),
        ("Audit Report", "沉淀可追溯审计记录", "report"),
    ]
    parts = [text(80, 92, "方案：五层协同执行模型", size=42, weight="700")]
    x = 70
    for idx, (name, desc, icon_name) in enumerate(roles):
        parts.append(card(x, 170, 228, 390, name, desc, icon_name))
        if idx < len(roles) - 1:
            parts.append(f'<line x1="{x + 228}" y1="365" x2="{x + 246}" y2="365" stroke="{COLORS["primary"]}" stroke-width="3"/>')
            parts.append(f'<polygon points="{x + 246},365 {x + 234},358 {x + 234},372" fill="{COLORS["primary"]}"/>')
        x += 246
    body = "".join(parts)
    return wrap_slide(3, body)


def slide_04_flow():
    steps = [
        "Contribution Records",
        "Payment Plan",
        "Risk Check",
        "Human Approval",
        "CAW",
        "Tx Hash",
        "Audit Report",
    ]
    parts = [text(80, 92, "核心流程：从贡献到审计的闭环", size=42, weight="700")]
    x = 40
    for idx, step in enumerate(steps):
        parts.append(
            f'<rect x="{x}" y="300" width="160" height="120" rx="16" fill="{COLORS["card"]}" '
            f'stroke="{COLORS["accent"]}" stroke-opacity="0.4"/>'
        )
        parts.append(icon("arrow-big-right-lines", x + 16, 320, size=24, color=COLORS["primary"]))
        parts.append(text(x + 80, 374, step, size=20, weight="600", anchor="middle"))
        if idx < len(steps) - 1:
            parts.append(f'<line x1="{x + 160}" y1="360" x2="{x + 178}" y2="360" stroke="{COLORS["primary"]}" stroke-width="3"/>')
            parts.append(f'<polygon points="{x + 178},360 {x + 168},354 {x + 168},366" fill="{COLORS["primary"]}"/>')
        x += 178
    body = "".join(parts)
    return wrap_slide(4, body)


def slide_05_features():
    features = [
        ("贡献聚合", "自动读取贡献记录并归档"),
        ("付款计划", "按预算生成可解释分配方案"),
        ("风控引擎", "白名单 + 限额 + 预算拦截"),
        ("人工闸门", "高风险项必须人工确认"),
        ("钱包执行", "调用 CAW 完成受控转账"),
        ("审计报告", "结果可追溯并可分享"),
    ]
    parts = [text(80, 92, "功能概览：6 个可演示能力", size=42, weight="700")]
    positions = [(80, 150), (450, 150), (820, 150), (80, 360), (450, 360), (820, 360)]
    for (name, desc), (x, y) in zip(features, positions):
        parts.append(card(x, y, 340, 180, name, desc, "stars"))
    parts.extend(
        [
            text(80, 626, "Deployment", size=24, color=COLORS["primary"], weight="700"),
            text(230, 626, "Vercel: https://agentcfo-frontend.vercel.app", size=22, color=COLORS["secondary"]),
            text(230, 662, "Render: https://agentcfo-backend.onrender.com", size=22, color=COLORS["secondary"]),
        ]
    )
    body = "".join(parts)
    return wrap_slide(5, body)


def slide_06_architecture():
    layers = [
        ("Frontend Console", "Next.js / Console Command Center"),
        ("Backend API", "FastAPI P0 endpoints + adapter"),
        ("Agent Layer", "Payment plan reasoning"),
        ("Risk Layer", "Budget / Allowlist / Limit checks"),
        ("Human Gate", "Approval action before execution"),
        ("CAW Layer", "Cobo Agentic Wallet execution"),
        ("Audit Layer", "Tx hash and report persistence"),
    ]
    parts = [text(80, 92, "分层架构：可控自动化", size=42, weight="700")]
    y = 138
    for idx, (name, desc) in enumerate(layers):
        fill = COLORS["card"]
        stroke = COLORS["primary"] if idx in (0, 6) else COLORS["accent"]
        parts.append(f'<rect x="160" y="{y}" width="960" height="72" rx="14" fill="{fill}" stroke="{stroke}" stroke-opacity="0.5"/>')
        parts.append(icon("layers-linked", 184, y + 20, size=24, color=stroke))
        parts.append(text(224, y + 36, name, size=26, weight="700"))
        parts.append(text(224, y + 63, desc, size=20, color=COLORS["secondary"]))
        y += 78
    body = "".join(parts)
    return wrap_slide(6, body)


def slide_07_demo():
    rows = [
        ("Alice", "20", "Ready", COLORS["primary"]),
        ("Bob", "15", "Blocked", "#F97316"),
        ("Charlie", "10", "Ready", COLORS["primary"]),
        ("Data API", "5", "Ready", COLORS["primary"]),
    ]
    parts = [
        text(80, 92, "Demo 数据集：预算 50 USDC", size=42, weight="700"),
        f'<rect x="80" y="140" width="1120" height="500" rx="20" fill="{COLORS["card"]}" stroke="{COLORS["accent"]}" stroke-opacity="0.35"/>',
        text(140, 210, "Recipient", size=24, color=COLORS["secondary"], weight="700"),
        text(520, 210, "Amount (USDC)", size=24, color=COLORS["secondary"], weight="700"),
        text(920, 210, "Status", size=24, color=COLORS["secondary"], weight="700"),
    ]
    y = 270
    for recipient, amount, status, status_color in rows:
        parts.append(f'<line x1="120" y1="{y - 34}" x2="1160" y2="{y - 34}" stroke="{COLORS["secondary"]}" stroke-opacity="0.2"/>')
        parts.append(icon("user-circle", 136, y - 22, size=22, color=COLORS["primary"]))
        parts.append(text(170, y, recipient, size=30, weight="600"))
        parts.append(text(580, y, amount, size=30, weight="600"))
        parts.append(text(980, y, status, size=30, color=status_color, weight="700"))
        y += 90
    body = "".join(parts)
    return wrap_slide(7, body)


def slide_08_caw_evidence():
    body = "".join(
        [
            text(80, 92, "CAW 执行证据：Sepolia SETH", size=42, weight="700"),
            f'<rect x="80" y="140" width="1120" height="500" rx="20" fill="{COLORS["card"]}" stroke="{COLORS["primary"]}" stroke-opacity="0.35"/>',
            icon("shield-lock", 110, 178, size=30),
            text(150, 202, "Execution Snapshot", size=30, weight="700"),
            text(120, 262, "Network: Sepolia", size=26),
            text(120, 308, "Asset: SETH", size=26),
            text(120, 354, "Tx Hash: 0x85a5...ed4d98", size=26, color=COLORS["primary"], weight="700"),
            text(120, 418, "Mode: mock mode for hackathon demo", size=24, color=COLORS["secondary"]),
            text(120, 456, "Note: mock tx is evidence format, not real mainnet settlement", size=24, color=COLORS["secondary"]),
            text(120, 494, "Audit report keeps request id, tx hash, and risk decision", size=24, color=COLORS["secondary"]),
        ]
    )
    return wrap_slide(8, body)


def slide_09_tech_stack():
    stack = ["Python", "FastAPI", "pytest", "SQLite", "CAW SDK"]
    parts = [
        text(80, 92, "技术栈：轻量、可测、可扩展", size=42, weight="700"),
        text(80, 148, "Backend-first 架构，前端通过契约适配器对接", size=26, color=COLORS["secondary"]),
    ]
    x = 120
    for item in stack:
        parts.append(f'<rect x="{x}" y="250" width="200" height="120" rx="22" fill="{COLORS["card"]}" stroke="{COLORS["accent"]}" stroke-opacity="0.4"/>')
        parts.append(icon("cpu", x + 20, 276, size=26, color=COLORS["primary"]))
        parts.append(text(x + 100, 324, item, size=30, weight="700", anchor="middle"))
        x += 220
    parts.extend(
        [
            f'<rect x="80" y="430" width="1120" height="190" rx="18" fill="{COLORS["card"]}" stroke="{COLORS["primary"]}" stroke-opacity="0.3"/>',
            text(120, 486, "Testing: pytest 覆盖 MVP 主链路", size=28, color=COLORS["text"]),
            text(120, 536, "Storage: SQLite 持久化 audit report", size=28, color=COLORS["text"]),
            text(120, 586, "Integration: CAW SDK + API contract mirrors", size=28, color=COLORS["text"]),
        ]
    )
    body = "".join(parts)
    return wrap_slide(9, body)


def slide_10_api():
    apis = [
        "POST /api/payment-plan",
        "POST /api/risk-check",
        "POST /api/execute-payment",
        "GET /api/audit-report/{auditReportId}",
        "GET /api/caw-status/{cawRequestId}",
    ]
    parts = [
        text(80, 92, "P0 API 契约（4+1）", size=42, weight="700"),
        f'<rect x="80" y="140" width="1120" height="500" rx="20" fill="{COLORS["card"]}" stroke="{COLORS["accent"]}" stroke-opacity="0.35"/>',
    ]
    y = 228
    for api in apis:
        parts.append(icon("api", 120, y - 22, size=22, color=COLORS["primary"]))
        parts.append(text(160, y, api, size=32, weight="600"))
        y += 86
    body = "".join(parts)
    return wrap_slide(10, body)


def slide_11_roadmap():
    columns = [
        ("P0", ["✓ Payment Plan", "✓ Risk Check", "✓ Human Approval", "✓ CAW Mock Execute"]),
        ("P1", ["✓ Audit Report API", "✓ Console Integration", "□ On-chain receipt verify", "□ Ops dashboard"]),
        ("P2", ["□ Multi-chain policy", "□ Team permission matrix", "□ Treasury forecasting", "□ DAO self-serve templates"]),
    ]
    parts = [text(80, 92, "Roadmap：P0 -> P1 -> P2", size=42, weight="700")]
    x = 80
    for title_value, items in columns:
        parts.append(f'<rect x="{x}" y="150" width="360" height="500" rx="20" fill="{COLORS["card"]}" stroke="{COLORS["primary"]}" stroke-opacity="0.3"/>')
        parts.append(text(x + 180, 212, title_value, size=42, weight="800", color=COLORS["accent"], anchor="middle"))
        y = 276
        for item in items:
            color = COLORS["primary"] if item.startswith("✓") else COLORS["secondary"]
            parts.append(icon("checkup-list", x + 26, y - 20, size=20, color=color))
            parts.append(text(x + 54, y, item, size=24, color=color, weight="600"))
            y += 78
        x += 380
    body = "".join(parts)
    return wrap_slide(11, body)


def slide_12_why_cobo():
    cards = [
        ("受控执行", "Human-in-the-loop + policy check 与 CAW 高度契合"),
        ("Agentic Commerce", "从计划到执行到审计形成智能闭环"),
        ("DAO 场景验证", "预算管理、风险拦截、透明审计可直接落地"),
    ]
    parts = [text(80, 92, "Why Cobo：产品与赛道高度匹配", size=42, weight="700")]
    x = 80
    for title_value, desc in cards:
        parts.append(card(x, 190, 360, 380, title_value, desc, "building-bank"))
        x += 380
    parts.append(text(80, 634, "结论：AgentCFO is built for Cobo Agentic Commerce", size=30, color=COLORS["primary"], weight="700"))
    body = "".join(parts)
    return wrap_slide(12, body)


def slide_13_team():
    roles = [
        ("PM", "需求拆解、路线管理"),
        ("Frontend", "Console 与 Landing"),
        ("Backend", "API、风控、执行适配"),
        ("Wallet/Chain", "CAW 对接与链上证据"),
        ("Demo/Ops", "演示脚本与发布协同"),
    ]
    parts = [
        text(80, 92, "团队分工：5 个角色协作", size=42, weight="700"),
        f'<rect x="80" y="140" width="1120" height="500" rx="20" fill="{COLORS["card"]}" stroke="{COLORS["accent"]}" stroke-opacity="0.35"/>',
        text(130, 210, "Role", size=26, color=COLORS["secondary"], weight="700"),
        text(420, 210, "Responsibility", size=26, color=COLORS["secondary"], weight="700"),
    ]
    y = 274
    for role, duty in roles:
        parts.append(f'<line x1="120" y1="{y - 34}" x2="1160" y2="{y - 34}" stroke="{COLORS["secondary"]}" stroke-opacity="0.2"/>')
        parts.append(icon("users-group", 132, y - 20, size=20, color=COLORS["primary"]))
        parts.append(text(164, y, role, size=30, weight="700"))
        parts.append(text(420, y, duty, size=28))
        y += 86
    body = "".join(parts)
    return wrap_slide(13, body)


def slide_14_ending():
    body = "".join(
        [
            f'<rect x="90" y="90" width="1100" height="540" rx="28" fill="{COLORS["card"]}" stroke="{COLORS["primary"]}" stroke-opacity="0.35"/>',
            icon("sparkles", 596, 170, size=40, color=COLORS["primary"]),
            text(640, 260, "Thank You", size=84, weight="800", anchor="middle"),
            text(640, 330, "AgentCFO · DAO AI 财务官", size=34, color=COLORS["accent"], weight="700", anchor="middle"),
            text(640, 410, "Demo: https://agentcfo-frontend.vercel.app", size=26, color=COLORS["secondary"], anchor="middle"),
            text(640, 454, "Repo: https://github.com/agentcfo/agent-cfo", size=26, color=COLORS["secondary"], anchor="middle"),
            text(640, 498, "Track: Cobo Agentic Commerce", size=26, color=COLORS["secondary"], anchor="middle"),
        ]
    )
    return wrap_slide(14, body)


def main():
    output_dir = Path(__file__).parent / "svg_output"
    output_dir.mkdir(parents=True, exist_ok=True)

    slides = [
        ("01_cover.svg", slide_01_cover()),
        ("02_problem.svg", slide_02_problem()),
        ("03_solution.svg", slide_03_solution()),
        ("04_flow.svg", slide_04_flow()),
        ("05_features.svg", slide_05_features()),
        ("06_architecture.svg", slide_06_architecture()),
        ("07_demo.svg", slide_07_demo()),
        ("08_caw_evidence.svg", slide_08_caw_evidence()),
        ("09_tech_stack.svg", slide_09_tech_stack()),
        ("10_api.svg", slide_10_api()),
        ("11_roadmap.svg", slide_11_roadmap()),
        ("12_why_cobo.svg", slide_12_why_cobo()),
        ("13_team.svg", slide_13_team()),
        ("14_ending.svg", slide_14_ending()),
    ]

    for filename, svg_content in slides:
        (output_dir / filename).write_text(svg_content, encoding="utf-8")

    print(f"Wrote {len(slides)} SVG files to {output_dir}")


if __name__ == "__main__":
    main()
