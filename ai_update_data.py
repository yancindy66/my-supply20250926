#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
AI 助手批量插入脚本

功能：
- 读取同目录下的 data.json（若不存在则视为 []）
- 接收命令行参数中的“新数据”内容（JSON 字符串）
- 调用 OpenAI（默认模型：gpt-4o），让模型在最前面新增一条数据并返回完整 JSON 列表
- 解析 AI 返回并覆盖写回 data.json

环境变量：
- OPENAI_API_KEY（必需）
- OPENAI_MODEL（可选，默认 gpt-4o）

用法示例：
  python ai_update_data.py '{"id": 101, "name": "新商品"}'
  python ai_update_data.py --model gpt-4-turbo '{"id": 102, "name": "Another"}'
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

try:
    from openai import OpenAI
except Exception as e:  # pragma: no cover
    print("请先安装 openai 包：pip install openai>=1.0.0", file=sys.stderr)
    raise


def load_data_json(file_path: Path):
    if not file_path.exists():
        return []
    try:
        with file_path.open('r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError:
        raise SystemExit(f"data.json 不是合法 JSON：{file_path}")
    if isinstance(data, list):
        return data
    # 若为对象，尽量兼容：包装为列表
    return [data]


def parse_new_item(arg: str):
    try:
        return json.loads(arg)
    except json.JSONDecodeError:
        # 兜底：将原始字符串作为一个字段保存
        return {"value": arg}


def build_prompt(old_list, new_item):
    old_str = json.dumps(old_list, ensure_ascii=False)
    new_str = json.dumps(new_item, ensure_ascii=False)
    return (
        "这是一个数据列表：" + old_str +
        "，请在最前面新增一条数据：" + new_str +
        "，然后返回完整的JSON格式新列表。只输出JSON，不要任何解释。"
    )


def extract_json(text: str):
    """从模型返回的文本中提取 JSON（处理 ```json ... ``` 或纯文本 JSON）。"""
    text = text.strip()
    fence = re.search(r"```(?:json)?\n([\s\S]*?)\n```", text, re.IGNORECASE)
    if fence:
        candidate = fence.group(1).strip()
    else:
        candidate = text
    # 去除可能的前后多余说明
    candidate = candidate.strip()
    return json.loads(candidate)


def main():
    parser = argparse.ArgumentParser(description="在 data.json 列表最前新增一条记录（通过 OpenAI）")
    parser.add_argument("new_data", help="新数据（JSON 字符串）")
    parser.add_argument("--model", default=os.getenv("OPENAI_MODEL", "gpt-4o"), help="OpenAI 模型名，默认 gpt-4o")
    parser.add_argument("--dry-run", action="store_true", help="仅打印结果，不写回文件")
    args = parser.parse_args()

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise SystemExit("缺少 OPENAI_API_KEY 环境变量")

    data_file = Path(__file__).with_name("data.json")
    old_list = load_data_json(data_file)
    new_item = parse_new_item(args.new_data)

    prompt = build_prompt(old_list, new_item)

    client = OpenAI(api_key=api_key)
    try:
        resp = client.chat.completions.create(
            model=args.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
        )
    except Exception as e:  # pragma: no cover
        raise SystemExit(f"调用 OpenAI 出错：{e}")

    content = resp.choices[0].message.content or ""
    try:
        new_list = extract_json(content)
    except Exception as e:
        print("模型原始返回：\n" + content, file=sys.stderr)
        raise SystemExit(f"解析模型返回为 JSON 失败：{e}")

    if not isinstance(new_list, list):
        print("模型原始返回：\n" + content, file=sys.stderr)
        raise SystemExit("模型返回的不是 JSON 数组")

    if args.dry_run:
        print(json.dumps(new_list, ensure_ascii=False, indent=2))
        return

    with data_file.open('w', encoding='utf-8') as f:
        json.dump(new_list, f, ensure_ascii=False, indent=2)

    print(f"已写回：{data_file}")


if __name__ == "__main__":
    main()



