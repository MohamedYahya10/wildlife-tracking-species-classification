import { AnimalSpecies, TrailCameraStation } from '../types.ts';

export const SPECIES_DATABASE: AnimalSpecies[] = [
  {
    id: 'tiger',
    commonName: 'Royal Bengal Tiger',
    scientificName: 'Panthera tigris tigris',
    class: 'Mammalia',
    order: 'Carnivora',
    family: 'Felidae',
    livingObjectType: 'Apex Carnivorous Mammal (Warm-Blooded Vertebrate)',
    heroImage: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=1000&q=80',
    ],
    modelPredictionAccuracy: 0.994, // 99.4%
    sampleMotionVelocity: '4.8 m/s (Prowling Stride)',
    sampleThermalSignature: '38.4°C (Core Mammalian Core Temp)',
    diet: 'Strict Carnivore: Chital deer, Sambar, Gaur, Wild Boar',
    weightRange: '180 – 260 kg (Males), 100 – 160 kg (Females)',
    funFact: 'No two tigers have the exact same stripe pattern; their stripes are as unique as human fingerprints and even appear on their skin underneath the fur.',
    realDataset: {
      populationCount: '~5,574 in the wild globally (~3,682 in India)',
      populationNumber: 5574,
      populationCensusSource: 'All India Tiger Estimation (NTCA 2023) & IUCN Red List Assessment (2022-2024)',
      populationTrend: 'Increasing',
      iucnStatus: 'Endangered',
      iucnCode: 'EN',
      survivalRate: {
        cubFirstYear: '45% – 50% (High infant mortality from infanticide and natural hazards)',
        adultAnnual: '82% – 85% annual survival rate for territory-holding adults',
        wildLifespan: '10 – 15 years in wild ecosystems',
        captiveLifespan: '18 – 24 years in certified reserves and sanctuaries',
        primaryMortalityCauses: [
          'Territorial combat between competing males (32%)',
          'Infanticide of unprotected litters (28%)',
          'Poaching and retaliatory human snare traps (24%)',
          'Starvation following injury or teeth wear (16%)'
        ]
      },
      habitat: {
        primaryBiomes: [
          'Tropical and subtropical moist broadleaf forests',
          'Alluvial Terai grasslands and riverine floodplains',
          'Sundarbans tidal halophytic mangrove swamps',
          'Dry deciduous and scrub forests'
        ],
        geographicRange: 'Indian Subcontinent (India, Nepal, Bhutan, Bangladesh), with northern subspecies in the Russian Far East',
        territoryRequirement: '25 – 100 km² per adult solitary individual depending on prey density',
        elevationRange: '0 m (Sea-level tidal mangroves) to 3,630 m (Eastern Bhutan Himalayas)',
        gpsReference: '25°59\'20" N, 76°30\'15" E (Ranthambore Tiger Reserve)',
        coordinates: { lat: 25.99, lng: 76.50 },
        climate: 'Subtropical monsoon with distinct wet and dry seasons (temperature: 5°C to 45°C)'
      },
      keyThreats: [
        'Habitat fragmentation (93% of historic range lost to agriculture and urban sprawl)',
        'Poaching for illegal international trade in body parts and skins',
        'Depletion of native ungulate prey base through bushmeat hunting',
        'Human-wildlife conflict along agricultural reserve perimeters'
      ],
      conservationReservesCount: 55,
      conservationInitiatives: 'Project Tiger (India, covering 78,000+ km²), Tx2 Global Wild Tiger Recovery Goal'
    }
  },
  {
    id: 'snow-leopard',
    commonName: 'Snow Leopard (Ghost of the Mountains)',
    scientificName: 'Panthera uncia',
    class: 'Mammalia',
    order: 'Carnivora',
    family: 'Felidae',
    livingObjectType: 'Alpine Solitary Carnivore (Cold-Adapted Endotherm)',
    heroImage: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=1000&q=80'
    ],
    modelPredictionAccuracy: 0.987, // 98.7%
    sampleMotionVelocity: '3.6 m/s (Cliff Stalking)',
    sampleThermalSignature: '37.5°C (Thick Fur Insulation Surface -4.0°C)',
    diet: 'Blue Sheep (Bharal), Siberian Ibex, Himalayan Marmots, Pikas',
    weightRange: '32 – 55 kg',
    funFact: 'Snow leopards cannot roar due to their vocal cord morphology; instead, they communicate through chuffs, hisses, and growls.',
    realDataset: {
      populationCount: '~4,080 – 6,590 wild mature individuals',
      populationNumber: 5300,
      populationCensusSource: 'Global Snow Leopard & Ecosystem Protection Program (GSLEP) / IUCN Red List',
      populationTrend: 'Decreasing',
      iucnStatus: 'Vulnerable',
      iucnCode: 'VU',
      survivalRate: {
        cubFirstYear: '50% – 55% cub survival rate in alpine terrain',
        adultAnnual: '78% – 82% annual adult survival',
        wildLifespan: '10 – 12 years in harsh alpine conditions',
        captiveLifespan: '18 – 22 years in controlled captive conditions',
        primaryMortalityCauses: [
          'Retaliatory pastoralist killings due to livestock predation (40%)',
          'Illegal fur and bone poaching (30%)',
          'Fall injuries on steep scree slopes (15%)',
          'Severe winter food shortages (15%)'
        ]
      },
      habitat: {
        primaryBiomes: [
          'High altitude rugged alpine steppe and tundra',
          'Subalpine shrublands and rocky ridges',
          'Scree slopes, steep gorges, and glacial valleys'
        ],
        geographicRange: 'Central and South Asian mountain ranges across 12 countries (Himalayas, Karakoram, Hindu Kush, Pamirs, Tien Shan, Altai)',
        territoryRequirement: '100 – 1,000 km² due to low prey biomass in barren alpine zones',
        elevationRange: '3,000 m to 5,500 m above sea level',
        gpsReference: '34°09\'12" N, 77°34\'30" E (Hemis High Altitude National Park, Ladakh)',
        coordinates: { lat: 34.15, lng: 77.57 },
        climate: 'Cold arid alpine climate with temperatures dropping below -40°C in winter'
      },
      keyThreats: [
        'Climate change shifting treelines and shrinking alpine habitat zones',
        'Retaliatory killings by livestock herders',
        'Decline in natural prey from competition with domestic yak and goats',
        'Mining and military road infrastructure in high-altitude borders'
      ],
      conservationReservesCount: 120,
      conservationInitiatives: 'GSLEP 20 Secure Landscapes Initiative, Livestock Insurance Schemes'
    }
  },
  {
    id: 'elephant',
    commonName: 'African Savannah Elephant',
    scientificName: 'Loxodonta africana',
    class: 'Mammalia',
    order: 'Proboscidea',
    family: 'Elephantidae',
    livingObjectType: 'Mega-Herbivore Terrestrial Mammal (Endotherm)',
    heroImage: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1581852017103-68ac65514cf7?auto=format&fit=crop&w=1000&q=80'
    ],
    modelPredictionAccuracy: 0.996, // 99.6%
    sampleMotionVelocity: '1.9 m/s (Herd Migration Pace)',
    sampleThermalSignature: '36.2°C (Vascular Heat Radiator Ears)',
    diet: 'Strict Herbivore: Grasses, tree bark, roots, fruits (eats 150-300 kg daily)',
    weightRange: '4,000 – 7,000 kg (Largest living terrestrial animal)',
    funFact: 'An elephant trunk possesses more than 40,000 individual muscles and is sensitive enough to pick up a single blade of grass or fell whole trees.',
    realDataset: {
      populationCount: '~415,000 individuals across the African continent',
      populationNumber: 415000,
      populationCensusSource: 'Great Elephant Census & IUCN African Elephant Status Report',
      populationTrend: 'Decreasing',
      iucnStatus: 'Endangered',
      iucnCode: 'EN',
      survivalRate: {
        cubFirstYear: '75% – 85% calf survival rate when protected by matriarchal herd',
        adultAnnual: '94% – 97% annual survival rate in absence of heavy poaching',
        wildLifespan: '60 – 70 years in healthy wild environments',
        captiveLifespan: '40 – 55 years (often reduced due to lack of migration activity)',
        primaryMortalityCauses: [
          'Organized ivory syndicate poaching (45% in affected zones)',
          'Prolonged drought and desertification (30%)',
          'Human-crop defense conflicts (18%)',
          'Lion pride predation on young calves (7%)'
        ]
      },
      habitat: {
        primaryBiomes: [
          'Sub-Saharan savannahs and open Acacia grasslands',
          'Miombo woodlands and thornbush shrublands',
          'River valleys, marshes, and semi-desert scrub'
        ],
        geographicRange: 'Sub-Saharan Africa across 37 range states, predominantly Southern and Eastern Africa',
        territoryRequirement: '100 – 1,500 km² home range depending on rainfall and water holes',
        elevationRange: 'Sea level to 4,000 m (Mount Kilimanjaro slopes)',
        gpsReference: '2°20\'00" S, 34°50\'00" E (Serengeti National Park, Tanzania)',
        coordinates: { lat: -2.33, lng: 34.83 },
        climate: 'Tropical savannah with alternating wet and dry seasons'
      },
      keyThreats: [
        'Illegal ivory trade and commercial armed poaching',
        'Fencing and conversion of ancient migration corridors into farmland',
        'Severe climate change droughts causing mass dehydration of herds'
      ],
      conservationReservesCount: 320,
      conservationInitiatives: 'CITES ivory trade bans, Elephant Protection Corridors, Anti-Poaching Ranger Units'
    }
  },
  {
    id: 'gorilla',
    commonName: 'Mountain Gorilla',
    scientificName: 'Gorilla beringei beringei',
    class: 'Mammalia',
    order: 'Primates',
    family: 'Hominidae',
    livingObjectType: 'Great Ape Primate (Hominid Warm-Blooded Living Being)',
    heroImage: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1000&q=80'
    ],
    modelPredictionAccuracy: 0.991, // 99.1%
    sampleMotionVelocity: '1.2 m/s (Knuckle-Walking Forage)',
    sampleThermalSignature: '37.0°C (Core Primate Temp)',
    diet: 'Vegetarian Herbivore: Celery, bamboo shoots, wild thistles, stinging nettles, bark',
    weightRange: '135 – 220 kg (Silverback Males), 70 – 100 kg (Females)',
    funFact: 'Mountain gorillas share approximately 98.3% of their DNA sequence with modern human beings.',
    realDataset: {
      populationCount: '~1,063 individuals living exclusively in the wild',
      populationNumber: 1063,
      populationCensusSource: 'Greater Virunga Transboundary Collaboration (GVTC) / IUCN Red List',
      populationTrend: 'Increasing',
      iucnStatus: 'Endangered',
      iucnCode: 'EN',
      survivalRate: {
        cubFirstYear: '74% infant gorilla survival rate under silverback protection',
        adultAnnual: '92% – 95% annual adult survival',
        wildLifespan: '35 – 45 years in the wild',
        captiveLifespan: 'Mountain gorillas cannot survive in captivity; zero exist in zoos',
        primaryMortalityCauses: [
          'Respiratory pathogens and viral outbreaks transmitted from humans (42%)',
          'Snares set by poachers for antelope and bush pigs (26%)',
          'Inter-group conflicts during silverback takeovers (18%)',
          'Old age and arthritis (14%)'
        ]
      },
      habitat: {
        primaryBiomes: [
          'High altitude cloud and montane mist forests',
          'Subalpine bamboo zones and giant lobelia groves',
          'Volcanic slopes of the Albertine Rift'
        ],
        geographicRange: 'Confined to two isolated populations: Virunga Volcanoes (DRC, Rwanda, Uganda) and Bwindi Impenetrable National Park (Uganda)',
        territoryRequirement: '4 – 15 km² home range per habituated family troop',
        elevationRange: '2,200 m to 4,300 m above sea level',
        gpsReference: '1°03\'00" S, 29°39\'00" E (Bwindi Impenetrable National Park)',
        coordinates: { lat: -1.05, lng: 29.65 },
        climate: 'Cool montane tropical rainforest with persistent mist, cloud cover, and frequent rain'
      },
      keyThreats: [
        'Zoonotic viral disease transmission (human measles, COVID-19, flu)',
        'Extremely dense surrounding agricultural communities with high land pressure',
        'Civil unrest and armed conflicts within Virunga National Park sector'
      ],
      conservationReservesCount: 3,
      conservationInitiatives: 'Gorilla Doctors veterinary field interventions, Eco-tourism funding community protection'
    }
  },
  {
    id: 'wolf',
    commonName: 'Grey Wolf',
    scientificName: 'Canis lupus',
    class: 'Mammalia',
    order: 'Carnivora',
    family: 'Canidae',
    livingObjectType: 'Pack Carnivorous Mammal (Social Endotherm)',
    heroImage: 'https://images.unsplash.com/photo-1564865878688-9a244444042a?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1564865878688-9a244444042a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1000&q=80'
    ],
    modelPredictionAccuracy: 0.989,
    sampleMotionVelocity: '6.5 m/s (Pack Trotting)',
    sampleThermalSignature: '38.8°C (Canine Core Temp)',
    diet: 'Elk, Bison, Deer, Moose, Beavers, Mountain Hares',
    weightRange: '30 – 65 kg',
    funFact: 'A wolf pack howl can be heard across an astonishing 16 km (10 miles) of open wilderness.',
    realDataset: {
      populationCount: '~300,000 individuals worldwide (~108 in Yellowstone)',
      populationNumber: 300000,
      populationCensusSource: 'IUCN Red List of Threatened Species & Yellowstone Wolf Project Annual Report',
      populationTrend: 'Stable',
      iucnStatus: 'Least Concern',
      iucnCode: 'LC',
      survivalRate: {
        cubFirstYear: '50% – 60% pup survival rate through harsh winter',
        adultAnnual: '75% – 82% annual survival rate',
        wildLifespan: '6 – 8 years in wild ecosystems',
        captiveLifespan: '14 – 16 years in certified wildlife sanctuaries',
        primaryMortalityCauses: [
          'Territorial fighting between rival wolf packs (45%)',
          'Human legal hunting and vehicular strikes (35%)',
          'Canine distemper virus and parvovirus outbreaks (12%)',
          'Injuries from kicking hooves of elk and bison prey (8%)'
        ]
      },
      habitat: {
        primaryBiomes: [
          'Boreal taiga and temperate coniferous forests',
          'Arctic tundra and subarctic plains',
          'Montane grasslands and arid chaparral'
        ],
        geographicRange: 'North America (Canada, Alaska, Northern Rockies), Eurasia, Eastern Europe, and Northern Asia',
        territoryRequirement: '130 – 2,600 km² territory defended vigorously by the pack',
        elevationRange: 'Sea level to 3,500 m in mountain wilderness',
        gpsReference: '44°35\'00" N, 110°30\'00" W (Yellowstone National Park)',
        coordinates: { lat: 44.58, lng: -110.50 },
        climate: 'Continental cold subarctic to temperate montane climates'
      },
      keyThreats: [
        'Rancher predator-control hunting outside national park borders',
        'Viral infectious diseases contracted from domestic dogs',
        'Highway collisions along expanding freight corridors'
      ],
      conservationReservesCount: 450,
      conservationInitiatives: 'Yellowstone Trophic Cascade Reintroduction, North American Wolf Recovery Plan'
    }
  },
  {
    id: 'panda',
    commonName: 'Giant Panda',
    scientificName: 'Ailuropoda melanoleuca',
    class: 'Mammalia',
    order: 'Carnivora',
    family: 'Ursidae',
    livingObjectType: 'Specialized Folivorous Bear (Warm-Blooded Living Being)',
    heroImage: 'https://images.unsplash.com/photo-1527118732049-c88155f2107c?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1527118732049-c88155f2107c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=1000&q=80'
    ],
    modelPredictionAccuracy: 0.995,
    sampleMotionVelocity: '1.1 m/s (Sedentary Forage)',
    sampleThermalSignature: '37.8°C (Ursid Core Temp)',
    diet: '99% Bamboo (arrow bamboo, umbrella bamboo); consumes 12-38 kg daily',
    weightRange: '70 – 125 kg',
    funFact: 'Pandas have a unique modified wrist bone called a "pseudo-thumb" that enables them to grasp bamboo stalks with precision.',
    realDataset: {
      populationCount: '~1,864 wild individuals (~600 in conservation centers)',
      populationNumber: 1864,
      populationCensusSource: 'National Fourth Giant Panda Survey (NFGA China) / IUCN Red List',
      populationTrend: 'Increasing',
      iucnStatus: 'Vulnerable',
      iucnCode: 'VU',
      survivalRate: {
        cubFirstYear: '60% – 70% cub survival (mothers typically only raise one of two twins)',
        adultAnnual: '92% – 95% annual survival rate in protected bamboo reserves',
        wildLifespan: '15 – 20 years in wild montane bamboo forests',
        captiveLifespan: '25 – 35 years in breeding institutions',
        primaryMortalityCauses: [
          'Cyclic bamboo mass flowering and die-offs causing localized starvation (38%)',
          'Accidental crushing or abandonment of tiny newborn cubs (25%)',
          'Leopard or Asian golden cat predation on juveniles (20%)',
          'Digestive tract infections from fibrous bamboo splinters (17%)'
        ]
      },
      habitat: {
        primaryBiomes: [
          'Temperate broadleaf and mixed montane bamboo forests',
          'Damp foggy ravines with dense understory bamboo canopies'
        ],
        geographicRange: 'Southwestern China (Sichuan, Shaanxi, and Gansu provinces along the Minshan and Qinling mountains)',
        territoryRequirement: '4 – 11 km² per solitary panda',
        elevationRange: '1,200 m to 3,400 m above sea level',
        gpsReference: '31°02\'00" N, 103°05\'00" E (Wolong National Nature Reserve)',
        coordinates: { lat: 31.03, lng: 103.08 },
        climate: 'Cool, humid montane climate with heavy annual rainfall and perpetual cloud cover'
      },
      keyThreats: [
        'Periodic bamboo synchronous die-offs restricting food migration',
        'Road and railway fragmentation dividing wild population into 33 isolated sub-groups',
        'Climate warming shifting suitable bamboo growth elevations higher up mountains'
      ],
      conservationReservesCount: 67,
      conservationInitiatives: 'Giant Panda National Park (27,000 km² unified corridor), Downlisted from Endangered to Vulnerable'
    }
  }
];

export const TRAIL_CAMERA_STATIONS: TrailCameraStation[] = [
  {
    id: 'station-tiger',
    name: 'Sector 04 - Ranthambore Waterhole Trap',
    location: 'Ranthambore National Park, Rajasthan, India',
    coordinates: '25°59\'20" N, 76°30\'15" E',
    biome: 'Dry Deciduous Forest & Wetland Lake',
    sensorType: 'Dual PIR Optical Sensor & Thermal Heat Array',
    previewImage: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80',
    targetAnimal: SPECIES_DATABASE[0], // Bengal Tiger
    motionSensitivityDefault: 72,
    ambientTemp: '31.4°C'
  },
  {
    id: 'station-snow-leopard',
    name: 'Station 11 - Hemis High Pass Cliff Sensor',
    location: 'Hemis National Park, Ladakh, India',
    coordinates: '34°09\'12" N, 77°34\'30" E',
    biome: 'Alpine Scree & Glacial Ridge (4,200m)',
    sensorType: 'Sub-Zero Cryo-PIR & Laser Tripwire Sensor',
    previewImage: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    targetAnimal: SPECIES_DATABASE[1], // Snow Leopard
    motionSensitivityDefault: 85,
    ambientTemp: '-12.2°C'
  },
  {
    id: 'station-elephant',
    name: 'Station 08 - Serengeti River Corridor',
    location: 'Serengeti National Park, Tanzania',
    coordinates: '2°20\'00" S, 34°50\'00" E',
    biome: 'Acacia Savanna & Riparian Floodplain',
    sensorType: 'Acoustic Infrasound & Long-Range Radar PIR',
    previewImage: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80',
    targetAnimal: SPECIES_DATABASE[2], // African Elephant
    motionSensitivityDefault: 65,
    ambientTemp: '28.6°C'
  },
  {
    id: 'station-gorilla',
    name: 'Station 19 - Bwindi Mist Valley Trap',
    location: 'Bwindi Impenetrable Forest, Uganda',
    coordinates: '1°03\'00" S, 29°39\'00" E',
    biome: 'Montane Cloud Rainforest (2,400m)',
    sensorType: 'Moisture-Sealed Bio-Thermal Motion Camera',
    previewImage: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=800&q=80',
    targetAnimal: SPECIES_DATABASE[3], // Mountain Gorilla
    motionSensitivityDefault: 78,
    ambientTemp: '18.1°C'
  },
  {
    id: 'station-wolf',
    name: 'Station 03 - Lamar Valley Ridge Cam',
    location: 'Yellowstone National Park, Wyoming, USA',
    coordinates: '44°35\'00" N, 110°30\'00" W',
    biome: 'Subalpine Valley & Coniferous Woodland',
    sensorType: 'Night-Vision Infrared Motion Cam Trap',
    previewImage: 'https://images.unsplash.com/photo-1564865878688-9a244444042a?auto=format&fit=crop&w=800&q=80',
    targetAnimal: SPECIES_DATABASE[4], // Grey Wolf
    motionSensitivityDefault: 80,
    ambientTemp: '4.5°C'
  },
  {
    id: 'station-panda',
    name: 'Station 14 - Wolong Bamboo Ravine',
    location: 'Wolong Nature Reserve, Sichuan, China',
    coordinates: '31°02\'00" N, 103°05\'00" E',
    biome: 'Temperate Montane Bamboo Forest',
    sensorType: 'Optical Flow & Seismic Tremor Motion Detector',
    previewImage: 'https://images.unsplash.com/photo-1527118732049-c88155f2107c?auto=format&fit=crop&w=800&q=80',
    targetAnimal: SPECIES_DATABASE[5], // Giant Panda
    motionSensitivityDefault: 70,
    ambientTemp: '14.0°C'
  }
];
