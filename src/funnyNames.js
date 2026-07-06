import { rand } from "firebase/firestore/pipelines";

export const funnyNames =  [
    "Anita Break",
    "Gladys Overwith",
    "Justin Case",
    "Paige Turner",
    "Robin Banks",
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
    "Neil Down",
    "Otto Mattic",
    "Phil M. Up",
    "Sue Shei"
];

export function getRandomFunnyName() {
    const randomIndex = Math.floor(Math.random () * funnyNames.length)
    return funnyNames[randomIndex]
}