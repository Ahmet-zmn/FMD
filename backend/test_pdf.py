import requests
import io
import time

def run():
    print("Uploading a dummy image...")
    # Create a simple red png
    from PIL import Image
    img = Image.new('RGB', (100, 100), color = 'red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_bytes = img_byte_arr.getvalue()
    
    files = {"file": ("test.png", img_bytes, "image/png")}
    
    try:
        res = requests.post("http://localhost:8000/api/predict", files=files)
        print("Upload status:", res.status_code)
        data = res.json()
        result_id = data.get("result_id")
        print("Result ID:", result_id)
        
        print(f"Downloading PDF for {result_id}...")
        pdf_res = requests.get(f"http://localhost:8000/api/predict/{result_id}/report/pdf")
        print("PDF download status:", pdf_res.status_code)
        
        with open("test_downloaded.pdf", "wb") as f:
            f.write(pdf_res.content)
            
        print("Initial bytes of PDF:", pdf_res.content[:20])
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    run()
