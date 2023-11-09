'use strict'

const nutrientTypesArray = [
  {
    id: 1,
    description: 'Energy (kcal)',
    unit_id: 'Kilocalorie',
  },
  {
    id: 2,
    description: 'Energy (kJ)',
    unit_id: 'Kilojoule',
  },
  {
    id: 3,
    description:
      'Energy, total metabolisable (kcal, including dietary fibre)',
    unit_id: 'Kilocalorie',
  },
  {
    id: 4,
    description:
      'Energy, total metabolisable, available carbohydrate, FSANZ (kcal)',
    unit_id: 'Kilocalorie',
  },
  {
    id: 5,
    description:
      'Energy, total metabolisable, available carbohydrate, FSANZ (kJ)',
    unit_id: 'Kilojoule',
  },
  {
    id: 6,
    description:
      'Energy, total metabolisable, carbohydrate by difference, FSANZ (kcal)',
    unit_id: 'Kilocalorie',
  },
  {
    id: 7,
    description:
      'Energy, total metabolisable, carbohydrate by difference, FSANZ (kJ)',
    unit_id: 'Kilojoule',
  },
  {
    id: 8,
    description: 'Water',
    unit_id: 'Gram',
  },
  {
    id: 9,
    description: 'Total nitrogen',
    unit_id: 'Gram',
  },
  {
    id: 10,
    description: 'Nitrogen conversion factor',
    unit_id: 'Gram',
  },
  {
    id: 11,
    description: 'Protein',
    unit_id: 'Gram',
  },
  {
    id: 12,
    description: 'Protein labeling',
    unit_id: 'Gram',
  },
  {
    id: 13,
    description: 'Carbohydrate',
    unit_id: 'Gram',
  },
  {
    id: 14,
    description:
      'Available carbohydrates in monosaccharide equivalent',
    unit_id: 'Gram',
  },
  {
    id: 15,
    description: 'Englyst fibre',
    unit_id: 'Gram',
  },
  {
    id: 16,
    description: 'Southgate fibre',
    unit_id: 'Gram',
  },
  {
    id: 17,
    description: 'Dietary fibre (g)     ',
    unit_id: 'Gram',
  },
  {
    id: 18,
    description: 'Fibre, water-insoluble',
    unit_id: 'Gram',
  },
  {
    id: 19,
    description: 'Fibre, water-soluble',
    unit_id: 'Gram',
  },
  {
    id: 20,
    description: 'Alcohol',
    unit_id: 'Gram',
  },
  {
    id: 21,
    description: 'Starch',
    unit_id: 'Gram',
  },
  {
    id: 22,
    description: 'Total sugars',
    unit_id: 'Gram',
  },
  {
    id: 23,
    description: 'Non-milk extrinsic sugars',
    unit_id: 'Gram',
  },
  {
    id: 24,
    description: 'Intrinsic and milk sugars',
    unit_id: 'Gram',
  },
  {
    id: 25,
    description: 'Glucose',
    unit_id: 'Gram',
  },
  {
    id: 26,
    description: 'Fructose',
    unit_id: 'Gram',
  },
  {
    id: 27,
    description: 'Sucrose',
    unit_id: 'Gram',
  },
  {
    id: 28,
    description: 'Maltose',
    unit_id: 'Gram',
  },
  {
    id: 29,
    description: 'Lactose',
    unit_id: 'Gram',
  },
  {
    id: 30,
    description: 'Other sugars (UK)',
    unit_id: 'Gram',
  },
  {
    id: 31,
    description: 'Other Sugars (DK)',
    unit_id: 'Gram',
  },
  {
    id: 32,
    description: 'Total CH expressed as monosaccarides (g)',
    unit_id: 'Gram',
  },
  {
    id: 33,
    description: 'Mono + disaccarides (g)',
    unit_id: 'Gram',
  },
  {
    id: 34,
    description: 'Galactose',
    unit_id: 'Gram',
  },
  {
    id: 35,
    description: 'Monosaccharider, total',
    unit_id: 'Gram',
  },
  {
    id: 36,
    description: 'Disaccharider, total',
    unit_id: 'Gram',
  },
  {
    id: 37,
    description: 'Raffinose',
    unit_id: 'Gram',
  },
  {
    id: 38,
    description: 'Sorbitol',
    unit_id: 'Gram',
  },
  {
    id: 39,
    description: 'Sugar alcohols, total',
    unit_id: 'Gram',
  },
  {
    id: 40,
    description: '(a)Hexoses',
    unit_id: 'Gram',
  },
  {
    id: 41,
    description: '(b)Pentoses',
    unit_id: 'Gram',
  },
  {
    id: 42,
    description: '(c)UronicAcids',
    unit_id: 'Gram',
  },
  {
    id: 43,
    description: 'Cellulose',
    unit_id: 'Gram',
  },
  {
    id: 44,
    description: 'Lignin',
    unit_id: 'Gram',
  },
  {
    id: 45,
    description: 'Crude fibre',
    unit_id: 'Gram',
  },
  {
    id: 46,
    description: 'Neutr.Det.Fibre (NDF)',
    unit_id: 'Gram',
  },
  {
    id: 47,
    description: 'Organic acids (g)',
    unit_id: 'Gram',
  },
  {
    id: 48,
    description: 'Oligosaccarides (g)',
    unit_id: 'Gram',
  },
  {
    id: 49,
    description: 'Fat',
    unit_id: 'Gram',
  },
  {
    id: 50,
    description: 'Satd FA',
    unit_id: 'Gram',
  },
  {
    id: 51,
    description: 'Monounsaturated fatty acids (g)',
    unit_id: 'Gram',
  },
  {
    id: 52,
    description: 'Polyunsaturated fatty acids (g)',
    unit_id: 'Gram',
  },
  {
    id: 53,
    description: 'Sum n-3 fatty acids',
    unit_id: 'Gram',
  },
  {
    id: 54,
    description: 'Sum n-6 fatty acids',
    unit_id: 'Gram',
  },
  {
    id: 55,
    description: 'Cis-Mon FA',
    unit_id: 'Gram',
  },
  {
    id: 56,
    description: 'Cis-n3 FA',
    unit_id: 'Gram',
  },
  {
    id: 57,
    description: 'Cis-n6 FA',
    unit_id: 'Gram',
  },
  {
    id: 58,
    description: 'Trans FA',
    unit_id: 'Gram',
  },
  {
    id: 59,
    description: 'Cholesterol',
    unit_id: 'Milligram',
  },
  {
    id: 60,
    description: 'Fatty acid 18:3 omega-3',
    unit_id: 'Gram',
  },
  {
    id: 61,
    description: 'Fatty acid 20:4 omega-3',
    unit_id: 'Gram',
  },
  {
    id: 62,
    description: 'Fatty acid 20:5 omega-3',
    unit_id: 'Gram',
  },
  {
    id: 63,
    description: 'Fatty acid 22:5 omega-3',
    unit_id: 'Gram',
  },
  {
    id: 64,
    description: 'Fatty acid 22:6 omega-3',
    unit_id: 'Gram',
  },
  {
    id: 65,
    description: 'Fatty acid cis, trans 18:2 omega-9, 11',
    unit_id: 'Gram',
  },
  {
    id: 66,
    description: 'Fatty acid cis,cis 18:2 omega-6',
    unit_id: 'Gram',
  },
  {
    id: 67,
    description:
      'Fatty acids, total long chain polyunsaturated omega-3',
    unit_id: 'Gram',
  },
  {
    id: 68,
    description: 'Fatty acids, total polyunsaturated omega-3',
    unit_id: 'Gram',
  },
  {
    id: 69,
    description: 'Fatty acids, total polyunsaturated omega-6',
    unit_id: 'Gram',
  },
  {
    id: 70,
    description: 'C4:0',
    unit_id: 'Gram',
  },
  {
    id: 71,
    description: 'C6:0',
    unit_id: 'Gram',
  },
  {
    id: 72,
    description: 'C8:0',
    unit_id: 'Gram',
  },
  {
    id: 73,
    description: 'C10:0',
    unit_id: 'Gram',
  },
  {
    id: 74,
    description: 'C12:0',
    unit_id: 'Gram',
  },
  {
    id: 75,
    description: 'C14:0',
    unit_id: 'Gram',
  },
  {
    id: 76,
    description: 'C15:0',
    unit_id: 'Gram',
  },
  {
    id: 77,
    description: 'C16:0',
    unit_id: 'Gram',
  },
  {
    id: 78,
    description: 'C17:0',
    unit_id: 'Gram',
  },
  {
    id: 79,
    description: 'C18:0',
    unit_id: 'Gram',
  },
  {
    id: 80,
    description: 'C20:0',
    unit_id: 'Gram',
  },
  {
    id: 81,
    description: 'C22:0',
    unit_id: 'Gram',
  },
  {
    id: 82,
    description: 'C24:0',
    unit_id: 'Gram',
  },
  {
    id: 83,
    description: 'Saturated F.A., other',
    unit_id: 'Gram',
  },
  {
    id: 84,
    description: 'C14:1,n-5',
    unit_id: 'Gram',
  },
  {
    id: 85,
    description: 'C15:1',
    unit_id: 'Gram',
  },
  {
    id: 86,
    description: 'C16:1,n-7',
    unit_id: 'Gram',
  },
  {
    id: 87,
    description: 'C16:1,trans',
    unit_id: 'Gram',
  },
  {
    id: 88,
    description: 'C17:1,n-7',
    unit_id: 'Gram',
  },
  {
    id: 89,
    description: 'C18:1,n-9',
    unit_id: 'Gram',
  },
  {
    id: 90,
    description: 'C18:1,n-7',
    unit_id: 'Gram',
  },
  {
    id: 91,
    description: 'C18:1,trans n-9',
    unit_id: 'Gram',
  },
  {
    id: 92,
    description: 'C20:1,n-9',
    unit_id: 'Gram',
  },
  {
    id: 93,
    description: 'C20:1,n-11',
    unit_id: 'Gram',
  },
  {
    id: 94,
    description: 'C20:1,trans',
    unit_id: 'Gram',
  },
  {
    id: 95,
    description: 'C22:1,n-9',
    unit_id: 'Gram',
  },
  {
    id: 96,
    description: 'C22:1,n-11',
    unit_id: 'Gram',
  },
  {
    id: 97,
    description: 'C22:1,trans',
    unit_id: 'Gram',
  },
  {
    id: 98,
    description: 'C24:1,n-9',
    unit_id: 'Gram',
  },
  {
    id: 99,
    description: 'Other monounsaturated.',
    unit_id: 'Gram',
  },
  {
    id: 100,
    description: 'C18:2,n-6',
    unit_id: 'Gram',
  },
  {
    id: 101,
    description: 'C18: 2 conj-A, undifferentiated',
    unit_id: 'Gram',
  },
  {
    id: 102,
    description: 'C18: 2, trans, undifferentiated',
    unit_id: 'Gram',
  },
  {
    id: 103,
    description: 'C18:3,n-3',
    unit_id: 'Gram',
  },
  {
    id: 104,
    description: 'C18:3,n-6',
    unit_id: 'Gram',
  },
  {
    id: 105,
    description: 'C18:4,n-3',
    unit_id: 'Gram',
  },
  {
    id: 106,
    description: 'C20:2,n-6',
    unit_id: 'Gram',
  },
  {
    id: 107,
    description: 'C20:4,n-3',
    unit_id: 'Gram',
  },
  {
    id: 108,
    description: 'C20:3,n-3',
    unit_id: 'Gram',
  },
  {
    id: 109,
    description: 'C20:3,n-6',
    unit_id: 'Gram',
  },
  {
    id: 110,
    description: 'C20:4,n-6',
    unit_id: 'Gram',
  },
  {
    id: 111,
    description: 'C20:5,n-3',
    unit_id: 'Gram',
  },
  {
    id: 112,
    description: 'C22:5,n-3',
    unit_id: 'Gram',
  },
  {
    id: 113,
    description: 'C22:6,n-3',
    unit_id: 'Gram',
  },
  {
    id: 114,
    description: 'Retinol',
    unit_id: 'Microgram',
  },
  {
    id: 115,
    description: 'Total carotene',
    unit_id: 'Microgram',
  },
  {
    id: 116,
    description: 'Alpha-carotene',
    unit_id: 'Microgram',
  },
  {
    id: 117,
    description: 'Beta-carotene',
    unit_id: 'Microgram',
  },
  {
    id: 118,
    description: 'Beta-carotene equivalents',
    unit_id: 'Microgram',
  },
  {
    id: 119,
    description: 'Beta cryptoxanthin',
    unit_id: 'Microgram',
  },
  {
    id: 120,
    description: 'Vitamin A',
    unit_id: 'Microgram',
  },
  {
    id: 121,
    description: 'Vitamin A Retionol equivelents',
    unit_id: 'Microgram',
  },
  {
    id: 122,
    description: 'Vitamin D',
    unit_id: 'Microgram',
  },
  {
    id: 123,
    description: 'Thiamin',
    unit_id: 'Milligram',
  },
  {
    id: 124,
    description: 'Riboflavin',
    unit_id: 'Milligram',
  },
  {
    id: 125,
    description: 'Niacin',
    unit_id: 'Milligram',
  },
  {
    id: 126,
    description: 'Tryptophan/60',
    unit_id: 'Milligram',
  },
  {
    id: 127,
    description: 'Tryptophan',
    unit_id: 'Milligram',
  },
  {
    id: 128,
    description: 'Niacin equivalent',
    unit_id: 'Gram',
  },
  {
    id: 129,
    description: 'Vitamin C',
    unit_id: 'Milligram',
  },
  {
    id: 130,
    description: 'Vitamin E',
    unit_id: 'Milligram',
  },
  {
    id: 131,
    description: 'Vitamin E, alpha-tocopherol equivalents',
    unit_id: 'Milligram',
  },
  {
    id: 132,
    description: 'Vitamin B6',
    unit_id: 'Milligram',
  },
  {
    id: 133,
    description: 'Vitamin B12',
    unit_id: 'Microgram',
  },
  {
    id: 134,
    description: 'Folate',
    unit_id: 'Microgram',
  },
  {
    id: 135,
    description: 'Folate food, naturally occurring food folates',
    unit_id: 'Microgram',
  },
  {
    id: 136,
    description: 'Pantothenic acid',
    unit_id: 'Microgram',
  },
  {
    id: 137,
    description: 'Biotin',
    unit_id: 'Microgram',
  },
  {
    id: 138,
    description: 'Sodium',
    unit_id: 'Milligram',
  },
  {
    id: 139,
    description: 'Potassium',
    unit_id: 'Milligram',
  },
  {
    id: 140,
    description: 'Calcium',
    unit_id: 'Milligram',
  },
  {
    id: 141,
    description: 'Magnesium',
    unit_id: 'Milligram',
  },
  {
    id: 142,
    description: 'Phosphorus',
    unit_id: 'Milligram',
  },
  {
    id: 143,
    description: 'Iron',
    unit_id: 'Milligram',
  },
  {
    id: 144,
    description: 'Haem iron',
    unit_id: 'Milligram',
  },
  {
    id: 145,
    description: 'Non-haem iron',
    unit_id: 'Milligram',
  },
  {
    id: 146,
    description: 'Copper',
    unit_id: 'Milligram',
  },
  {
    id: 147,
    description: 'Zinc',
    unit_id: 'Milligram',
  },
  {
    id: 148,
    description: 'Chloride',
    unit_id: 'Milligram',
  },
  {
    id: 149,
    description: 'Iodine',
    unit_id: 'Microgram',
  },
  {
    id: 150,
    description: 'Iodide',
    unit_id: 'Microgram',
  },
  {
    id: 151,
    description: 'Manganese',
    unit_id: 'Milligram',
  },
  {
    id: 152,
    description: 'Selenium',
    unit_id: 'Microgram',
  },
  {
    id: 153,
    description: 'Linoleic acid (g)',
    unit_id: 'Gram',
  },
  {
    id: 154,
    description: 'NaCl (mg)',
    unit_id: 'Milligram',
  },
  {
    id: 155,
    description: 'a-Tocopherol (mg)',
    unit_id: 'Milligram',
  },
  {
    id: 156,
    description: 'Beta-tocopherol',
    unit_id: 'Milligram',
  },
  {
    id: 157,
    description: 'Ash (g)',
    unit_id: 'Gram',
  },
  {
    id: 158,
    description: 'Caffeine',
    unit_id: 'Milligram',
  },
  {
    id: 159,
    description: 'Carbohydrate by difference, FSANZ',
    unit_id: 'Gram',
  },
  {
    id: 160,
    description: 'Delta-tocopherol',
    unit_id: 'Milligram',
  },
  {
    id: 161,
    description: 'Gamma-tocopherol',
    unit_id: 'Milligram',
  },
  {
    id: 162,
    description: 'Dietary folate equivalents',
    unit_id: 'Microgram',
  },
  {
    id: 163,
    description: 'Folic acid, synthetic folic acid',
    unit_id: 'Microgram',
  },
  {
    id: 164,
    description: 'Niacin equivalents from tryptophan',
    unit_id: 'Milligram',
  },
  {
    id: 165,
    description: 'Total carbohydrate by difference',
    unit_id: 'Gram',
  },
  {
    id: 166,
    description: 'Carbohydrate, available',
    unit_id: 'Gram',
  },
  {
    id: 167,
    description: 'Available carbohydrate by difference',
    unit_id: 'Gram',
  },
  {
    id: 168,
    description: 'Available carbohydrates by weight',
    unit_id: 'Gram',
  },
  {
    id: 169,
    description: 'Total carbohydrates by summation',
    unit_id: 'Gram',
  },
  {
    id: 170,
    description: 'Carbohydrate, labeling',
    unit_id: 'Gram',
  },
  {
    id: 171,
    description: 'Added sugar',
    unit_id: 'Gram',
  },
  {
    id: 172,
    description: 'Fatty acid conversion factor (FCF)',
    unit_id: 'Gram',
  },
  {
    id: 173,
    description: 'Dry matter',
    unit_id: 'Gram',
  },
  {
    id: 174,
    description: 'D3 cholecalciferol',
    unit_id: 'Microgram',
  },
  {
    id: 175,
    description: '25-hydroxycholecalciferol',
    unit_id: 'Microgram',
  },
  {
    id: 176,
    description: 'alpha-tocotrienol',
    unit_id: 'Milligram',
  },
  {
    id: 177,
    description: 'Vitamin K1',
    unit_id: 'Milligram',
  },
  {
    id: 178,
    description: 'Vitamin B1',
    unit_id: 'Milligram',
  },
  {
    id: 179,
    description: 'HET, hydroxyethyl thiazole',
    unit_id: 'Milligram',
  },
  {
    id: 180,
    description: 'Free folate',
    unit_id: 'Microgram',
  },
  {
    id: 181,
    description: 'L-ascorbic acid',
    unit_id: 'Milligram',
  },
  {
    id: 182,
    description: 'L-dehydroascorbic',
    unit_id: 'Milligram',
  },
  {
    id: 183,
    description: 'Chromium, Cr',
    unit_id: 'Microgram',
  },
  {
    id: 184,
    description: 'Molybdenum, Mo',
    unit_id: 'Microgram',
  },
  {
    id: 185,
    description: 'Cobalt, Co.',
    unit_id: 'Microgram',
  },
  {
    id: 186,
    description: 'Nickel, Ni',
    unit_id: 'Microgram',
  },
  {
    id: 187,
    description: 'Mercury, Hg',
    unit_id: 'Microgram',
  },
  {
    id: 188,
    description: 'Arsenic, As',
    unit_id: 'Microgram',
  },
  {
    id: 189,
    description: 'Cadmium, Cd',
    unit_id: 'Microgram',
  },
  {
    id: 190,
    description: 'Lead, Pb',
    unit_id: 'Microgram',
  },
  {
    id: 191,
    description: 'Tin, Sn',
    unit_id: 'Microgram',
  },
  {
    id: 192,
    description: 'L-lactic acid',
    unit_id: 'Gram',
  },
  {
    id: 193,
    description: 'D-lactic acid',
    unit_id: 'Gram',
  },
  {
    id: 194,
    description: 'Lactic acid, total',
    unit_id: 'Gram',
  },
  {
    id: 195,
    description: 'Citric acid',
    unit_id: 'Gram',
  },
  {
    id: 196,
    description: 'Oxalic acid',
    unit_id: 'Milligram',
  },
  {
    id: 197,
    description: 'Malic Acid',
    unit_id: 'Milligram',
  },
  {
    id: 198,
    description: 'Acetic Acid',
    unit_id: 'Gram',
  },
  {
    id: 199,
    description: 'Benzoic acid',
    unit_id: 'Milligram',
  },
  {
    id: 200,
    description: 'Histamine',
    unit_id: 'Milligram',
  },
  {
    id: 201,
    description: 'Tyramine',
    unit_id: 'Milligram',
  },
  {
    id: 202,
    description: 'Phenylethylamine',
    unit_id: 'Milligram',
  },
  {
    id: 203,
    description: 'Putrescin',
    unit_id: 'Milligram',
  },
  {
    id: 204,
    description: 'Cadaverine',
    unit_id: 'Milligram',
  },
  {
    id: 205,
    description: 'Spermine',
    unit_id: 'Milligram',
  },
  {
    id: 206,
    description: 'Spermidine',
    unit_id: 'Milligram',
  },
  {
    id: 207,
    description: 'Serotonin',
    unit_id: 'Milligram',
  },
  {
    id: 208,
    description: 'Other polyunsaturated',
    unit_id: 'Gram',
  },
  {
    id: 209,
    description: 'Other fatty acids',
    unit_id: 'Gram',
  },
  {
    id: 210,
    description: 'Fatty acids, total',
    unit_id: 'Gram',
  },
  {
    id: 211,
    description: 'Isoleucine',
    unit_id: 'Gram',
  },
  {
    id: 212,
    description: 'Leucine',
    unit_id: 'Gram',
  },
  {
    id: 213,
    description: 'Lysine',
    unit_id: 'Gram',
  },
  {
    id: 214,
    description: 'Methionine',
    unit_id: 'Gram',
  },
  {
    id: 215,
    description: 'Cystine',
    unit_id: 'Gram',
  },
  {
    id: 216,
    description: 'Phenylalanine',
    unit_id: 'Gram',
  },
  {
    id: 217,
    description: 'Tyrosine',
    unit_id: 'Gram',
  },
  {
    id: 218,
    description: 'Threonine',
    unit_id: 'Gram',
  },
  {
    id: 219,
    description: 'Valin',
    unit_id: 'Gram',
  },
  {
    id: 220,
    description: 'Arginine',
    unit_id: 'Gram',
  },
  {
    id: 221,
    description: 'Histidine',
    unit_id: 'Gram',
  },
  {
    id: 222,
    description: 'Alanine',
    unit_id: 'Gram',
  },
  {
    id: 223,
    description: 'Aspartic acid',
    unit_id: 'Gram',
  },
  {
    id: 224,
    description: 'Glutamic acid',
    unit_id: 'Gram',
  },
  {
    id: 225,
    description: 'Glycine',
    unit_id: 'Gram',
  },
  {
    id: 226,
    description: 'Proline',
    unit_id: 'Gram',
  },
  {
    id: 227,
    description: 'Serin',
    unit_id: 'Gram',
  },
  {
    id: 228,
    description: 'CO₂ emissions',
    unit_id: 'Gram',
  },
  {
    id: 229,
    description: 'Free sugars',
    unit_id: 'Gram',
  },
  {
    id: 230,
    description: 'Folic acid',
    unit_id: 'Microgram',
  },
  {
    id: 231,
    description: 'Alpha-linolenic acid',
    unit_id: 'Gram',
  },
  {
    id: 232,
    description: 'Total long chain omega 3 fatty acids',
    unit_id: 'Milligram',
  },
  {
    id: 233,
    description: 'Total trans fatty acids',
    unit_id: 'Milligram',
  },
  {
    id: 234,
    description: 'Moisture',
    unit_id: 'Gram',
  },
  {
    id: 235,
    description: 'C20:5w3 Eicosapentaenoic',
    unit_id: 'Milligram',
  },
  {
    id: 236,
    description: 'C22:5w3 Docosapentaenoic',
    unit_id: 'Milligram',
  },
  {
    id: 237,
    description: 'C22:6w3 Docosahexaenoic',
    unit_id: 'Milligram',
  },
  {
    id: 238,
    description: 'Energy, with dietary fibre',
    unit_id: 'Kilojoule',
  },
  {
    id: 239,
    description: 'Available carbohydrates, with sugar alcohols',
    unit_id: 'Gram',
  },
  {
    id: 240,
    description: 'Available carbohydrates, without sugar alcohol',
    unit_id: 'Gram',
  },
  {
    id: 241,
    description: 'Vitamin A',
    unit_id: 'International Units',
  },
  {
    id: 242,
    description: 'AOAC',
    unit_id: 'Gram',
  },
  {
    id: 243,
    description: 'FS Table sugar',
    unit_id: 'Gram',
  },
  {
    id: 244,
    description: 'FS Other Added Sugar',
    unit_id: 'Gram',
  },
  {
    id: 245,
    description: 'FS Honey',
    unit_id: 'Gram',
  },
  {
    id: 246,
    description: 'FS Fruit Juice',
    unit_id: 'Gram',
  },
  {
    id: 247,
    description: 'FS Dried Fruit',
    unit_id: 'Gram',
  },
  {
    id: 248,
    description: 'FS Fruit Puree',
    unit_id: 'Gram',
  },
  {
    id: 249,
    description: 'FS Stewed Fruit',
    unit_id: 'Gram',
  },
  {
    id: 250,
    description: 'FS Vegetable Puree',
    unit_id: 'Gram',
  },
  {
    id: 251,
    description: 'Total FS',
    unit_id: 'Gram',
  },
  {
    id: 252,
    description: 'Fruit',
    unit_id: 'Gram',
  },
  {
    id: 253,
    description: 'Dried fruit',
    unit_id: 'Gram',
  },
  {
    id: 254,
    description: 'Fruit juice',
    unit_id: 'Gram',
  },
  {
    id: 255,
    description: 'Smoothie fruit',
    unit_id: 'Gram',
  },
  {
    id: 256,
    description: 'Tomatoes',
    unit_id: 'Gram',
  },
  {
    id: 257,
    description: 'Tomato puree',
    unit_id: 'Gram',
  },
  {
    id: 258,
    description: 'Brassicaceae',
    unit_id: 'Gram',
  },
  {
    id: 259,
    description: 'Yellow Red Green',
    unit_id: 'Gram',
  },
  {
    id: 260,
    description: 'Beans',
    unit_id: 'Gram',
  },
  {
    id: 261,
    description: 'Nuts',
    unit_id: 'Gram',
  },
  {
    id: 262,
    description: 'Other Vegetables',
    unit_id: 'Gram',
  },
  {
    id: 263,
    description: 'Beef',
    unit_id: 'Gram',
  },
  {
    id: 264,
    description: 'Lamb',
    unit_id: 'Gram',
  },
  {
    id: 265,
    description: 'Pork',
    unit_id: 'Gram',
  },
  {
    id: 266,
    description: 'Processed Red Meat',
    unit_id: 'Gram',
  },
  {
    id: 267,
    description: 'Other Red Meat',
    unit_id: 'Gram',
  },
  {
    id: 268,
    description: 'Burgers',
    unit_id: 'Gram',
  },
  {
    id: 269,
    description: 'Sausages',
    unit_id: 'Gram',
  },
  {
    id: 270,
    description: 'Offal',
    unit_id: 'Gram',
  },
  {
    id: 271,
    description: 'Poultry',
    unit_id: 'Gram',
  },
  {
    id: 272,
    description: 'Processed Poultry',
    unit_id: 'Gram',
  },
  {
    id: 273,
    description: 'Game Birds',
    unit_id: 'Gram',
  },
  {
    id: 274,
    description: 'White Fish',
    unit_id: 'Gram',
  },
  {
    id: 275,
    description: 'Oily Fish',
    unit_id: 'Gram',
  },
  {
    id: 276,
    description: 'Canned Tuna',
    unit_id: 'Gram',
  },
  {
    id: 277,
    description: 'Shellfish',
    unit_id: 'Gram',
  },
  {
    id: 278,
    description: 'Cottage Cheese',
    unit_id: 'Gram',
  },
  {
    id: 279,
    description: 'Cheddar Cheese',
    unit_id: 'Gram',
  },
  {
    id: 280,
    description: 'Other Cheese',
    unit_id: 'Gram',
  },
]

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkDelete('nutrient_units', null, {})
      await queryInterface.sequelize.query(
        'ALTER SEQUENCE "nutrient_units_id_seq" RESTART WITH 1',
      )
      // Creating Nutrient Units
      await queryInterface.bulkInsert(
        'nutrient_units',
        [
          {
            description: 'Gram',
            symbol: 'g',
          },
          {
            description: 'Milligram',
            symbol: 'mg',
          },
          {
            description: 'Microgram',
            symbol: 'µg',
          },
          {
            description: 'Kilocalorie',
            symbol: 'kcal',
          },
          {
            description: 'Kilojoule',
            symbol: 'kJ',
          },
          {
            description: 'International Units',
            symbol: 'IU',
          },
        ],
        { transaction },
      )

      // Getting Nutrient Units
      const nutrientUnits = await queryInterface.sequelize.query(
        'SELECT id, description FROM nutrient_units',
        { transaction },
      )

      // Adding coresponding IDs of the Nutrient Units to Nutrient Types property Unit_Id
      for (const nutrientType of nutrientTypesArray) {
        const nutrientUnit = nutrientUnits[0].find(
          unit => unit.description === nutrientType.unit_id,
        )
        nutrientType.unit_id = nutrientUnit.id
      }

      // Creating Nutrient Types
      await queryInterface.bulkInsert('nutrient_types', nutrientTypesArray, {
        transaction,
      })
    }),

  down: async (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkDelete('nutrient_types', null, { transaction })
      await queryInterface.bulkDelete('nutrient_units', null, { transaction })
    }),
}
