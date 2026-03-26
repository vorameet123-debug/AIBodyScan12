"""
Clothing Type Mappings
Maps clothing types to size charts and relevant body measurements
"""

CLOTHING_TYPES = {
    # Tops
    't-shirt': {'category': 'tops', 'chart': 'generic_tops', 'primary': 'chest_circumference', 'secondary': 'height'},
    'shirt': {'category': 'tops', 'chart': 'generic_tops', 'primary': 'chest_circumference', 'secondary': 'height'},
    'blouse': {'category': 'tops', 'chart': 'generic_tops', 'primary': 'chest_circumference', 'secondary': 'height'},
    'sweater': {'category': 'tops', 'chart': 'generic_tops', 'primary': 'chest_circumference', 'secondary': 'height'},
    'jacket': {'category': 'tops', 'chart': 'generic_tops', 'primary': 'chest_circumference', 'secondary': 'height'},
    'hoodie': {'category': 'tops', 'chart': 'generic_tops', 'primary': 'chest_circumference', 'secondary': 'height'},
    'blazer': {'category': 'tops', 'chart': 'generic_tops', 'primary': 'chest_circumference', 'secondary': 'height'},
    'coat': {'category': 'tops', 'chart': 'generic_tops', 'primary': 'chest_circumference', 'secondary': 'height'},
    'cardigan': {'category': 'tops', 'chart': 'generic_tops', 'primary': 'chest_circumference', 'secondary': 'height'},

    # Bottoms
    'jeans': {'category': 'bottoms', 'chart': 'numeric_pants', 'primary': 'waist_circumference', 'secondary': 'inside leg height'},
    'pants': {'category': 'bottoms', 'chart': 'generic_bottoms', 'primary': 'waist_circumference', 'secondary': 'height'},
    'shorts': {'category': 'bottoms', 'chart': 'generic_bottoms', 'primary': 'waist_circumference', 'secondary': 'height'},
    'trousers': {'category': 'bottoms', 'chart': 'generic_bottoms', 'primary': 'waist_circumference', 'secondary': 'height'},
    'skirt': {'category': 'bottoms', 'chart': 'generic_bottoms', 'primary': 'waist_circumference', 'secondary': 'height'},
    'leggings': {'category': 'bottoms', 'chart': 'generic_bottoms', 'primary': 'waist_circumference', 'secondary': 'height'},

    # Dresses
    'dress': {'category': 'dresses', 'chart': 'dresses', 'primary': 'chest_circumference', 'secondary': 'waist_circumference'},
    'gown': {'category': 'dresses', 'chart': 'dresses', 'primary': 'chest_circumference', 'secondary': 'waist_circumference'},
    'jumpsuit': {'category': 'dresses', 'chart': 'dresses', 'primary': 'chest_circumference', 'secondary': 'waist_circumference'},

    # Activewear
    'sports top': {'category': 'tops', 'chart': 'generic_tops', 'primary': 'chest_circumference', 'secondary': 'height'},
    'athletic shorts': {'category': 'bottoms', 'chart': 'generic_bottoms', 'primary': 'waist_circumference', 'secondary': 'height'},
}

# Size systems
SIZE_SYSTEMS = ['US', 'UK', 'EU', 'AU', 'JP']

# Occasions
OCCASIONS = ['Casual', 'Formal', 'Sports', 'Party', 'Business', 'Wedding', 'Beach', 'Winter', 'Summer']

# Materials
MATERIALS = [
    'Cotton', 'Polyester', 'Wool', 'Linen', 'Silk', 'Denim',
    'Spandex', 'Nylon', 'Rayon', 'Viscose', 'Leather', 'Synthetic Blend'
]

