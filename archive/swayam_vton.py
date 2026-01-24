import os
import uuid
from pathlib import Path
from typing import Tuple

from loguru import logger

BASE_DIR = Path(__file__).parent.parent
REPO_DIR = BASE_DIR / "clothes-virtual-try-on-main"


def ensure_repo_structure() -> Tuple[bool, str]:
    """Check if the cloned repo and minimal dataset structure exist."""
    if not REPO_DIR.exists():
        return False, f"Repository folder not found at {REPO_DIR}. Ensure the ZIP was extracted or git clone succeeded."

    # Required subfolders for test dataset
    dataset_root = REPO_DIR / "datasets"
    test_dir = dataset_root / "test"
    needed = [
        test_dir / "image",
        test_dir / "cloth",
        test_dir / "openpose-json",
        test_dir / "openpose-img",
        test_dir / "image-parse",
        test_dir / "cloth-mask",
    ]
    for d in needed:
        d.mkdir(parents=True, exist_ok=True)

    return True, str(test_dir)


def save_inputs(user_bytes: bytes, user_content_type: str, cloth_bytes: bytes, cloth_content_type: str) -> Tuple[Path, Path, Path]:
    """Save incoming images into the repo's expected dataset structure and build pairs file.

    Returns:
        user_path, cloth_path, pairs_path
    """
    ok, msg = ensure_repo_structure()
    if not ok:
        raise RuntimeError(msg)

    test_dir = Path(msg)
    image_dir = test_dir / "image"
    cloth_dir = test_dir / "cloth"

    # Choose extensions
    user_ext = ".jpg" if (user_content_type or "").lower().endswith("jpeg") or (user_content_type or "").lower().endswith("jpg") else ".png"
    cloth_ext = ".jpg" if (cloth_content_type or "").lower().endswith("jpeg") or (cloth_content_type or "").lower().endswith("jpg") else ".png"

    user_name = f"user_{uuid.uuid4().hex}{user_ext}"
    cloth_name = f"cloth_{uuid.uuid4().hex}{cloth_ext}"

    user_path = image_dir / user_name
    cloth_path = cloth_dir / cloth_name

    user_path.write_bytes(user_bytes)
    cloth_path.write_bytes(cloth_bytes)

    # Build test_pairs.txt at repo root (expected by test.py default)
    pairs_path = REPO_DIR / "test_pairs.txt"
    pairs_path.write_text(f"{user_name} {cloth_name}\n", encoding="utf-8")

    logger.info(f"Saved VTON inputs: user={user_path}, cloth={cloth_path}")
    return user_path, cloth_path, pairs_path


def check_prerequisites() -> dict:
    """Check for model checkpoints and external tool outputs needed by test.py.

    Returns a dict with readiness flags and guidance.
    """
    checkpoints_dir = REPO_DIR / "checkpoints"
    needs = {
        "repo_present": REPO_DIR.exists(),
        "checkpoints_dir": checkpoints_dir.exists(),
        "seg_final": (checkpoints_dir / "seg_final.pth").exists(),
        "gmm_final": (checkpoints_dir / "gmm_final.pth").exists(),
        "alias_final": (checkpoints_dir / "alias_final.pth").exists(),
        "u2net_cloth_segm": (REPO_DIR / "cloth_segm_u2net_latest.pth").exists(),
        "openpose_outputs": (REPO_DIR / "datasets" / "test" / "openpose-json").exists(),
        "human_parsing_outputs": (REPO_DIR / "datasets" / "test" / "image-parse").exists(),
    }

    ready = all([
        needs["repo_present"],
        needs["checkpoints_dir"],
        needs["seg_final"],
        needs["gmm_final"],
        needs["alias_final"],
        needs["u2net_cloth_segm"],
    ])

    guidance = (
        "Missing prerequisites. Ensure model checkpoints exist in 'checkpoints' (seg_final.pth, gmm_final.pth, alias_final.pth), "
        "and 'cloth_segm_u2net_latest.pth' at repo root. Also generate 'openpose-json', 'openpose-img', and 'image-parse' "
        "for each user image, or run the Colab/Gradio setup provided in the repository."
    )

    return {"ready": ready, "needs": needs, "guidance": guidance}
