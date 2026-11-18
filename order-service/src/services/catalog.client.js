// REST client for the Catalog service (timeout + simple retry)
const CATALOG_URL = process.env.CATALOG_URL || 'http://localhost:3001';

async function getCake(cakeId, attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(`${CATALOG_URL}/cakes/${cakeId}`, {
        signal: AbortSignal.timeout(3000),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Catalog responded ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`[order] catalog call failed (attempt ${i}/${attempts}): ${err.message}`);
      if (i === attempts) {
        const e = new Error('Catalog service unavailable');
        e.status = 503;
        throw e;
      }
      await new Promise((r) => setTimeout(r, 300 * i));
    }
  }
}

module.exports = { getCake };
