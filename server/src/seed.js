import 'dotenv/config';
import mongoose from 'mongoose';
import Recipe from './models/Recipe.js';

const recipes = [
  {
    slug: 'methi-thepla', title: 'Methi Thepla', emoji: '🫓', baseServings: 4,
    ingredients: [
      { key: 'atta', name: 'Wheat flour (atta)', qty: 240, unit: 'g', aliases: ['flour', 'atta', 'aata'] },
      { key: 'methi', name: 'Fresh methi, chopped', qty: 60, unit: 'g', aliases: ['methi', 'fenugreek'] },
      { key: 'curd', name: 'Curd', qty: 80, unit: 'g', aliases: ['curd', 'dahi', 'yogurt'] },
      { key: 'salt', name: 'Salt', qty: 1, unit: 'tsp', aliases: ['salt', 'namak'] },
      { key: 'turm', name: 'Turmeric', qty: 0.5, unit: 'tsp', aliases: ['turmeric', 'haldi'] },
      { key: 'oil', name: 'Oil', qty: 2, unit: 'tbsp', aliases: ['oil', 'tel'] },
      { key: 'dust', name: 'Dry flour, dusting', qty: 30, unit: 'g', aliases: ['dusting'] },
    ],
    steps: [
      { verb: 'MIX', text: 'Combine atta, methi, curd and spices in a wide bowl.', ingredients: ['atta', 'methi', 'curd', 'salt', 'turm'] },
      { verb: 'KNEAD', text: 'Add oil. Knead into a soft, smooth dough.', ingredients: ['oil'], timer: { key: 'knead', name: 'Knead', seconds: 300, color: '#ffb300' } },
      { verb: 'REST', text: 'Cover with a damp cloth. Let the dough rest.', ingredients: [], timer: { key: 'rest', name: 'Rest', seconds: 1200, color: '#5be3a1' } },
      { verb: 'ROLL', text: 'Pinch lemon-sized balls. Roll thin, dust as needed.', ingredients: ['dust'], timer: { key: 'tawa', name: 'Tawa heat', seconds: 180, color: '#ff5a3c' } },
      { verb: 'COOK', text: '40 sec per side on a hot tawa. Press with a cloth.', ingredients: ['oil'], timer: { key: 'side', name: 'Side', seconds: 40, color: '#7fb3ff' } },
      { verb: 'SERVE', text: 'Stack, brush with oil, serve with chunda.', ingredients: [] },
    ],
  },
  {
    slug: 'masala-chai', title: 'Masala Chai', emoji: '☕', baseServings: 2,
    ingredients: [
      { key: 'water', name: 'Water', qty: 300, unit: 'ml', aliases: ['water', 'paani', 'pani'] },
      { key: 'ginger', name: 'Crushed ginger', qty: 1, unit: 'tsp', aliases: ['ginger', 'adrak'] },
      { key: 'tea', name: 'Tea leaves', qty: 2, unit: 'tsp', aliases: ['tea', 'patti'] },
      { key: 'sugar', name: 'Sugar', qty: 2, unit: 'tsp', aliases: ['sugar', 'cheeni', 'chini'] },
      { key: 'milk', name: 'Milk', qty: 200, unit: 'ml', aliases: ['milk', 'doodh', 'dudh'] },
    ],
    steps: [
      { verb: 'BOIL', text: 'Boil water with crushed ginger.', ingredients: ['water', 'ginger'], timer: { key: 'boil', name: 'Boil', seconds: 180, color: '#ffb300' } },
      { verb: 'STEEP', text: 'Add tea leaves and sugar. Let it steep.', ingredients: ['tea', 'sugar'], timer: { key: 'steep', name: 'Steep', seconds: 120, color: '#5be3a1' } },
      { verb: 'MILK', text: 'Pour in the milk. Simmer until it rises.', ingredients: ['milk'], timer: { key: 'simmer', name: 'Simmer', seconds: 120, color: '#ff5a3c' } },
      { verb: 'SERVE', text: 'Strain into cups. Serve hot.', ingredients: [] },
    ],
  },
];

await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cook-along');
await Recipe.deleteMany({});
await Recipe.insertMany(recipes);
console.log(`Seeded ${recipes.length} recipes`);
await mongoose.disconnect();
