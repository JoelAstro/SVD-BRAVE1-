/**
 * Curation of premium, high-definition, realistic food photography assets from Unsplash.
 * All images are set with optimized parameters for fast loading and high resolution.
 */
export const HD_FOOD_PHOTOS = {
  biryani: [
    "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=600", // Chicken Dum Biryani
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600", // Veg Biryani
    "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600", // Meat Fry Biryani
    "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600"  // Special/Kaju Biryani
  ],
  paneer: [
    "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=600", // Paneer Tikka
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600", // Paneer Butter Masala style
    "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=600"  // Paneer Majestic style
  ],
  chicken: [
    "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?auto=format&fit=crop&q=80&w=600", // Tandoori Roasted Chicken
    "https://images.unsplash.com/photo-1598511726623-d73400609b40?auto=format&fit=crop&q=80&w=600", // Chilli/Manchurian Chicken
    "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600", // Crispy Fried Chicken
    "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&q=80&w=600"  // Chicken Tikka
  ],
  mutton: [
    "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&q=80&w=600", // Mutton Curry style
    "https://images.unsplash.com/photo-1545247181-516773cae76d?auto=format&fit=crop&q=80&w=600"  // Spicy Mutton Fry style
  ],
  fish: [
    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=600", // Grilled/Apollo Fish
    "https://images.unsplash.com/photo-1535399831218-d5bd362bae09?auto=format&fit=crop&q=80&w=600"  // Crispy Fish
  ],
  prawns: [
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600", // Prawns Fry
    "https://images.unsplash.com/photo-1559737607-357890934982?auto=format&fit=crop&q=80&w=600"  // Spicy Prawns
  ],
  fried_rice: [
    "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600", // Fried Rice Bowl
    "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600"  // Chinese Veg/Egg Fried Rice
  ],
  mushroom: [
    "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600"  // Mushroom Masala/Starter
  ],
  egg: [
    "https://images.unsplash.com/photo-1545247181-516773cae76d?auto=format&fit=crop&q=80&w=600", // Egg Curry
    "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600"  // Egg Scramble/Omelet style
  ],
  babycorn: [
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600"  // Golden/Crispy Baby Corn style
  ],
  dessert: [
    "https://images.unsplash.com/photo-1601356616077-695728ecf769?auto=format&fit=crop&q=80&w=600"  // Gulab Jamun/Indian sweet style
  ],
  drinks: [
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600"  // Milkshake/Lassi
  ]
};

/**
 * Returns a high-definition realistic food photography URL matching the dish name.
 */
export const getHDImageForDish = (dishName: string): string => {
  const name = dishName.toLowerCase();
  
  if (name.includes("biryani")) {
    if (name.includes("paneer")) return HD_FOOD_PHOTOS.paneer[0];
    if (name.includes("mushroom")) return HD_FOOD_PHOTOS.mushroom[0];
    if (name.includes("mutton")) return HD_FOOD_PHOTOS.mutton[1];
    if (name.includes("prawn")) return HD_FOOD_PHOTOS.prawns[0];
    if (name.includes("egg")) return HD_FOOD_PHOTOS.egg[0];
    if (name.includes("veg")) return HD_FOOD_PHOTOS.biryani[1];
    return HD_FOOD_PHOTOS.biryani[0];
  }
  
  if (name.includes("paneer")) {
    if (name.includes("tikka") || name.includes("kabab")) return HD_FOOD_PHOTOS.paneer[0];
    if (name.includes("butter") || name.includes("masala")) return HD_FOOD_PHOTOS.paneer[1];
    return HD_FOOD_PHOTOS.paneer[2];
  }
  
  if (name.includes("chicken")) {
    if (name.includes("tandoori") || name.includes("tangdi") || name.includes("joint")) return HD_FOOD_PHOTOS.chicken[0];
    if (name.includes("manchurian") || name.includes("chilli") || name.includes("dragon")) return HD_FOOD_PHOTOS.chicken[1];
    if (name.includes("fry") || name.includes("crispy") || name.includes("lollipop") || name.includes("wings")) return HD_FOOD_PHOTOS.chicken[2];
    return HD_FOOD_PHOTOS.chicken[3];
  }
  
  if (name.includes("mutton")) {
    if (name.includes("fry") || name.includes("chilli")) return HD_FOOD_PHOTOS.mutton[1];
    return HD_FOOD_PHOTOS.mutton[0];
  }
  
  if (name.includes("fish")) {
    if (name.includes("apollo") || name.includes("tikka")) return HD_FOOD_PHOTOS.fish[0];
    return HD_FOOD_PHOTOS.fish[1];
  }
  
  if (name.includes("prawn")) {
    return HD_FOOD_PHOTOS.prawns[0];
  }
  
  if (name.includes("fried rice") || name.includes("rice")) {
    if (name.includes("veg") || name.includes("kaju")) return HD_FOOD_PHOTOS.fried_rice[0];
    return HD_FOOD_PHOTOS.fried_rice[1];
  }
  
  if (name.includes("mushroom")) {
    return HD_FOOD_PHOTOS.mushroom[0];
  }
  
  if (name.includes("egg") || name.includes("omelet") || name.includes("bhurji")) {
    if (name.includes("curry") || name.includes("tomato")) return HD_FOOD_PHOTOS.egg[0];
    return HD_FOOD_PHOTOS.egg[1];
  }
  
  if (name.includes("baby corn") || name.includes("babycorn")) {
    return HD_FOOD_PHOTOS.babycorn[0];
  }
  
  if (name.includes("jamun") || name.includes("sweet") || name.includes("dessert")) {
    return HD_FOOD_PHOTOS.dessert[0];
  }
  
  if (name.includes("lassi") || name.includes("drink") || name.includes("juice") || name.includes("shake")) {
    return HD_FOOD_PHOTOS.drinks[0];
  }
  
  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600"; // General premium food fallback
};
