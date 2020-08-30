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

function narrate(text, ...args) {
    console.log("NARRATOR: ", text, ...args);
}

async function main() {
  const RevVault = await lookup(`rho:rchain:revVault`); // [_, RevVault]

  const Secretary = harden({
    async make() {
      const memRevCh = new Channel();
      memRevCh(RhoSet());
      const self = harden({
        toString: () => `<full Secretary rights>`,
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
        toString: () => `<membership access to directory>`,
        async register(memGovRevAddr, unsealer) {
          const memRevs = await memRevCh.peek();
          if (memRevs.contains(memGovRevAddr)) {
            const notarized = new Channel();
            const bytesToInt = bytes => bytes.reduce((acc, b) => acc * 0x100 + b)
            const amt = bytesToInt(deref(notarized).toByteArray().slice(0, 3));
            console.log(`TODO: const result = ${secVault}.transfer(${memGovRevAddr}, ${amt}, "@@AUTH KEY TODO")`);
            const challenge = new Channel();
            challenge.get().then(([response, cont]) => {
                console.log(`TODO: challenge response should combine amt ${amt}, unsealer ${unsealer}`);
                if (response === amt) {
                    console.log({"secretary challenge OK": amt});
                    const rights = harden({
                        toString: () => `<${memGovRevAddr}, ${unsealer} notarized*(TODO) by ${publicFacet}>`,
                        unseal: box => unsealer(box),
                        // method to divulge REV address?
                        vouch: "@@TODO: actual notary / inspector",
                    });
                    cont(rights);
                } else {
                    console.log({"challenge expected": amt, "actual": response});
                    return null;
                }
            });
            return challenge; // bundle+{}?
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
  narrate("The RChain secretary public facet is available at", secretaryURI);

  const myGovRevAddr = "111aliceGovRev";
  const memLabel = "Alice Gov";
  narrate(`Member Alice chose ${myGovRevAddr} as her governance REV address.`);

  narrate(`Since she registered it with the coop, the coop secretary registers it on chain using the closely held ${s1}.`)
  await s1.addMemberRevAddr(myGovRevAddr);

  const { sealer, unsealer } = await SealerUnsealer.make(memLabel);
  narrate(`Alice creates a { sealer: ${sealer}, unsealer: ${unsealer} } pair which work much like a private/public key pair, but using only rholang; no crypto.`);
  const secretary = await lookup(secretaryURI);
  narrate(`Alice deploys code to look up the coop secretary at ${secretaryURI} (result: ${secretary}) ...`);
  narrate(`... and register her gov REV address ${myGovRevAddr} and unsealer ${unsealer}`);
  narrate("Alice then stands by for some dust REV to be deposited at ${myGovRevAddr}.");
  const notarizedMembership = await secretary.register(myGovRevAddr, unsealer).then(async challenge => {
    console.log(`TODO: explain that challenge ${challenge} is held near deployId too...`);
    const amtDeposited = 66051;
    narrate(`Alice saw a transfer of ${amtDeposited} revettes (${amtDeposited / 10.0**8} REV)`);
    const cont = new Channel();
    challenge([amtDeposited, cont]);
    return cont.get();
  });
  const uri = await insertArbitrary(bundlePlus(notarizedMembership));
  narrate(`She published her membership rights ${notarizedMembership} at ${uri}, which might serve the role of a membership card.`);
  log(`TODO: the secretary should publish it and keep the URI paired with the REV Addr`);
  const aliceDeployerId = new Channel();
  narrate(`${aliceDeployerId} is Alice's deployerId; i.e. a channel only she can refer to.`);
  const mySealerLocker = new Channel(RhoList(deref(aliceDeployerId), "memershipGovernanceSealer"));
  narrate(`Likewise, only she has access to channels derived from it, such as ${mySealerLocker}`);
  mySealerLocker(sealer);
  narrate(`She stored her sealer (${sealer}) there.`);

  console.log(`TODO: Alice uses her sealer ${sealer} to vote.`)
}
