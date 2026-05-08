"""User service for avatar processing and user management."""

import asyncio
from pathlib import Path
from typing import Tuple

from PIL import Image


async def generate_thumbnail(
    source_path: str,
    dest_path: str,
    size: Tuple[int, int] = (96, 96),
) -> None:
    """
    Generate a thumbnail from an image file.
    
    Args:
        source_path: Path to source image
        dest_path: Path to save thumbnail
        size: Thumbnail size as (width, height) tuple
        
    Raises:
        Exception: If thumbnail generation fails
    """
    def _generate() -> None:
        """Synchronous thumbnail generation."""
        # Ensure destination directory exists
        Path(dest_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Open and process image
        with Image.open(source_path) as img:
            # Convert to RGB if necessary (handles RGBA, P, etc.)
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")
            
            # Generate thumbnail
            img.thumbnail(size, Image.Resampling.LANCZOS)
            
            # Save as JPEG
            img.save(dest_path, "JPEG", quality=85, optimize=True)
    
    # Run in thread pool to avoid blocking
    await asyncio.to_thread(_generate)
