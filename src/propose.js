// @ts-check

/**
 @typedef { import('rchain-api/src/rnode').RNodeAdmin } RNodeAdmin
*/

/**
 *
 * @param {RNodeAdmin} adm
 */
let proposeCount = 0;
export async function propose(adm) {
   if (proposeCount != 0)
      return;
   proposeCount += 1;
   adm
      .propose()
      .then((x) => {
         console.log(x);
         proposeCount = 0;
      })
      .catch((err) => {
         console.log(proposeCount, err);
         if (proposeCount < 7) {
            setTimeout(propose, 10000);
         }
      });
}
