import fetch from "node-fetch";

console.log("🚀 Proyecto iniciado con Node.js 20 + TypeScript + ESM");

const res = await fetch("https://swapi.py4e.com/api/people/1");
const data = await res.json();
console.log(data);

export {};
