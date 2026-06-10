import type { Product } from '../types/product'

export const initialProducts: Product[] = [
	{
		id: '1',
		name: 'Logitech Mouse M331 Silent Wireless',
		sku: 'EL-LOG-001',
		category: 'Aksesoris',
		price: 245000,
		stock: 2,
		image:
			'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=80&auto=format&fit=crop&q=60',
	},
	{
		id: '2',
		name: 'Samsung LED Monitor 24" IPS',
		sku: 'EL-SAM-024',
		category: 'Monitor',
		price: 1650000,
		stock: 12,
		image:
			'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=80&auto=format&fit=crop&q=60',
	},
	{
		id: '3',
		name: 'Mechanical Keyboard Rexus Legionare',
		sku: 'EL-REX-005',
		category: 'Aksesoris',
		price: 420000,
		stock: 1,
		image:
			'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=80&auto=format&fit=crop&q=60',
	},
	{
		id: '4',
		name: 'ASUS ROG Strix Laptop Charger 19V',
		sku: 'EL-ASU-099',
		category: 'Charger',
		price: 350000,
		stock: 5,
		image:
			'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=80&auto=format&fit=crop&q=60',
	},
]
