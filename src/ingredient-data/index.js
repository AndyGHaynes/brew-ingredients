import { fawcett, briess, bsg } from './grains';
import { ych } from './hops';
import { wyeast, whiteLabs, imperial } from './yeast';

/* http://byo.com/mead/item/1544-understanding-malt-spec-sheets-advanced-brewing */
function DBFGtoGravity(dbfg) {
  if (dbfg === null) {
    return null;
  }

  const gravity = 1 + ((dbfg / 100) * 0.04621);
  return parseFloat(`${gravity}`.substring(0, 5));
}

function numberOrNull(num) {
  return (n => isNaN(n) ? null : n)(parseFloat(num));
}

const grains = fawcett
  .concat(briess)
  .concat(bsg)
  .map(grain => Object.assign(grain, {
    DBFG: numberOrNull(grain.DBFG),
    DBCG: numberOrNull(grain.DBCG),
    lintner: numberOrNull(grain.lintner),
    gravity: DBFGtoGravity(numberOrNull(grain.DBCG || grain.DBFG))
  }));

const yeast = Object.keys(wyeast).map(k => wyeast[k])
  .concat(Object.keys(whiteLabs).map(k => whiteLabs[k]))
  .concat(Object.keys(imperial).map(k => imperial[k]))
  .reduce((a, b) => a.concat(b), [])
  .reduce((arr, yeast) => (!arr.some(y => y.url === yeast.url && y.code === yeast.code) && arr.push(yeast) && arr) || arr, [])
  .map(yeast => Object.assign(
    yeast, {
      styles: yeast.styles ? yeast.styles.split(', ').filter((s, i, a) => a.indexOf(s) === i) : null,
      toleranceLow: (yeast.tolerance || yeast.toleranceLow) || null
    }
  ));

export default {
  grains,
  hops: ych,
  yeast
};
