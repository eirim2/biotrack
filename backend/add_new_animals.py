#!/usr/bin/env python3
"""Add 10 new animals to fill category/conservation-status gaps."""
import json, sys, os

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

NEW_ANIMALS = {
    "21": {
        "id": 21, "commonName": "Kakapo", "scientificName": "Strigops habroptilus",
        "category": "Bird", "conservationStatus": "Critically Endangered",
        "habitat": "Temperate Forest, Shrubland", "region": "New Zealand",
        "diet": "Herbivore", "lifespan": "40-80 years", "weight": "2-4 kg",
        "height": "58-64 cm", "population": "~250",
        "description": "The kakapo is the world's only flightless parrot and one of the rarest birds on Earth. Nocturnal and solitary, it relies on camouflage rather than flight to avoid predators. Males perform a unique booming call from hilltop bowl-shaped depressions to attract females, audible up to 5 km away.",
        "funFacts": [
            "The kakapo is the heaviest parrot in the world, weighing up to 4 kg",
            "It is the only parrot that is both flightless and nocturnal",
            "Males inflate a thoracic air sac to produce a deep booming call during mating season",
            "Every known kakapo has been given an individual name by conservationists"
        ], "imageKey": ""
    },
    "22": {
        "id": 22, "commonName": "Hawksbill Sea Turtle", "scientificName": "Eretmochelys imbricata",
        "category": "Reptile", "conservationStatus": "Critically Endangered",
        "habitat": "Coral Reef, Coastal Waters", "region": "Tropical Oceans Worldwide",
        "diet": "Omnivore", "lifespan": "30-50 years", "weight": "45-75 kg",
        "height": "60-90 cm shell length", "population": "~20,000 nesting females",
        "description": "The hawksbill sea turtle is a critically endangered marine reptile recognized by its pointed beak and beautifully patterned shell. It plays a vital ecological role in maintaining coral reef health by feeding on sponges that would otherwise outcompete reef-building corals.",
        "funFacts": [
            "Hawksbill shells were historically traded as 'tortoiseshell' for jewelry and decoration",
            "They help maintain coral reef health by eating sponges that compete with corals",
            "Hawksbills can navigate thousands of miles back to the beach where they were born to lay eggs",
            "Their pointed beak allows them to reach into reef crevices to find food"
        ], "imageKey": ""
    },
    "23": {
        "id": 23, "commonName": "Clownfish", "scientificName": "Amphiprion ocellaris",
        "category": "Fish", "conservationStatus": "Least Concern",
        "habitat": "Coral Reef, Tropical Ocean", "region": "Indo-Pacific",
        "diet": "Omnivore", "lifespan": "6-10 years", "weight": "Up to 250 grams",
        "height": "7-11 cm in length", "population": "Abundant",
        "description": "Clownfish are small, brightly colored reef fish famous for their symbiotic relationship with sea anemones. Protected by a mucus coating that prevents anemone stings, clownfish live among the tentacles for shelter while providing the anemone with nutrients and defense against parasites.",
        "funFacts": [
            "All clownfish are born male and the dominant fish in a group becomes female",
            "Their mucus coating makes them immune to their host anemone's sting",
            "Clownfish rarely stray more than a few meters from their host anemone",
            "They communicate using popping and clicking sounds"
        ], "imageKey": ""
    },
    "24": {
        "id": 24, "commonName": "Whale Shark", "scientificName": "Rhincodon typus",
        "category": "Fish", "conservationStatus": "Endangered",
        "habitat": "Open Ocean, Tropical Waters", "region": "Tropical and Warm Temperate Oceans",
        "diet": "Filter Feeder", "lifespan": "70-100 years", "weight": "Up to 20,000 kg",
        "height": "Up to 12 m in length", "population": "Unknown, declining",
        "description": "The whale shark is the largest fish in the world and one of the gentlest giants of the ocean. Despite its enormous size, it feeds almost exclusively on plankton and small fish by filter feeding. Each whale shark has a unique pattern of spots, much like a human fingerprint.",
        "funFacts": [
            "Whale sharks are the largest fish in the world, growing up to 12 meters long",
            "Despite their size, they feed on some of the smallest organisms in the ocean",
            "Each whale shark has a unique spot pattern used for individual identification",
            "Their mouths can be up to 1.5 meters wide but their throat is only about the size of a quarter"
        ], "imageKey": ""
    },
    "25": {
        "id": 25, "commonName": "Monarch Butterfly", "scientificName": "Danaus plexippus",
        "category": "Invertebrate", "conservationStatus": "Endangered",
        "habitat": "Grassland, Forest Edge, Garden", "region": "North America",
        "diet": "Herbivore", "lifespan": "2-6 weeks (summer); up to 8 months (migratory)",
        "weight": "0.5 grams", "height": "8.9-10.2 cm wingspan",
        "population": "Declining significantly",
        "description": "The monarch butterfly is famous for its incredible multi-generational migration spanning thousands of kilometers between Canada and central Mexico. Their striking orange and black wings serve as a warning to predators — monarchs are toxic due to milkweed consumed during the caterpillar stage.",
        "funFacts": [
            "Monarchs migrate up to 4,800 km from Canada to Mexico each year",
            "The migratory generation lives up to 8 months, while summer generations live only weeks",
            "Their bright orange coloring warns predators that they are toxic",
            "Monarchs use the Earth's magnetic field and the position of the sun to navigate"
        ], "imageKey": ""
    },
    "26": {
        "id": 26, "commonName": "Red-eyed Tree Frog", "scientificName": "Agalychnis callidryas",
        "category": "Amphibian", "conservationStatus": "Least Concern",
        "habitat": "Tropical Rainforest", "region": "Central America, Southern Mexico",
        "diet": "Carnivore", "lifespan": "5 years", "weight": "6-15 grams",
        "height": "5-7.6 cm in length", "population": "Stable",
        "description": "The red-eyed tree frog is one of the most iconic rainforest animals, instantly recognizable by its vivid red eyes, bright green body, and blue-and-yellow striped sides. Its dramatic coloring is thought to startle predators, a defense mechanism known as startle coloration.",
        "funFacts": [
            "Their bright red eyes may startle predators, giving them a split second to escape",
            "Red-eyed tree frogs are not poisonous despite their vivid coloring",
            "Their eggs can hatch early if they detect vibrations from a predator like a snake",
            "They spend most of their lives in the tree canopy, coming down only to breed"
        ], "imageKey": ""
    },
    "27": {
        "id": 27, "commonName": "Galápagos Tortoise", "scientificName": "Chelonoidis nigra",
        "category": "Reptile", "conservationStatus": "Vulnerable",
        "habitat": "Grassland, Shrubland, Volcanic Island", "region": "Galápagos Islands, Ecuador",
        "diet": "Herbivore", "lifespan": "100-175 years", "weight": "Up to 417 kg",
        "height": "Up to 1.5 m in length", "population": "~20,000-25,000",
        "description": "The Galápagos tortoise is the largest living tortoise species and one of the longest-lived vertebrates on Earth. These gentle giants played a key role in Charles Darwin's theory of evolution, as different island populations developed distinct shell shapes adapted to their specific environments.",
        "funFacts": [
            "Galápagos tortoises can live well over 100 years, with some exceeding 175",
            "They helped inspire Darwin's theory of evolution by natural selection",
            "They can survive up to a year without food or water",
            "Different islands produced tortoises with differently shaped shells"
        ], "imageKey": ""
    },
    "28": {
        "id": 28, "commonName": "Pangolin", "scientificName": "Manis javanica",
        "category": "Mammal", "conservationStatus": "Critically Endangered",
        "habitat": "Tropical Forest, Savanna", "region": "Southeast Asia",
        "diet": "Insectivore", "lifespan": "20 years", "weight": "2-10 kg",
        "height": "30-100 cm body length", "population": "Unknown, rapidly declining",
        "description": "The pangolin is the world's most trafficked mammal, covered in tough keratin scales that form a natural suit of armor. When threatened, it curls into a tight ball that most predators cannot penetrate. Pangolins are solitary, nocturnal insectivores that use their extraordinarily long sticky tongues to harvest ants and termites.",
        "funFacts": [
            "Pangolins are the only mammals covered in scales made of keratin",
            "They are the most trafficked mammals in the world due to illegal wildlife trade",
            "A pangolin's tongue can be longer than its entire body",
            "When curled into a ball, even lions cannot bite through their scales"
        ], "imageKey": ""
    },
    "29": {
        "id": 29, "commonName": "Great White Shark", "scientificName": "Carcharodon carcharias",
        "category": "Fish", "conservationStatus": "Vulnerable",
        "habitat": "Coastal and Open Ocean", "region": "Worldwide Temperate and Subtropical Oceans",
        "diet": "Carnivore", "lifespan": "30-70 years", "weight": "680-1,100 kg",
        "height": "4-6 m in length", "population": "~3,500",
        "description": "The great white shark is one of the ocean's apex predators, equipped with rows of serrated teeth and electroreceptive organs that detect the faint electrical fields produced by prey. Despite their fearsome reputation, great whites are more threatened by humans than humans are by them.",
        "funFacts": [
            "Great whites can detect one drop of blood in 100 liters of water",
            "They can breach completely out of the water when hunting seals",
            "Their teeth are arranged in rows and are constantly replaced throughout their lives",
            "Great whites are warm-blooded, unlike most other sharks"
        ], "imageKey": ""
    },
    "30": {
        "id": 30, "commonName": "Horseshoe Crab", "scientificName": "Limulus polyphemus",
        "category": "Invertebrate", "conservationStatus": "Vulnerable",
        "habitat": "Coastal Waters, Sandy Beach", "region": "Atlantic Coast of North America",
        "diet": "Omnivore", "lifespan": "20-40 years", "weight": "1.8-4.5 kg",
        "height": "Up to 60 cm in length", "population": "Declining",
        "description": "The horseshoe crab is a living fossil that has survived virtually unchanged for over 450 million years, predating the dinosaurs. Despite its name and appearance, it is more closely related to spiders and scorpions than to crabs. Its blue, copper-based blood is invaluable to modern medicine for detecting bacterial contamination.",
        "funFacts": [
            "Horseshoe crabs have existed for over 450 million years, predating dinosaurs",
            "Their blue blood is used in medicine to test for bacterial contamination",
            "They have 10 eyes distributed around their body",
            "They are more closely related to spiders than to crabs"
        ], "imageKey": ""
    },
}

NEW_QUESTIONS = {
    "21": [
        {"question": "What makes the kakapo unique among parrots?", "options": ["It can mimic human speech perfectly", "It is the only flightless parrot", "It is the smallest parrot", "It lives in water"], "answer": 1},
        {"question": "What is the conservation status of the kakapo?", "options": ["Least Concern", "Vulnerable", "Endangered", "Critically Endangered"], "answer": 3},
        {"question": "How do male kakapos attract females?", "options": ["Colorful plumage displays", "A deep booming call from hilltop depressions", "Building elaborate nests", "Offering food gifts"], "answer": 1},
        {"question": "Where are kakapos found?", "options": ["Australia", "New Zealand", "Madagascar", "Papua New Guinea"], "answer": 1},
        {"question": "When are kakapos active?", "options": ["During the day", "At dawn", "At night (nocturnal)", "Only during storms"], "answer": 2},
        {"question": "What is special about how conservationists track kakapos?", "options": ["GPS collars only", "Every individual has been given a name", "Drones follow each one", "They are kept in zoos only"], "answer": 1},
    ],
    "22": [
        {"question": "What is the hawksbill sea turtle best known for?", "options": ["Its speed", "Its pointed beak and patterned shell", "Its large size", "Its ability to live on land"], "answer": 1},
        {"question": "What is the conservation status of the hawksbill sea turtle?", "options": ["Least Concern", "Vulnerable", "Endangered", "Critically Endangered"], "answer": 3},
        {"question": "How do hawksbill turtles help coral reefs?", "options": ["By cleaning fish", "By eating sponges that compete with corals", "By producing calcium", "By attracting other marine life"], "answer": 1},
        {"question": "What was historically made from hawksbill shells?", "options": ["Medicine", "Tortoiseshell jewelry and decoration", "Armor", "Musical instruments"], "answer": 1},
        {"question": "Where do hawksbill sea turtles lay their eggs?", "options": ["On any sandy beach", "The same beach where they were born", "Underwater nests", "Rocky coastlines only"], "answer": 1},
        {"question": "What type of diet does the hawksbill sea turtle have?", "options": ["Herbivore", "Carnivore", "Omnivore", "Filter Feeder"], "answer": 2},
    ],
    "23": [
        {"question": "What is the clownfish best known for?", "options": ["Its speed", "Living in symbiosis with sea anemones", "Its large size", "Migrating long distances"], "answer": 1},
        {"question": "How are clownfish protected from anemone stings?", "options": ["Thick scales", "A special mucus coating", "They avoid the tentacles", "They are immune to all toxins"], "answer": 1},
        {"question": "What is unique about clownfish gender?", "options": ["They are always female", "All are born male; the dominant one becomes female", "Males and females look identical", "They change gender every year"], "answer": 1},
        {"question": "What is the conservation status of the clownfish?", "options": ["Least Concern", "Vulnerable", "Endangered", "Critically Endangered"], "answer": 0},
        {"question": "How do clownfish communicate?", "options": ["By changing color", "Popping and clicking sounds", "Releasing chemicals", "Tail slapping"], "answer": 1},
        {"question": "How far do clownfish typically travel from their host anemone?", "options": ["Up to 1 km", "Up to 100 m", "Only a few meters", "They never leave"], "answer": 2},
    ],
    "24": [
        {"question": "What is the whale shark's distinction among fish?", "options": ["Fastest fish", "Most venomous fish", "Largest fish in the world", "Deepest diving fish"], "answer": 2},
        {"question": "What does the whale shark primarily eat?", "options": ["Large fish", "Plankton and small fish via filter feeding", "Seaweed", "Other sharks"], "answer": 1},
        {"question": "What is the conservation status of the whale shark?", "options": ["Least Concern", "Vulnerable", "Endangered", "Critically Endangered"], "answer": 2},
        {"question": "How are individual whale sharks identified?", "options": ["By size", "By unique spot patterns", "By fin shape only", "They cannot be identified individually"], "answer": 1},
        {"question": "How wide can a whale shark's mouth be?", "options": ["30 cm", "75 cm", "Up to 1.5 meters", "Up to 3 meters"], "answer": 2},
        {"question": "How long can whale sharks live?", "options": ["10-20 years", "30-50 years", "70-100 years", "Over 200 years"], "answer": 2},
    ],
    "25": [
        {"question": "What is the monarch butterfly famous for?", "options": ["Being the largest butterfly", "Its multi-generational migration", "Producing silk", "Living underground"], "answer": 1},
        {"question": "What is the conservation status of the monarch butterfly?", "options": ["Least Concern", "Vulnerable", "Endangered", "Critically Endangered"], "answer": 2},
        {"question": "How far can monarchs migrate?", "options": ["100 km", "500 km", "Up to 4,800 km", "Up to 20,000 km"], "answer": 2},
        {"question": "Why are monarch butterflies toxic to predators?", "options": ["They produce their own venom", "They absorb toxins from milkweed as caterpillars", "They carry bacteria", "Their wings are razor-sharp"], "answer": 1},
        {"question": "How do monarchs navigate during migration?", "options": ["By following rivers", "Using Earth's magnetic field and the sun's position", "By smell alone", "They follow other butterflies only"], "answer": 1},
        {"question": "How long does the migratory generation of monarchs live?", "options": ["2 weeks", "1 month", "Up to 8 months", "2 years"], "answer": 2},
    ],
    "26": [
        {"question": "What are red-eyed tree frogs known for?", "options": ["Being highly toxic", "Their vivid red eyes and green body", "Living in water their whole lives", "Being the largest frog"], "answer": 1},
        {"question": "Are red-eyed tree frogs poisonous?", "options": ["Yes, extremely", "Yes, mildly", "No, they are not poisonous", "Only the males are"], "answer": 2},
        {"question": "What is the conservation status of the red-eyed tree frog?", "options": ["Least Concern", "Vulnerable", "Endangered", "Critically Endangered"], "answer": 0},
        {"question": "What defense mechanism do their bright eyes provide?", "options": ["They shoot venom", "They startle predators (startle coloration)", "They hypnotize prey", "They glow to attract mates"], "answer": 1},
        {"question": "Where do red-eyed tree frogs spend most of their time?", "options": ["Underground", "In water", "In the tree canopy", "On the forest floor"], "answer": 2},
        {"question": "What can red-eyed tree frog eggs do if they detect a predator?", "options": ["Release toxins", "Hatch early", "Change color", "Roll away"], "answer": 1},
    ],
    "27": [
        {"question": "What is the Galápagos tortoise known for?", "options": ["Being the fastest reptile", "Being the largest living tortoise", "Having a venomous bite", "Swimming long distances"], "answer": 1},
        {"question": "How long can Galápagos tortoises live?", "options": ["30-50 years", "60-80 years", "100-175 years", "Over 300 years"], "answer": 2},
        {"question": "What is the conservation status of the Galápagos tortoise?", "options": ["Least Concern", "Vulnerable", "Endangered", "Critically Endangered"], "answer": 1},
        {"question": "Who was inspired by Galápagos tortoises to develop a famous theory?", "options": ["Isaac Newton", "Albert Einstein", "Charles Darwin", "Gregor Mendel"], "answer": 2},
        {"question": "How long can Galápagos tortoises survive without food or water?", "options": ["1 week", "1 month", "6 months", "Up to 1 year"], "answer": 3},
        {"question": "What differs between tortoises on different Galápagos islands?", "options": ["Their color", "Their shell shapes", "Their diet only", "Nothing — they are all identical"], "answer": 1},
    ],
    "28": [
        {"question": "What is the pangolin known as?", "options": ["The armored bear", "The world's most trafficked mammal", "The forest dragon", "The desert runner"], "answer": 1},
        {"question": "What is the conservation status of the pangolin?", "options": ["Least Concern", "Vulnerable", "Endangered", "Critically Endangered"], "answer": 3},
        {"question": "What are pangolin scales made of?", "options": ["Bone", "Metal", "Keratin", "Calcium"], "answer": 2},
        {"question": "What does a pangolin do when threatened?", "options": ["Runs away quickly", "Sprays a toxic liquid", "Curls into a tight ball", "Plays dead"], "answer": 2},
        {"question": "How does a pangolin catch insects?", "options": ["With its paws", "With a long sticky tongue", "By digging traps", "By waiting with its mouth open"], "answer": 1},
        {"question": "How long can a pangolin's tongue be?", "options": ["A few centimeters", "Half its body length", "Longer than its entire body", "Exactly its body length"], "answer": 2},
    ],
    "29": [
        {"question": "What type of animal is the great white shark?", "options": ["Mammal", "Reptile", "Cartilaginous fish", "Bony fish"], "answer": 2},
        {"question": "What is the conservation status of the great white shark?", "options": ["Least Concern", "Vulnerable", "Endangered", "Critically Endangered"], "answer": 1},
        {"question": "How do great white sharks detect prey?", "options": ["Only by sight", "Only by smell", "Through electroreceptors that detect electrical fields", "By echolocation"], "answer": 2},
        {"question": "What is unusual about great white sharks compared to most sharks?", "options": ["They live in freshwater", "They are warm-blooded", "They don't have teeth", "They lay eggs on land"], "answer": 1},
        {"question": "How do great white shark teeth work?", "options": ["They have one set for life", "Rows constantly replace lost teeth", "They grow new teeth once a year", "They borrow teeth from other sharks"], "answer": 1},
        {"question": "How sensitive is a great white's sense of smell?", "options": ["About the same as humans", "Can detect blood in 10 liters of water", "Can detect one drop of blood in 100 liters", "They have no sense of smell"], "answer": 2},
    ],
    "30": [
        {"question": "How old is the horseshoe crab lineage?", "options": ["50 million years", "150 million years", "Over 450 million years", "1 billion years"], "answer": 2},
        {"question": "What is the conservation status of the horseshoe crab?", "options": ["Least Concern", "Vulnerable", "Endangered", "Critically Endangered"], "answer": 1},
        {"question": "What color is horseshoe crab blood?", "options": ["Red", "Green", "Blue", "Clear"], "answer": 2},
        {"question": "What is horseshoe crab blood used for?", "options": ["Making dye", "Testing for bacterial contamination in medicine", "Fuel", "Cosmetics only"], "answer": 1},
        {"question": "What are horseshoe crabs more closely related to?", "options": ["True crabs", "Lobsters", "Spiders and scorpions", "Shrimp"], "answer": 2},
        {"question": "How many eyes does a horseshoe crab have?", "options": ["2", "4", "8", "10"], "answer": 3},
    ],
}

# Load existing files and merge
animals_path = os.path.join(DATA_DIR, "animals.json")
questions_path = os.path.join(DATA_DIR, "questions.json")

with open(animals_path, "r") as f:
    animals = json.load(f)
animals.update(NEW_ANIMALS)
with open(animals_path, "w") as f:
    json.dump(animals, f, indent=2)
print(f"animals.json now has {len(animals)} animals")

with open(questions_path, "r") as f:
    questions = json.load(f)
questions.update(NEW_QUESTIONS)
with open(questions_path, "w") as f:
    json.dump(questions, f, indent=2)
print(f"questions.json now has {len(questions)} question sets")
