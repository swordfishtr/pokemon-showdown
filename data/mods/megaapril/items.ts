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
	},
};
