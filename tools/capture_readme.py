"""Capture the real local portfolio page for GitHub README."""
import base64
import io
import subprocess
import sys
import time
from pathlib import Path
from urllib.request import urlopen

from PIL import Image
from playwright.sync_api import sync_playwright


def main():
    process = subprocess.Popen(
        [sys.executable, "-m", "http.server", "8769", "--bind", "127.0.0.1"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        for attempt in range(40):
            try:
                with urlopen("http://127.0.0.1:8769/", timeout=1) as response:
                    if response.status == 200:
                        break
            except OSError:
                time.sleep(0.2)
        else:
            raise RuntimeError("Local web server did not start")
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
            page.goto("http://127.0.0.1:8769/", wait_until="networkidle")
            page.locator("h1").wait_for()
            page.screenshot(path="docs/portfolio-screenshot.png", full_page=False, animations="disabled")
            browser.close()
        image = Image.open("docs/portfolio-screenshot.png")
        image.thumbnail((1100, 700))
        output = io.BytesIO()
        image.convert("P", palette=1, colors=96).save(output, "PNG", optimize=True)
        print("PORTFOLIO_CAPTURE_BASE64=" + base64.b64encode(output.getvalue()).decode("ascii"))
    finally:
        process.terminate()
        try:
            process.wait(timeout=4)
        except subprocess.TimeoutExpired:
            process.kill()


if __name__ == "__main__":
    Path("docs").mkdir(exist_ok=True)
    main()
