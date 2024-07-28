class Fetcher {
  static async fetchAll(urls, parseMethod) {
    return await Promise.all(urls.map(async url => {
      try {
        const resp = await fetch(url);
        return parseMethod == "json" ? resp.json() : (parseMethod == "text" ? resp.text() : (parseMethod == "blob" ? resp.blob() : resp));
      } catch (e) {
        console.error("Unable to fetch " + url);
      }
    }))
  }
}
class GAS {
  static async setSoraLibraries(libraries) {
    //
  }
  static async setLibbyLibraries(libraries) {
    //
  }
  static async fetchAllWithMutedExceptions(urls) {
    let urlWithParametersObjects = urls.map((url) => { return { "url": url, "muteHttpExceptions": true }; });
    // The below is to run the function when actually running from GAS environment
    /* return JSON.stringify(await new Promise(r => {
  google.script.run.withSuccessHandler(r).client_fetchAllWithMutedExceptions(urlWithParametersObjects);
})); */
    return JSON.stringify(await this.simulateGASFunction("client_fetchAllWithMutedExceptions", [urlWithParametersObjects]));
  }
  // Only for testing
  static async simulateGASFunction(fnName, fnArguments) {
    // Simulate GAS environment by fetching from the Temporary GAS
    const tempGASLink = "https://script.google.com/macros/s/AKfycbwMY0uo_a6y9McaWq0uJlapk3PBkMk8usxG4n_sZ1djuHApjezFRO7yGdvwtbFY9DZO/exec";
    const data = {
      "functionName": fnName,
      "functionArguments": fnArguments
    };
    const response = await fetch(tempGASLink, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  }
}
/* Adapted from https://developer.mozilla.org/en-US/docs/Glossary/Base64#:~:text=of%20the%20string%3A-,JS,-Copy%20to%20Clipboard */
class Encoding {
  static #base64ToBytes(base64) {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
  }

  static #bytesToBase64(bytes) {
    const binString = Array.from(bytes, (byte) =>
      String.fromCodePoint(byte),
    ).join("");
    return btoa(binString);
  }

  static encode(data) {
    var JSONData = JSON.stringify(data);
    var encoded = Encoding.#bytesToBase64(new TextEncoder().encode(JSONData));
    return encoded;
  }
  static decode(encodedData) {
    var JSONData = new TextDecoder().decode(Encoding.#base64ToBytes(encodedData));
    var decoded = JSON.parse(JSONData);
    return decoded;
  }

}
class OtherTools {
  constructor() { }
  static mergeArrays = (a, b, predicate = (a, b) => a === b) => {
    const c = [...a]; // copy to avoid side effects
    // add all items from B to copy C if they're not already present
    b.forEach((bItem) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)))
    return c;
  }
}