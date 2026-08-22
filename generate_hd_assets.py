from PIL import Image, ImageDraw, ImageFont
import os

def create_paving():
    img = Image.new('RGBA', (40, 40), (180, 180, 190))
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, 39, 39], outline=(150, 150, 160))
    for x in range(0, 40, 10):
        for y in range(0, 40, 10):
            draw.rectangle([x+1, y+1, x+9, y+9], fill=(190, 190, 200), outline=(160, 160, 170))
    img.save("public/assets/paving.png")

def create_grass_hd():
    img = Image.new('RGBA', (40, 40), (105, 192, 105)) # vibrant green
    draw = ImageDraw.Draw(img)
    draw.rectangle([0,0,39,39], outline=(90, 170, 90))
    # little grass strokes
    draw.line([(5, 5), (5, 8)], fill=(80, 160, 80))
    draw.line([(15, 12), (15, 15)], fill=(80, 160, 80))
    draw.line([(30, 25), (30, 28)], fill=(80, 160, 80))
    draw.line([(20, 32), (20, 35)], fill=(80, 160, 80))
    img.save("public/assets/grass_hd.png")

def create_wall(color_base, name):
    img = Image.new('RGBA', (40, 40), color_base)
    draw = ImageDraw.Draw(img)
    draw.rectangle([0,0,39,39], outline=(0,0,0,100))
    # brick pattern
    draw.line([(0, 10), (40, 10)], fill=(0,0,0,80))
    draw.line([(0, 20), (40, 20)], fill=(0,0,0,80))
    draw.line([(0, 30), (40, 30)], fill=(0,0,0,80))
    draw.line([(10, 0), (10, 10)], fill=(0,0,0,80))
    draw.line([(30, 0), (30, 10)], fill=(0,0,0,80))
    draw.line([(20, 10), (20, 20)], fill=(0,0,0,80))
    draw.line([(10, 20), (10, 30)], fill=(0,0,0,80))
    draw.line([(30, 20), (30, 30)], fill=(0,0,0,80))
    draw.line([(20, 30), (20, 40)], fill=(0,0,0,80))
    img.save(f"public/assets/wall_{name}.png")

def create_floor(color1, color2, name):
    img = Image.new('RGBA', (40, 40), color1)
    draw = ImageDraw.Draw(img)
    # checkerboard
    draw.rectangle([0, 0, 19, 19], fill=color2)
    draw.rectangle([20, 20, 39, 39], fill=color2)
    img.save(f"public/assets/floor_{name}.png")

def create_hero():
    # True pixel art style (16x16 scaled to 32x32)
    for i in range(4):
        img = Image.new('RGBA', (32, 32), (0,0,0,0))
        draw = ImageDraw.Draw(img)
        # Hair/Hat
        draw.rectangle([10, 2, 22, 6], fill=(70,40,20))
        # Face
        draw.rectangle([10, 6, 22, 14], fill=(255,200,160))
        # Eyes
        draw.rectangle([12, 8, 14, 10], fill=(0,0,0))
        draw.rectangle([18, 8, 20, 10], fill=(0,0,0))
        # Body
        draw.rectangle([8, 14, 24, 24], fill=(220, 50, 50))
        # Legs
        if i % 2 == 0:
            draw.rectangle([10, 24, 14, 30], fill=(50,50,150))
            draw.rectangle([18, 24, 22, 30], fill=(50,50,150))
        elif i == 1:
            draw.rectangle([10, 24, 14, 28], fill=(50,50,150))
            draw.rectangle([18, 24, 22, 32], fill=(50,50,150))
        else:
            draw.rectangle([10, 24, 14, 32], fill=(50,50,150))
            draw.rectangle([18, 24, 22, 28], fill=(50,50,150))

        img.save(f"public/assets/hero_{i}.png")

def create_props():
    # Vending Machine
    v = Image.new('RGBA', (40, 40), (0,0,0,0))
    d = ImageDraw.Draw(v)
    d.rectangle([5, 0, 35, 40], fill=(200, 30, 30), outline=(0,0,0))
    d.rectangle([10, 5, 30, 20], fill=(200, 255, 255), outline=(0,0,0)) # glass
    d.rectangle([10, 25, 25, 35], fill=(50,50,50)) # dispenser
    v.save("public/assets/prop_vending.png")

    # Sign board
    s = Image.new('RGBA', (40, 40), (0,0,0,0))
    d = ImageDraw.Draw(s)
    d.rectangle([15, 20, 25, 40], fill=(100,50,0), outline=(0,0,0)) # post
    d.rectangle([0, 0, 40, 20], fill=(200,150,100), outline=(0,0,0)) # board
    s.save("public/assets/prop_sign.png")

os.makedirs("public/assets", exist_ok=True)
create_paving()
create_grass_hd()
create_wall((150, 150, 160), "gray")
create_wall((200, 100, 100), "red")
create_floor((255, 255, 255), (200, 200, 200), "marble")
create_floor((139, 69, 19), (160, 82, 45), "wood")
create_floor((240, 240, 240), (200, 240, 240), "linoleum")
create_hero()
create_props()

print("HD Assets generated.")
