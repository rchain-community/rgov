// @ts-check

const { freeze } = Object;

function log(...args) {
  if (process.env.LOG_RNODE) {
    console.log(...args);
  }
}

/**
 * @param {typeof fetch} fetch
 * @param {string} apiBase
 * @returns { Validator }
 */
export function RNode(fetch, apiBase) {
  /**
   * @param {Response} resp
   * @returns {Promise<Object>}
   */
  async function finish(resp) {
    const result = await resp.json();
    // Add status if server error
    if (!resp.ok) {
      const ex = new Error(result);
      // @ts-ignore
      ex.status = resp.status;
      throw ex;
    }
    return result;
  }

  return freeze({
    /** @type { (request: DeployRequest) => Promise<string> } */
    async deploy(request) {
      const methodUrl = `${apiBase}/api/deploy`;
      log({ methodUrl, request });
      return finish(
        await fetch(methodUrl, {
          method: 'POST',
          body: JSON.stringify(request),
        }),
      );
    },
    /** @type { (request: DataRequest) => Promise<DataResponse> } */
    async listenForDataAtName(request) {
      const methodUrl = `${apiBase}/api/data-at-name`;
      log({ methodUrl, request });
      return finish(
        await fetch(methodUrl, {
          method: 'POST',
          body: JSON.stringify(request),
        }),
      );
    },
    /** @type { (hash: string) => Promise<DataResponse> } */
    async getBlock(hash) {
      const methodUrl = `${apiBase}/api/block/${hash}`;
      log({ methodUrl });
      return finish(await fetch(methodUrl));
    },
    /** @type { (depth: number) => Promise<DataResponse> } */
    async getBlocks(depth) {
      return finish(await fetch(`${apiBase}/api/blocks/${depth}`));
    },
    /** @type { (deployId: string) => Promise<DataResponse> } */
    async findDeploy(deployId) {
      const methodUrl = `${apiBase}/api/deploy/${deployId}`;
      log({ methodUrl });
      return finish(await fetch(methodUrl, { method: 'GET' }));
    },
    /** @type { (term: string) => Promise<ExploratoryDeployResponse> } */
    async exploratoryDeploy(term) {
      const methodUrl = `${apiBase}/api/explore-deploy`;
      log({ methodUrl, term });
      return finish(
        await fetch(methodUrl, {
          method: 'POST',
          body: term,
        }),
      );
    },
  });
}
