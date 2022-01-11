/* eslint-disable */

const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');

    easyDeploy = async () => { 
        //const rholang = s.readFileSync(rholang_f, 'utf8');

        // const rholang = `new x, y(\`rho:io:stdout\`), z in { x!(["hello world"]) | y!(["hello world"]) }
        // `
        

        const rholang = `new
        testData
        ,invoker
        ,stdout(\`rho:io:stdout\`)
        ,deployerId(\`rho:rchain:deployerId\`)
        ,mapCh
     in {
        for(@{"read": *read, ..._} <<- @[*deployerId, "MasterContractAdmin"])
        {  stdout!(["read", *read])
        |  deployerId!(["read", *read])
        |  read!(*mapCh)
        |  for (map <- mapCh)
           {  stdout!(*map.keys().toList())
           | invoker!(*map.keys().toList())
           |  deployerId!(["read", *read])
           |  stdout!(*map)
           |  deployerId!(*map)
           }
        }
     }`
     const privateKey = '28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36';
        let dataAtNameResponse;
        console.log(rholang);
        try {
          dataAtNameResponse = await rchainToolkit.http.easyDeploy(
            'http://localhost:40403',
            rholang,
            privateKey,
            1,
            1000000000,
            400000
          );
        } catch (err) {
          console.log(err);
          throw new Error('deployBox 01');
        }

        
        const data = rchainToolkit.utils.rhoValToJs(
          JSON.parse(dataAtNameResponse).exprs[0].expr
        );

        console.log(data);
      
        // if (data.status !== 'completed') {
        //   console.log(data);
        //   throw new Error('deployBox 02');
        // }
      
        //console.log(data);
        return data;
    }

    easyDeploy();
