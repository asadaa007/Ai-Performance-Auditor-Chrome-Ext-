export interface ScriptEntry {
  src: string | null;
  type: 'inline' | 'external';
  isModule: boolean;
  async: boolean;
  defer: boolean;
  isThirdParty: boolean;
  byteSize: number | null;
}

export interface JavaScriptResult {
  totalScripts: number;
  inlineScripts: number;
  externalScripts: number;
  moduleScripts: number;
  asyncScripts: number;
  deferScripts: number;
  thirdPartyScripts: number;
  scripts: ScriptEntry[];
}
