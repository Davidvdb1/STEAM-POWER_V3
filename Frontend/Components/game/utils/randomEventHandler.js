export const hagelstorm = {
    multipliers: {
        windmolen: 1,
        zonnepaneel: 0.8,
        waterrad: 1.2,
    },
    duur: 300_000,
    beschrijving: "Hagelstorm! Er is minder zon voor de zonnepanelen, maar de waterwielen draaien harder.",
    damage: {
        windmolen: false,
        zonnepaneel: true,
        waterrad: false,
        beschrijving: "Door de hagel zijn er een paar zonnepanelen beschadigd, repareer ze snel!",
    }
}

export const regenstorm = {
    multipliers: {
        windmolen: 1,
        zonnepaneel: 0.6,
        waterrad: 1.5,
    },
    duur: 300_000,
    beschrijving: "Regenstorm! De waterwielen draaien harder, maar dezonnepanelen leveren minder energie.",
    damage: {
        windmolen: false,
        zonnepaneel: false,
        waterrad: false,
        beschrijving: "De regen is gestopt, alles is weer normaal.",
    }
}

export const windvlaag = {
    multipliers: {
        windmolen: 1.5,
        zonnepaneel: 1,
        waterrad: 1,
    },
    duur: 300_000,
    beschrijving: "Windvlaag! De windmolens draaien harder.",
    damage: {
        windmolen: false,
        zonnepaneel: true,
        waterrad: false,
        beschrijving: "De wind is gaan liggen, Maar er is nu stof gekomen op de zonnepanelen, maak ze schoon!",
    }
}

export const zonneschijn = {
    multipliers: {
        windmolen: 1,
        zonnepaneel: 1.5,
        waterrad: 0.8,
    },
    duur: 300_000,
    beschrijving: "Geen wolkje in de lucht! De zonnepanelen leveren meer energie. Maar de waterwielen draaien minder door de droogte.",
    damage: {
        windmolen: false,
        zonnepaneel: false,
        waterrad: false,
        beschrijving: "De zon zet zich weer achter de wolken, alles is weer normaal.",
    }
}

export const stroomstoring = {
    multipliers: {
        windmolen: 0.8,
        zonnepaneel: 0.8,
        waterrad: 0.8,
    },
    duur: 300_000,
    beschrijving: "Stroomstoring! De energieproductie is tijdelijk verlaagd.",
    damage: {
        windmolen: false,
        zonnepaneel: false,
        waterrad: false,
        beschrijving: "De stroomstoring is opgelost, alles is weer normaal.",
    }
}

export const vervuiling = {
    multipliers: {
        windmolen: 1,
        zonnepaneel: 1,
        waterrad: 0.7,
    },
    duur: 300_000,
    beschrijving: "Vervuiling in de rivier! De waterwielen draaien minder goed.",
    damage: {
        windmolen: false,
        zonnepaneel: false,
        waterrad: false,
        beschrijving: "De vervuiling is opgeruimd, alles is weer normaal.",
    }
}
