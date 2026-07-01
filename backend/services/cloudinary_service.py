import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


async def upload_pdf(file_bytes: bytes, filename: str) -> dict:
    """
    Upload a PDF to Cloudinary under the 'research_papers' folder.
    Returns { "url": str, "public_id": str }
    """
    # Strip .pdf extension for the public_id — Cloudinary will re-append it
    # via format="pdf", ensuring the secure_url always ends with .pdf
    base_name = filename.rsplit(".", 1)[0] if "." in filename else filename

    result = cloudinary.uploader.upload(
        file_bytes,
        resource_type="raw",
        folder="research_papers",
        public_id=base_name,
        use_filename=True,
        unique_filename=True,
        overwrite=False,
    )

    # Ensure the URL ends with .pdf — Cloudinary raw uploads sometimes omit it
    url = result["secure_url"]
    if not url.lower().endswith(".pdf"):
        url = url + ".pdf"

    return {
        "url":       url,
        "public_id": result["public_id"],
    }

async def delete_pdf(public_id: str) -> dict:
    """
    Delete a PDF from Cloudinary using its public_id.
    Returns the Cloudinary response dict.
    """
    result = cloudinary.uploader.destroy(
        public_id=public_id,
        resource_type="raw"
    )
    return result

