from PIL import Image, ImageDraw, ImageFont
import os

def create_grass_tile():
    img = Image.new('RGBA', (40, 40), (138, 201, 38)) # Warm green
    draw = ImageDraw.Draw(img)
    # Draw some grass tufts
    draw.rectangle([5, 10, 7, 14], fill=(120, 180, 30))
    draw.rectangle([6, 12, 8, 16], fill=(120, 180, 30))
    draw.rectangle([25, 25, 27, 29], fill=(120, 180, 30))
    draw.rectangle([26, 27, 28, 31], fill=(120, 180, 30))
    # Small flowers
    draw.rectangle([15, 30, 17, 32], fill=(255, 220, 100))
    img.save("public/assets/grass_tile.png")

def create_road_tile():
    img = Image.new('RGBA', (40, 40), (200, 190, 175)) # Warm stone/dirt road
    draw = ImageDraw.Draw(img)
    # Pebbles/texture
    draw.point((10, 10), fill=(180, 170, 155))
    draw.point((12, 11), fill=(180, 170, 155))
    draw.point((30, 20), fill=(180, 170, 155))
    draw.point((15, 35), fill=(180, 170, 155))
    draw.point((25, 5), fill=(180, 170, 155))
    # Edge shadow
    draw.line([(0, 0), (0, 39)], fill=(180, 170, 155), width=2)
    img.save("public/assets/road_tile.png")

def create_doormat():
    img = Image.new('RGBA', (40, 40), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    # Welcome mat
    draw.rectangle([5, 10, 35, 30], fill=(200, 100, 50), outline=(100, 50, 20), width=2)
    draw.line([(10, 20), (30, 20)], fill=(250, 150, 100), width=2)
    img.save("public/assets/doormat.png")

def create_building(name, color, roof_color, door_color):
    # 4x3 tiles = 160x120 pixels
    img = Image.new('RGBA', (160, 120), (0,0,0,0))
    draw = ImageDraw.Draw(img)

    # Base building
    draw.rectangle([10, 40, 150, 119], fill=color, outline=(0,0,0), width=2)

    # Brick/wood texture lines
    draw.line([(20, 60), (140, 60)], fill=(0,0,0, 50), width=1)
    draw.line([(20, 80), (140, 80)], fill=(0,0,0, 50), width=1)
    draw.line([(20, 100), (140, 100)], fill=(0,0,0, 50), width=1)

    # Roof (pitched)
    draw.polygon([(0, 40), (80, 0), (160, 40)], fill=roof_color, outline=(0,0,0))
    # Roof tiles texture
    draw.line([(80, 0), (10, 40)], fill=(255,255,255, 50), width=2)
    draw.line([(80, 0), (30, 40)], fill=(255,255,255, 50), width=2)
    draw.line([(80, 0), (50, 40)], fill=(255,255,255, 50), width=2)

    # Door (center bottom)
    draw.rectangle([65, 80, 95, 119], fill=door_color, outline=(0,0,0), width=2)
    # Doorknob
    draw.ellipse([85, 95, 90, 100], fill=(255,215,0), outline=(0,0,0))

    # Windows
    draw.rectangle([25, 65, 50, 90], fill=(135,206,235), outline=(0,0,0), width=2) # Left
    draw.line([(25, 77), (50, 77)], fill=(0,0,0), width=2) # pane
    draw.line([(37, 65), (37, 90)], fill=(0,0,0), width=2)

    draw.rectangle([110, 65, 135, 90], fill=(135,206,235), outline=(0,0,0), width=2) # Right
    draw.line([(110, 77), (135, 77)], fill=(0,0,0), width=2)
    draw.line([(122, 65), (122, 90)], fill=(0,0,0), width=2)

    img.save(f"public/assets/bldg_{name}.png")

def create_player():
    # 4 frames for walking down
    for i in range(4):
        img = Image.new('RGBA', (30, 30), (0,0,0,0))
        draw = ImageDraw.Draw(img)
        # Head
        draw.ellipse([10, 0, 20, 10], fill=(255,200,150), outline=(0,0,0))
        # Body
        draw.rectangle([8, 10, 22, 20], fill=(50, 100, 200), outline=(0,0,0))
        # Legs
        if i % 2 == 0:
            draw.rectangle([10, 20, 14, 28], fill=(50, 50, 50), outline=(0,0,0))
            draw.rectangle([16, 20, 20, 28], fill=(50, 50, 50), outline=(0,0,0))
        elif i == 1:
            draw.rectangle([10, 20, 14, 25], fill=(50, 50, 50), outline=(0,0,0))
            draw.rectangle([16, 20, 20, 29], fill=(50, 50, 50), outline=(0,0,0))
        else:
            draw.rectangle([10, 20, 14, 29], fill=(50, 50, 50), outline=(0,0,0))
            draw.rectangle([16, 20, 20, 25], fill=(50, 50, 50), outline=(0,0,0))

        img.save(f"public/assets/player_walk_{i}.png")

def create_tree():
    img = Image.new('RGBA', (80, 80), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    # Trunk
    draw.rectangle([35, 50, 45, 75], fill=(139,69,19), outline=(0,0,0))
    # Leaves (circles)
    draw.ellipse([15, 10, 65, 60], fill=(34,139,34), outline=(0,0,0), width=2)
    draw.ellipse([5, 25, 45, 65], fill=(34,139,34), outline=(0,0,0), width=2)
    draw.ellipse([35, 25, 75, 65], fill=(34,139,34), outline=(0,0,0), width=2)
    draw.ellipse([25, 0, 55, 30], fill=(34,139,34), outline=(0,0,0), width=2)
    img.save("public/assets/tree.png")

def create_bench():
    img = Image.new('RGBA', (80, 40), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    # Seat
    draw.rectangle([10, 20, 70, 30], fill=(200,150,100), outline=(0,0,0), width=2)
    # Backrest
    draw.rectangle([10, 5, 70, 15], fill=(200,150,100), outline=(0,0,0), width=2)
    # Legs
    draw.rectangle([15, 30, 20, 40], fill=(100,50,0), outline=(0,0,0))
    draw.rectangle([60, 30, 65, 40], fill=(100,50,0), outline=(0,0,0))
    img.save("public/assets/bench.png")

os.makedirs("public/assets", exist_ok=True)
create_grass_tile()
create_road_tile()
create_doormat()
create_player()
create_tree()
create_bench()

# 6 buildings
create_building("bank", (200, 200, 200), (70, 70, 90), (139, 69, 19)) # Light gray, slate roof
create_building("postoffice", (250, 150, 150), (200, 50, 50), (255, 255, 255)) # Light red, bright red roof
create_building("shop", (255, 230, 150), (200, 120, 50), (139, 69, 19)) # Yellow, orange roof
create_building("hospital", (200, 240, 255), (100, 180, 255), (255, 255, 255)) # Light blue, blue roof
create_building("gov", (240, 230, 210), (150, 140, 120), (100, 50, 20)) # Beige, brown roof
create_building("bus", (150, 200, 250), (50, 100, 200), (0, 0, 0, 0)) # Open structure

print("Assets generated.")
