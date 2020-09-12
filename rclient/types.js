/**
 * @typedef {{
 *    term: string,
 *    timestamp: number, // milliseconds
 *    phloPrice: number,
 *    phloLimit: number,
 *    validAfterBlockNumber: number,
 * }} DeployData
 *
 * @typedef {{
 *   data: DeployData,
 *   sigAlgorithm: 'secp256k1',
 *   signature: string, // hex
 *   deployer: string, // hex
 * }} DeployRequest

@typedef {{
   blockHash: string,
   blockNumber: number,
}} LightBlockInfo

@augments LightBlockInfo
@typedef  {{
    blockNumber: number,
    blockHash: string,
    deploys: DeployInfo[],
  }} BlockInfo
// ISSUE: inexact Promise...
  @typedef {{
    deployer: string,
    term: string,
    timestamp: number,
    sig: string,
    sigAlgorithm: string,
    phloPrice: number,
    phloLimit: number,
    validAfterBlockNumber: number,
    cost: number,
    errored: bool,
    systemDeployError: string,
  }} DeployInfo

  @typedef { {| ExprString: {| data: string |} |} |
              {| ExprInt: {| data: number |} |} |
              {| ExprUri: {| data: string |} |} |
              {| ExprMap: {| data: { [string]: RhoExpr } |}
              // ... others; see https://github.com/rchain/rchain/blob/dev/node/src/main/scala/coop/rchain/node/api/WebApi.scala#L120
            |} } RhoExpr;
  @typedef {{
    expr: RhoExpr[],
    block: LightBlockInfo,
  }} ExploratoryDeployResponse
  @typedef {{|
    name: RhoUnforg,
    depth: number,
  |}} DataRequest
  @typedef { {| UnforgDeploy: {| data: string |} |} } RhoUnforg
  ; // | ...
  @typedef { {|
    exprs: RhoExprWithBlock[],
    length: number,
  |}} DataResponse
  @typedef { {|
    expr: RhoExpr,
    block: LightBlockInfo
  |} }RhoExprWithBlock

  @typedef {{
    getBlocks(depth: number): Promise<LightBlockInfo[]>,
  }} RNode

  @typedef { {
    getBlocks(depth: number): Promise<LightBlockInfo[]>,  // @augments RNode doesn't seem to work
    listenForDataAtName(request: DataRequest): Promise<DataResponse>,
    getBlock(hash: string): Promise<BlockInfo>,
    findDeploy(deployId: string): Promise<LightBlockInfo>,
    exploratoryDeploy(string): Promise<ExploratoryDeployResponse>,
  } } Observer

  @augments Observer
  @typedef { {
    getBlocks(depth: number): Promise<LightBlockInfo[]>,  // @augments RNode doesn't seem to work
    listenForDataAtName(request: DataRequest): Promise<DataResponse>,
    getBlock(hash: string): Promise<BlockInfo>,
    findDeploy(deployId: string): Promise<LightBlockInfo>,
    exploratoryDeploy(string): Promise<ExploratoryDeployResponse>,
    deploy(r: DeployRequest): Promise<string>
  } } Validator

  @typedef { {
    setTimeout: typeof setTimeout,
    clearTimeout: typeof clearTimeout,
  } } SchedulerAccess
*/
