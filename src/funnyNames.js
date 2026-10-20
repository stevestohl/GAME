export const funnyNames = [
    // Standard / Wholesome
    "Anita Break",
    "Gladys Overwith",
    "Justin Case",
    "Paige Turner",
    "Barry Cade",
    "Ella Vator",
    "Tim Burr",
    "Al B. Back",
    "Luke Warm",
    "Ben There",
    "Chris P. Bacon",
    "Artie Choke",
    "Barb Dwyer",
    "Carrie Oakey",
    "Anita Job",
    "Otto Mattic",
    "Sue Shei",

    // Food & Drink
    "Al Dente",
    "Brie Cheese",
    "Mac Aroni",
    "Olive Tree",
    "Tom Morrow",
    "Pea Soup",
    "Heinz Sight",
    "C. Senor",
    "Sherry Wine",

    // Actions & Phrasing
    "Anita Room",
    "Dan D. Lyon",
    "Earl E. Bird",
    "Gilda Wreck",
    "Helen Highwater",
    "Hy Price",
    "Ilene Left",
    "May B. Tomorrow",
    "Morey Bund",
    "Owen Money",
    "Ray O’Sunshyne",
    "Sharon Schmidt",
    "Theresa Green",
    "Walter Wall",
    "Warren Peace",
    "Will Power",
    "Xavier Breath",

    // Occupations & Hobbies
    "Ali Gator",
    "Anna Tomy",
    "Bill Ding",
    "Dusty Miller",
    "Ginger Vitis",
    "Harry Beard",
    "Marsha Mellow",
    "Penny Less",
    "Polly Graph",
    "Ray Gunn",
    "Rocky Shore",
    "Sandy Beaches",

    // Medical & Science
    "Barry D. Hatchett",
    "Candy Barr",
    "Frank Enstein",
    "Gene Poole",
    "Gerry Atric",
    "Holly Wood",
    "Jack Pott",
    "Lily Pad",
    "Luke Sky-Walker",
    "Marcus Absent",

    // Miscellaneous & Pop Culture
    "Buster Move",
    "Chuck Wagon",
    "Crystal Ball",
    "Don Key",
    "Ella Phant",
    "G. I. Joe"
];

export function getRandomFunnyName() {
    const randomIndex = Math.floor(Math.random () * funnyNames.length)
    return funnyNames[randomIndex]
}