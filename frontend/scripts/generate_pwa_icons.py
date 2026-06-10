import os
from PIL import Image

def generate_icons():
    # Source image path
    source_path = os.path.join("frontend", "src", "assets", "logo copy.png")
    output_dir = os.path.join("frontend", "public")

    if not os.path.exists(source_path):
        print(f"Error: Source image not found at {source_path}")
        return

    # Open the source image
    img = Image.open(source_path)
    width, height = img.size
    print(f"Original image dimensions: {width}x{height}")

    # Step 1: Make it a perfect square by padding
    size = max(width, height)
    square_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    # Center the original image on the square canvas
    offset_x = (size - width) // 2
    offset_y = (size - height) // 2
    square_img.paste(img, (offset_x, offset_y))

    # Define target icons and their configurations
    # Format: (filename, size, is_maskable)
    configs = [
        ("pwa-192x192.png", 192, False),
        ("pwa-512x512.png", 512, False),
        ("apple-touch-icon-180x180.png", 180, False)
    ]

    # Resize filter depending on Pillow version (use Resampling if available)
    try:
        resample_filter = Image.Resampling.LANCZOS
    except AttributeError:
        resample_filter = Image.ANTIALIAS

    # Generate standard icons
    for filename, target_size, _ in configs:
        out_img = square_img.resize((target_size, target_size), resample_filter)
        out_path = os.path.join(output_dir, filename)
        out_img.save(out_path, "PNG")
        print(f"Saved: {out_path} ({target_size}x{target_size})")

    # Generate maskable icon (logo size is reduced to 70% and centered to fit within safe zone)
    maskable_size = 512
    logo_size = int(maskable_size * 0.7)
    resized_logo = square_img.resize((logo_size, logo_size), resample_filter)
    
    maskable_img = Image.new("RGBA", (maskable_size, maskable_size), (255, 255, 255, 0))
    # Center the logo in the maskable canvas
    logo_offset = (maskable_size - logo_size) // 2
    maskable_img.paste(resized_logo, (logo_offset, logo_offset))
    
    maskable_path = os.path.join(output_dir, "maskable-icon-512x512.png")
    maskable_img.save(maskable_path, "PNG")
    print(f"Saved Maskable Icon: {maskable_path} ({maskable_size}x{maskable_size})")

if __name__ == "__main__":
    generate_icons()
