// the secretary publishes (in the registry) a directory-related contract.
// the (allegeged) member calls the contract with 2 return addresses;
// the secretary does new unf1, uses toByteArray to turn it into bits and
// uses some of those bits to choose dust amount to send to the member.
// the member calls another secretary method giving the dust amount... and then
// the secretary sends unf1 to the 2nd return address.
import { insertArbitrary, lookup } from './lib/registry.js';
import { RevAddress } from './lib/rev.js';
import { RhoList, RhoSet, Channel, bundlePlus, deref } from './lib/js2rho.js';
import { harden } from './lib/js2rho.js'; // kludge

const { log } = console;

main().catch(err => console.error(err));

async function main() {
  const RevVault = await lookup(`rho:rchain:revVault`); // [_, RevVault]

  // fill in these constants _after_ the 1st run?
  // `rho:id:76zs1zq8fjxdso8esecgqdbhy3akh8nn4eqq8pggoocups4fe9espc`,
  // "11112aH4d1y2BkkzDhVSiE6iggkGaA9JNCMFVtvg2iqHXkbaCLLWzz") {
  const memGovId = harden({
    async register(memLabel, memGovRevAddr, secretaryURI, secretaryREVAddr) {
      const { sealer, unsealer } = await SealerUnsealer.make(memLabel);
      const secretary = await lookup(secretaryURI);
      log({"member": memLabel, "looked up secretary": secretary, "at": secretaryURI});
      log({"Attn registrant": memLabel, "stand by for REV from": memGovRevAddr, "to": secretaryREVAddr})
      const notarizedMembership = await secretary.register(memGovRevAddr, unsealer);
      const uri = await insertArbitrary(bundlePlus(notarizedMembership));
      log({"notarized membership": memLabel, "registered at": uri});
    }
  });

  const Secretary = harden({
    async make() {
      const memRevCh = new Channel();
      memRevCh(RhoSet());
      const self = harden({
        async addMemberRevAddr(addr) {
          const memRevs = await memRevCh.get();
          // console.log('add', { memRevs });
          // tell caller if addr already in set?
          memRevCh(memRevs.union(RhoSet(addr)));
          return null;
        },
      });
      const secRevAddr = await RevAddress.fromUnforgeable(self);
      const secVault = await RevVault.findOrCreate(secRevAddr);
      const publicFacet = harden({
        async register(memGovRevAddr, unsealer) {
          const memRevs = await memRevCh.peek();
          if (memRevs.contains(memGovRevAddr)) {
            const notarized = new Channel();
            const amt = deref(notarized).toByteArray().slice(0, 3); // todo: bytes to int?
          } else {
            throw new Error("no such REV address on file");
          }
        },
      });
      const uri = await insertArbitrary(bundlePlus(publicFacet));
      log({"secretary registered at": uri, "REVAddr": secRevAddr});
      return harden({ "self": self, "pub": publicFacet, "pubURI": uri, "revAddr": secRevAddr });
    },
  });

  const SealerUnsealer = harden({
    async make(label) {
      // TODO
      const sealer = new Channel();
      const unsealer = new Channel();
      log({"creating Sealer for": label});
      return({"brand": label, "sealer": sealer, "unsealer": unsealer });
    },
  });

  const { self: s1, pubURI: secretaryURI, revAddr: secretaryREVAddr, pub } = await Secretary.make();
  log({"secretary1": s1});

  // save the sealer where only Alice can find it.
  const AliceDeployerId = new Channel();
  const myGovRevAddr = "111aliceGovRev";
  await s1.addMemberRevAddr(myGovRevAddr);
  const mySealerLocker = new Channel(RhoList(deref(AliceDeployerId), "memershipGovernanceSealer"))
  mySealerLocker(await memGovId.register("Alice Gov", myGovRevAddr, secretaryURI, secretaryREVAddr));
}
