# -*- coding: utf-8 -*-
"""
Test image-to-video generation using ComfyUI API

Usage:
    python test_image_to_video.py <image_path> [prompt] [options]

Examples:
    # 测试连接
    python test_image_to_video.py --test

    # 生成5秒视频
    python test_image_to_video.py ./shot.png "Girl smiling"

    # 生成20秒视频（5秒片段循环4次）
    python test_image_to_video.py ./shot.png "Girl smiling" --total-duration 20 --segment-duration 5

    # 指定参数
    python test_image_to_video.py ./shot.png --fps 8 --width 352 --height 512
"""

import sys
import json
from pathlib import Path
from typing import Optional
from PIL import Image

try:
    from comfyuiclient import ComfyUIClient
except ImportError:
    print("Error: Please install comfyuiclient")
    print("  pip install comfyui-workflow-client")
    sys.exit(1)


class ImageToVideoTester:
    """Test image-to-video generation"""

    def __init__(
        self,
        server_address: str = "localhost:8188",
        workflow_file: str = "api-export/image-to-video.json",
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

    def test_image_to_video(
        self,
        image_path: str,
        prompt: str = "",
        fps: int = 8,
        segment_duration: int = 5,
        total_duration: int = 20,
        width: int = 352,
        height: int = 512,
        output_dir: str = "./output",
    ) -> Optional[str]:
        """
        Test image-to-video generation with loop support

        Args:
            image_path: 输入图片路径
            prompt: 提示词
            fps: 帧率
            segment_duration: 片段时长（秒），ComfyUI生成的视频时长
            total_duration: 总时长（秒），最终视频时长
            width: 视频宽度
            height: 视频高度
            output_dir: 输出目录

        计算公式:
            length = segment_duration * fps + 1 (帧数)
            loop_count = total_duration / segment_duration - 1 (ComfyUI内循环次数)
            实际循环次数 = loop_count + 1
            最终时长 = segment_duration * (loop_count + 1)
        """
        length = segment_duration * fps + 1
        loop_count = int(total_duration / segment_duration) - 1

        if loop_count < 0:
            loop_count = 0

        print("\n" + "=" * 50)
        print("Image-to-Video Generation Test")
        print("=" * 50)

        print("\n[参数]")
        print(f"  FPS: {fps}")
        print(f"  片段时长: {segment_duration}s")
        print(f"  总时长: {total_duration}s")
        print(f"  length: {length} 帧 ({segment_duration} * {fps} + 1)")
        print(
            f"  loop_count: {loop_count} (循环次数: {loop_count + 1}, 最终: {segment_duration * (loop_count + 1)}s)"
        )

        image_path_obj = Path(image_path)
        if not image_path_obj.exists():
            print(f"[ERROR] Image not found: {image_path}")
            return None

        print(f"\n[输入]")
        print(f"  Image: {image_path}")
        print(f"  Prompt: {prompt or '(default)'}")
        print(f"  Resolution: {width}x{height}")

        try:
            print("\n[连接] Connecting to ComfyUI...")
            client = ComfyUIClient(self.server_address, self.workflow_file)
            client.connect()
            print("[OK] Connected")

            print("\n[设置参数]")

            pil_image = Image.open(image_path)
            client.set_data(key="加载图像", image=pil_image)
            print(f"  - LoadImage: {image_path}")

            if prompt:
                client.set_data(key="CLIP Text Encode (Positive Prompt)", text=prompt)
                print(f"  - Positive Prompt: {prompt[:50]}...")

            client.set_data(
                key="图像到视频（Wan）", input_key="width", input_value=width
            )
            client.set_data(
                key="图像到视频（Wan）", input_key="height", input_value=height
            )
            client.set_data(
                key="图像到视频（Wan）", input_key="length", input_value=length
            )
            print(f"  - WanImageToVideo: {width}x{height}, length={length}")

            client.set_data(key="Video Combine", input_key="fps", input_value=fps)
            client.set_data(
                key="Video Combine", input_key="loop_count", input_value=loop_count
            )
            print(f"  - Video Combine: fps={fps}, loop_count={loop_count}")

            output_prefix = Path(image_path).stem
            client.set_data(
                key="预览视频文件名",
                input_key="filename_prefix",
                input_value=f"video/{output_prefix}",
            )
            print(f"  - Output prefix: video/{output_prefix}")

            print("\n[生成] Submitting generation task...")
            print("(This may take a few minutes for video generation)")

            prompt_result = client.queue_prompt(client.comfyui_prompt)
            prompt_id = prompt_result.get("prompt_id")

            if not prompt_id:
                print("[FAIL] Failed to queue prompt")
                return None

            print(f"[OK] Prompt queued: {prompt_id}")

            import time
            import requests

            max_wait = 600
            interval = 5
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
                                for img in images:
                                    filename = img.get("filename")
                                    subfolder = img.get("subfolder", "")
                                    if filename and filename.endswith(".mp4"):
                                        comfyui_output = (
                                            "F:/ComfyUI_windows_portable/ComfyUI/output"
                                        )
                                        video_path = (
                                            Path(comfyui_output) / filename
                                            if not subfolder
                                            else Path(comfyui_output)
                                            / subfolder
                                            / filename
                                        )

                                        dest_dir = Path(output_dir)
                                        dest_dir.mkdir(parents=True, exist_ok=True)
                                        dest_path = dest_dir / filename

                                        import shutil

                                        shutil.copy2(video_path, dest_path)

                                        print(f"  Video saved: {dest_path}")
                                        print(f"\n[结果]")
                                        print(f"  目标时长: {total_duration}s")
                                        print(
                                            f"  片段时长: {segment_duration}s × {loop_count + 1}次 = {segment_duration * (loop_count + 1)}s"
                                        )

                                        return str(dest_path)

                            print(f"  History: {prompt_data}")
                            return str(prompt_data)
                        else:
                            print(f"  Status: waiting... ({i + interval}s)")
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
    print("ComfyUI Image-to-Video Test Tool")
    print("=" * 50)

    if len(sys.argv) < 2:
        print(__doc__)
        print("\nUsage examples:")
        print("  python test_image_to_video.py --test")
        print('  python test_image_to_video.py ./shot.png "girl smiling"')
        print(
            "  python test_image_to_video.py ./shot.png --total-duration 20 --segment-duration 5"
        )
        sys.exit(0)

    args = sys.argv[1:]
    kwargs = {}
    positional_args = []

    i = 0
    while i < len(args):
        if args[i] == "--server":
            kwargs["server_address"] = args[i + 1]
            i += 2
        elif args[i] == "--fps":
            kwargs["fps"] = int(args[i + 1])
            i += 2
        elif args[i] == "--segment-duration":
            kwargs["segment_duration"] = int(args[i + 1])
            i += 2
        elif args[i] == "--duration":
            kwargs["segment_duration"] = int(args[i + 1])
            i += 2
        elif args[i] == "--total-duration":
            kwargs["total_duration"] = int(args[i + 1])
            i += 2
        elif args[i] == "--width":
            kwargs["width"] = int(args[i + 1])
            i += 2
        elif args[i] == "--height":
            kwargs["height"] = int(args[i + 1])
            i += 2
        elif args[i] == "--output":
            kwargs["output_dir"] = args[i + 1]
            i += 2
        elif args[i] == "--batch":
            kwargs["batch"] = True
            i += 1
        elif args[i] == "--test":
            kwargs["test"] = True
            i += 1
        elif not args[i].startswith("--"):
            positional_args.append(args[i])
            i += 1
        else:
            print(f"Unknown argument: {args[i]}")
            i += 1

    if len(positional_args) >= 1:
        kwargs["image_path"] = positional_args[0]
    if len(positional_args) >= 2:
        kwargs["prompt"] = positional_args[1]

    tester = ImageToVideoTester(
        server_address=kwargs.get("server_address", "localhost:8188"),
        workflow_file="api-export/image-to-video.json",
    )

    if kwargs.get("test"):
        tester.test_connection()
    elif kwargs.get("image_path"):
        result = tester.test_image_to_video(
            image_path=kwargs["image_path"],
            prompt=kwargs.get("prompt", ""),
            fps=kwargs.get("fps", 8),
            segment_duration=kwargs.get("segment_duration", 5),
            total_duration=kwargs.get("total_duration", 20),
            width=kwargs.get("width", 352),
            height=kwargs.get("height", 512),
            output_dir=kwargs.get("output_dir", "./output"),
        )
        if result:
            print(f"\n[OK] Video generated: {result}")
        else:
            print("\n[FAIL] Video generation failed")
            sys.exit(1)
    else:
        print("Error: Please provide image path or use --test")
        sys.exit(1)


if __name__ == "__main__":
    main()
