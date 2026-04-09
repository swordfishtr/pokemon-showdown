export const Items: import('../../../sim/dex-items').ModdedItemDataTable = {
	alomowhat: {
		name: 'Alomowhat',
		num: -6000,
		spritenum: 0,
		megaStone: { 'Alomomola': 'Alomomola-Mega' },
		itemUser: ['Alomomola'],
		onTakeItem(item, source) {
			return !item.megaStone?.[source.baseSpecies.baseSpecies];
		},
		shortDesc: 'If held by an Alomomola, this item allows it to Mega Evolve in battle.',
		desc: 'If held by an Alomomola, this item allows it to Mega Evolve in battle.',
	},
};
