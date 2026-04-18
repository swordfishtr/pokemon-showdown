export const Pokedex: import('../../../sim/dex-species').ModdedSpeciesDataTable = {
	alomomola: {
		inherit: true,
		otherFormes: ["Alomomola-Mega"],
		formeOrder: ["Alomomola", "Alomomola-Mega"],
	},
	alomomolamega: {
		num: 594,
		name: "Alomomola-Mega",
		baseSpecies: "Alomomola",
		forme: "Mega",
		types: ["Water", "Fairy"],
		baseStats: { hp: 235, atk: 195, def: 35, spa: 35, spd: 35, spe: 35 },
		abilities: { 0: "Johning?" },
		heightm: 1.9,
		weightkg: 49.5,
		color: "Pink",
		eggGroups: ["Water 1", "Water 2"],
		requiredItem: "Alomowhat",
		credits: ['Essence', 'chemistryfruit'],
	},
};
