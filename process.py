from PIL import Image

def process_image():
    img = Image.open('src/images/logo.jpeg').convert("RGBA")
    data = img.getdata()
    
    bg_color = data[0]
    
    new_data = []
    
    for item in data:
        avg_bg = sum(bg_color[:3]) / 3.0
        avg_px = sum(item[:3]) / 3.0
        
        if avg_bg == 0: avg_bg = 1
        intensity = min(1.0, max(0.0, avg_px / avg_bg))
        
        alpha = int((1 - intensity) * 255 * 1.8)
        alpha = min(255, max(0, alpha))
        
        if alpha > 15:
            new_data.append((20, 40, 120, alpha))
        else:
            new_data.append((255, 255, 255, 0))
            
    img.putdata(new_data)
    img.save('src/images/logo2.png', "PNG")

if __name__ == "__main__":
    process_image()
    print("Image processed successfully!")
