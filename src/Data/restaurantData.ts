export interface Restaurant {
  id: number;
  name: string;
  airport: string;
  floor: string;
  terminal: string;
  category: string;
  image: string;
}

export const restaurants: Restaurant[] = [

  { id: 1, name: 'Nasi Goreng Kambing Bansir', airport: 'CGK', floor: 'Floor 2', terminal: 'Terminal 3', category: 'Indonesian', image: '/images/nasgor.webp' },
  { id: 2, name: 'Pondok Laguna', airport: 'CGK', floor: 'Floor 1', terminal: 'Terminal 2', category: 'International', image: '/images/pondoklaguna.webp' },
  { id: 3, name: 'Bakerzin - Soekarno Hatta', airport: 'CGK', floor: 'Floor 1', terminal: 'Terminal 3', category: 'Indonesian', image: '/images/bakerzin.webp' },
  { id: 4, name: 'Jetski Cafe', airport: 'CGK', floor: 'Floor 2', terminal: 'Terminal 2', category: 'Cafe', image: '/images/jetski.webp' },
  { id: 5, name: 'Bandar Jakarta', airport: 'CGK', floor: 'Floor 1', terminal: 'Terminal 3', category: 'Indonesian', image: '/images/bndr.webp' },
  { id: 6, name: 'Giyanti Coffee Roastery', airport: 'CGK', floor: 'Floor 2', terminal: 'Terminal 2', category: 'Indonesian', image: '/images/cafe.webp' },

  { id: 7, name: 'Bali Beach Cafe', airport: 'DPS', floor: 'Floor 1', terminal: 'International', category: 'International', image: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 8, name: 'Warung Ngurah Rai', airport: 'DPS', floor: 'Floor 1', terminal: 'Domestic', category: 'Indonesian', image: 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 9, name: 'The Bali Lounge', airport: 'DPS', floor: 'Floor 2', terminal: 'International', category: 'International', image: 'https://images.pexels.com/photos/2290753/pexels-photo-2290753.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 10, name: 'Bebek Bengil Express', airport: 'DPS', floor: 'Floor 1', terminal: 'Domestic', category: 'Indonesian', image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 11, name: 'Sunset Bar DPS', airport: 'DPS', floor: 'Floor 2', terminal: 'International', category: 'Bar', image: 'https://images.pexels.com/photos/941864/pexels-photo-941864.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 12, name: 'Nasi Campur Bali', airport: 'DPS', floor: 'Floor 1', terminal: 'Domestic', category: 'Indonesian', image: 'https://images.pexels.com/photos/1410236/pexels-photo-1410236.jpeg?auto=compress&cs=tinysrgb&w=400' },

  { id: 13, name: 'Dapur solo', airport: 'YIA', floor: 'Floor 1', terminal: 'Terminal A', category: 'Indonesian', image: '/images/dapursollo.jpg' },
  { id: 14, name: 'Gudeg Express YIA', airport: 'YIA', floor: 'Floor 1', terminal: 'Terminal A', category: 'Indonesian', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 15, name: 'The Yogya Cafe', airport: 'YIA', floor: 'Floor 2', terminal: 'Terminal B', category: 'Cafe', image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 16, name: 'Sate Klathak Resto', airport: 'YIA', floor: 'Floor 1', terminal: 'Terminal B', category: 'Indonesian', image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=400' },

  { id: 17, name: 'Solaria', airport: 'SUB', floor: 'Floor 1', terminal: 'Terminal 1', category: 'Food Court', image: '/images/solaria.jpg' },
  { id: 18, name: 'Rawon Setan Express', airport: 'SUB', floor: 'Floor 1', terminal: 'Terminal 2', category: 'Indonesian', image: 'https://images.pexels.com/photos/1373915/pexels-photo-1373915.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 19, name: 'Cafe Juanda', airport: 'SUB', floor: 'Floor 2', terminal: 'Terminal 1', category: 'Cafe', image: 'https://images.pexels.com/photos/1833349/pexels-photo-1833349.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 20, name: 'Tahu Tek Surabaya', airport: 'SUB', floor: 'Floor 1', terminal: 'Terminal 2', category: 'Indonesian', image: 'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=400' },

  { id: 21, name: 'Nasi lemak', airport: 'KUL', floor: 'Floor 1', terminal: 'Terminal 1', category: 'Food Court', image: '/images/lemak.webp' },
  { id: 22, name: 'Meat point', airport: 'KUL', floor: 'Floor 1', terminal: 'Terminal 2', category: 'Indonesian', image: '/images/meat.jpg' },
  { id: 23, name: 'Cafe Juanda', airport: 'KUL', floor: 'Floor 2', terminal: 'Terminal 1', category: 'Cafe', image: '/images/beta.webp' },
 
  { id: 24, name: 'New Delhi', airport: 'ICN', floor: 'Floor 1', terminal: 'Terminal 1', category: 'Food Court', image: '/images/newdelhi.jpg' },
  { id: 25, name: 'Kukbingwan', airport: 'ICN', floor: 'Floor 1', terminal: 'Terminal 2', category: 'Indonesian', image: '/images/shop1kr.jpg' },
  { id: 26, name: 'Hangong-Gan', airport: 'ICN', floor: 'Floor 2', terminal: 'Terminal 1', category: 'Cafe', image: '/images/Hangonggan.jpg' },

  { id: 27, name: 'Teppan yaki', airport: 'HND', floor: 'Floor 1', terminal: 'Terminal 1', category: 'Food Court', image: '/images/Teppan.jpg' },
  { id: 28, name: 'Shinjuku Sushi Hatsume', airport: 'HND', floor: 'Floor 2', terminal: 'Terminal 1', category: 'Cafe', image: '/images/dine3jp.jpg' },
  { id: 39, name: 'Ebisu Sushi Hatsume', airport: 'HND', floor: 'Floor 1', terminal: 'Terminal 2', category: 'Indonesian', image: '/images/dine2jp.jpg' },
];

export const shops = [

  { id: 1, name: 'GrandLucky - SCBD', airport: 'CGK', floor: 'Floor 2', terminal: 'Terminal 3', category: 'Duty Free', image: '/images/shop1.webp' },
  { id: 2, name: 'The FoodHall - Grand Indonesia', airport: 'CGK', floor: 'Floor 1', terminal: 'Terminal 2', category: 'Souvenirs', image: '/images/shop2.webp' },
  { id: 3, name: 'Ranch Market Grand Indonesia', airport: 'CGK', floor: 'Floor 1', terminal: 'Terminal 3', category: 'Fashion', image: '/images/sjop3.webp' },

  { id: 4, name: 'Bali Handicraft', airport: 'DPS', floor: 'Floor 1', terminal: 'International', category: 'Souvenirs', image: 'https://images.pexels.com/photos/235990/pexels-photo-235990.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 5, name: 'Duty Free Bali', airport: 'DPS', floor: 'Floor 2', terminal: 'International', category: 'Duty Free', image: 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=400' },

 
  { id: 7, name: 'Surabaya Gift Shop', airport: 'SUB', floor: 'Floor 1', terminal: 'Terminal 1', category: 'Souvenirs', image: 'https://images.pexels.com/photos/972995/pexels-photo-972995.jpeg?auto=compress&cs=tinysrgb&w=400' },

  { id: 7, name: 'Bansar Village', airport: 'KUL', floor: 'Floor 1', terminal: 'Terminal 1', category: 'Souvenirs', image: '/images/shop1kl.jpg' },
  { id: 7, name: 'Pasaray Hock Choon', airport: 'KUL', floor: 'Floor 1', terminal: 'Terminal 1', category: 'Souvenirs', image: '/images/shop2kl.webp' },
];

export const relax = [
  { id: 1, name: 'Kidzania', airport: 'CGK', floor: 'Floor 2', terminal: 'Terminal 3', category: 'Rekreasi', image: '/images/kidz.webp' },
  { id: 2, name: 'Dufan', airport: 'CGK', floor: 'Floor 1', terminal: 'Terminal 2', category: 'Rekreasi', image: '/images/dufan.webp' },

]
