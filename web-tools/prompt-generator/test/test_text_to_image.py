# -*- coding: utf-8 -*-
"""
Test text-to-image generation using ComfyUI API

Usage:
    python test_text_to_image.py <prompt> [options]

Examples:
    # 测试连接
    python test_text_to_image.py --test

    # 生成一张图片
    python test_text_to_image.py "mature woman teacher, purple hair, glasses"

    # 指定参数
    python test_text_to_image.py "mature woman teacher" --steps 25 --cfg 4.5 --width 720 --height 1280

    # 指定负向提示词
    python test_text_to_image.py "mature woman teacher" --negative "blurry, low quality"

    # 指定输出
    python test_text_to_image.py "mature woman teacher" --output ./output.png

    # 使用角色描述
    python test_text_to_image.py "classroom setting" --character "beautiful anime girl with long black hair"
"""

import sys
from pathlib import Path
from typing import Optional

try:
    from comfyuiclient import ComfyUIClient
except ImportError:
    print("Error: Please install comfyuiclient")
    print("  pip install comfyui-workflow-client")
    sys.exit(1)


class TextToImageTester:
    """Test text-to-image generation"""

    def __init__(
        self,
        server_address: str = "localhost:8188",
        workflow_file: str = "api-export/text-to-image.json",
    ):
        self.server_address = server_address
        self.workflow_file = workflow_file

    def test_connection(self) -> bool:
        """Test connection to ComfyUI"""
        print(f"Testing connection to: {self.server_address}")
        try:
            client = ComfyUIClient(self.server_address, self.workflow_file)
            client.connect()
            print("[OK] Connection successful")
            client.close()
            return True
        except Exception as e:
            print(f"[FAIL] Connection failed: {e}")
            return False

    def test_text_to_image(
        self,
        prompt: str = "",
        negative: str = "",
        steps: int = 20,
        cfg: float = 4.0,
        width: int = 720,
        height: int = 1280,
        seed: Optional[int] = None,
        character: str = "",
        output_dir: str = "./output",
        output_name: str = "test_image",
    ) -> Optional[str]:
        """
        Test text-to-image generation

        Args:
            prompt: 正向提示词 (主题)
            negative: 负向提示词
            steps: 采样步数
            cfg: CFG 值
            width: 图像宽度
            height: 图像高度
            seed: 随机种子 (None=随机)
            character: 角色描述
            output_dir: 输出目录
            output_name: 输出文件名

        Returns:
            生成的图像路径
        """
        print("\n" + "=" * 50)
        print("Text-to-Image Generation Test")
        print("=" * 50)

        print("\n[参数]")
        print(f"  Prompt: {prompt or '(default)'}")
        if character:
            print(f"  Character: {character}")
        print(f"  Negative: {negative or '(none)'}")
        print(f"  Steps: {steps}")
        print(f"  CFG: {cfg}")
        print(f"  Size: {width}x{height}")
        print(f"  Seed: {seed if seed else '(random)'}")
        print(f"  Output: {output_dir}/{output_name}.png")

        try:
            print("\n[连接] Connecting to ComfyUI...")
            client = ComfyUIClient(self.server_address, self.workflow_file)
            client.connect()
            print("[OK] Connected")

            print("\n[设置参数]")

            if prompt:
                client.set_data(key="主题", input_key="string", input_value=prompt)
                print(f"  - Theme: {prompt[:50]}...")

            if character:
                client.set_data(key="角色", input_key="string", input_value=character)
                print(f"  - Character: {character[:50]}...")

            if negative:
                client.set_data(key="Negative Prompt", text=negative)
                print(f"  - Negative Prompt: {negative[:50]}...")

            if seed is None:
                import random

                seed = random.randint(0, 2**32 - 1)
            client.set_data(key="K采样器", seed=seed)
            print(f"  - Seed: {seed}")

            client.set_data(key="K采样器", input_key="steps", input_value=steps)
            print(f"  - Steps: {steps}")

            client.set_data(key="K采样器", input_key="cfg", input_value=cfg)
            print(f"  - CFG: {cfg}")

            client.set_data(key="空Latent图像", input_key="width", input_value=width)
            client.set_data(key="空Latent图像", input_key="height", input_value=height)
            print(f"  - Latent Size: {width}x{height}")

            print("\n[生成] Submitting generation task...")
            print("(This may take a few minutes for image generation)")

            import time
            import requests

            prompt_result = client.queue_prompt(client.comfyui_prompt)
            prompt_id = prompt_result.get("prompt_id")

            if not prompt_id:
                print("[FAIL] Failed to queue prompt")
                return None

            print(f"[OK] Prompt queued: {prompt_id}")

            max_wait = 300
            interval = 3
            for i in range(0, max_wait, interval):
                time.sleep(interval)
                try:
                    response = requests.get(
                        f"http://{self.server_address}/history/{prompt_id}"
                    )
                    if response.status_code == 200:
                        history = response.json()
                        prompt_data = history.get(prompt_id, {})
                        outputs = prompt_data.get("outputs", {})

                        if outputs:
                            print("[OK] Generation completed!")

                            for node_id, output in outputs.items():
                                images = output.get("images", [])
                                if images:
                                    for img in images:
                                        filename = img.get("filename")
                                        subfolder = img.get("subfolder", "")

                                        if filename:
                                            comfyui_output = "F:/ComfyUI_windows_portable/ComfyUI/output"
                                            img_path = (
                                                Path(comfyui_output) / filename
                                                if not subfolder
                                                else Path(comfyui_output)
                                                / subfolder
                                                / filename
                                            )

                                            if img_path.exists():
                                                dest_dir = Path(output_dir)
                                                dest_dir.mkdir(
                                                    parents=True, exist_ok=True
                                                )
                                                dest_path = (
                                                    dest_dir / f"{output_name}.png"
                                                )

                                                import shutil

                                                shutil.copy2(img_path, dest_path)

                                                print(f"  Image saved: {dest_path}")

                                                from PIL import Image

                                                with Image.open(dest_path) as img:
                                                    print(f"\n[结果]")
                                                    print(
                                                        f"  分辨率: {img.size[0]}x{img.size[1]}"
                                                    )
                                                    print(f"  模式: {img.mode}")

                                                return str(dest_path)
                                    else:
                                        print(
                                            f"[DEBUG] Node {node_id} output: {list(output.keys())}"
                                        )

                            print(f"[WARN] No images in output: {prompt_data}")
                        else:
                            status = prompt_data.get("status", {})
                            status_str = status.get("status_str", "unknown")
                            print(f"  Status: {status_str} ({i + interval}s)")
                except Exception as e:
                    print(f"  Waiting... ({i + interval}s) - {e}")

            print("[FAIL] Generation timeout")
            return None

        except Exception as e:
            print(f"[ERROR] {e}")
            import traceback

            traceback.print_exc()
            return None

        finally:
            try:
                client.close()
            except:
                pass


def main():
    """Main function"""
    print("ComfyUI Text-to-Image Test Tool")
    print("=" * 50)

    if len(sys.argv) < 2:
        print(__doc__)
        print("\nUsage examples:")
        print("  python test_text_to_image.py --test")
        print('  python test_text_to_image.py "mature woman teacher"')
        print(
            '  python test_text_to_image.py "mature woman" --steps 25 --width 720 --height 1280'
        )
        sys.exit(0)

    args = sys.argv[1:]
    kwargs = {}

    i = 0
    while i < len(args):
        if args[i] == "--server":
            kwargs["server_address"] = args[i + 1]
            i += 2
        elif args[i] == "--steps":
            kwargs["steps"] = int(args[i + 1])
            i += 2
        elif args[i] == "--cfg":
            kwargs["cfg"] = float(args[i + 1])
            i += 2
        elif args[i] == "--width":
            kwargs["width"] = int(args[i + 1])
            i += 2
        elif args[i] == "--height":
            kwargs["height"] = int(args[i + 1])
            i += 2
        elif args[i] == "--seed":
            kwargs["seed"] = int(args[i + 1])
            i += 2
        elif args[i] == "--negative":
            kwargs["negative"] = args[i + 1]
            i += 2
        elif args[i] == "--character":
            kwargs["character"] = args[i + 1]
            i += 2
        elif args[i] == "--output":
            output_path = args[i + 1]
            kwargs["output_dir"] = str(Path(output_path).parent)
            kwargs["output_name"] = Path(output_path).stem
            i += 2
        elif args[i] == "--test":
            kwargs["test"] = True
            i += 1
        elif not args[i].startswith("--"):
            kwargs["prompt"] = args[i]
            i += 1
        else:
            print(f"Unknown argument: {args[i]}")
            i += 1

    tester = TextToImageTester(
        server_address=kwargs.get("server_address", "localhost:8188"),
        workflow_file="api-export/text-to-image.json",
    )

    if kwargs.get("test"):
        tester.test_connection()
    elif kwargs.get("prompt"):
        result = tester.test_text_to_image(
            prompt=kwargs.get("prompt", ""),
            negative=kwargs.get("negative", ""),
            steps=kwargs.get("steps", 20),
            cfg=kwargs.get("cfg", 4.0),
            width=kwargs.get("width", 720),
            height=kwargs.get("height", 1280),
            seed=kwargs.get("seed"),
            character=kwargs.get("character", ""),
            output_dir=kwargs.get("output_dir", "./output"),
            output_name=kwargs.get("output_name", "test_image"),
        )
        if result:
            print(f"\n[OK] Image generated: {result}")
        else:
            print("\n[FAIL] Image generation failed")
            sys.exit(1)
    else:
        print("Error: Please provide prompt or use --test")
        sys.exit(1)


if __name__ == "__main__":
    main()
