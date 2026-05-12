"""
File validation utilities for uploaded images.
"""

from fastapi import UploadFile, HTTPException
from app.config import settings


def validate_upload(file: UploadFile) -> None:
    """
    Validate uploaded file type and size.
    Raises HTTPException if validation fails.
    """
    # Check file extension
    if not file.filename:
        raise HTTPException(status_code=400, detail="Dosya adı bulunamadı / Filename missing.")

    extension = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if extension not in settings.ALLOWED_EXTENSIONS:
        allowed = ", ".join(settings.ALLOWED_EXTENSIONS)
        raise HTTPException(
            status_code=400,
            detail=f"Desteklenmeyen dosya türü: .{extension}. İzin verilen: {allowed}"
        )

    # Check content type
    allowed_content_types = ["image/jpeg", "image/png", "image/jpg"]
    if file.content_type and file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=400,
            detail=f"Desteklenmeyen içerik türü: {file.content_type}"
        )


def validate_file_size(content: bytes) -> None:
    """Validate file size after reading."""
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"Dosya boyutu çok büyük. Maksimum: {settings.MAX_FILE_SIZE_MB}MB"
        )
