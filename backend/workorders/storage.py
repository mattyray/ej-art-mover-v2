import os
from cloudinary_storage.storage import MediaCloudinaryStorage
import cloudinary.uploader


class CustomCloudinaryStorage(MediaCloudinaryStorage):
    """Custom storage that handles all file types correctly"""

    def _save(self, name, content):
        ext = os.path.splitext(name)[1].lower()
        content.seek(0)

        if ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']:
            return super()._save(name, content)
        else:
            result = cloudinary.uploader.upload(
                content,
                resource_type="raw",
                public_id=name,
                use_filename=True,
                unique_filename=False
            )
            return result['public_id']

    def url(self, name):
        if not name:
            return None
        try:
            ext = os.path.splitext(name)[1].lower()
            if ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']:
                return super().url(name)
            else:
                return cloudinary.CloudinaryImage(name).build_url(resource_type="raw")
        except Exception:
            return None
