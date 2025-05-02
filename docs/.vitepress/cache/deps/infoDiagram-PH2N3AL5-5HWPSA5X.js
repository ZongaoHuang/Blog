import {
  parse
} from "./chunk-ZSOBMCZT.js";
import "./chunk-LGVBQHQF.js";
import "./chunk-TCF72LME.js";
import "./chunk-LFI4P36C.js";
import "./chunk-HNR32YVI.js";
import "./chunk-4ZIN6IY6.js";
import "./chunk-JZFOYR5E.js";
import "./chunk-T75CU6WR.js";
import "./chunk-46Y37KHS.js";
import {
  package_default
} from "./chunk-3AQ74GPY.js";
import {
  selectSvgElement
} from "./chunk-GETIXQUX.js";
import "./chunk-SVROXNIC.js";
import {
  __name,
  configureSvgSize,
  log
} from "./chunk-57ANFVGG.js";
import "./chunk-5WV6JA3U.js";
import "./chunk-FDBJFBLO.js";

// node_modules/.pnpm/mermaid@11.6.0/node_modules/mermaid/dist/chunks/mermaid.core/infoDiagram-PH2N3AL5.mjs
var parser = {
  parse: __name(async (input) => {
    const ast = await parse("info", input);
    log.debug(ast);
  }, "parse")
};
var DEFAULT_INFO_DB = { version: package_default.version };
var getVersion = __name(() => DEFAULT_INFO_DB.version, "getVersion");
var db = {
  getVersion
};
var draw = __name((text, id, version) => {
  log.debug("rendering info diagram\n" + text);
  const svg = selectSvgElement(id);
  configureSvgSize(svg, 100, 400, true);
  const group = svg.append("g");
  group.append("text").attr("x", 100).attr("y", 40).attr("class", "version").attr("font-size", 32).style("text-anchor", "middle").text(`v${version}`);
}, "draw");
var renderer = { draw };
var diagram = {
  parser,
  db,
  renderer
};
export {
  diagram
};
//# sourceMappingURL=infoDiagram-PH2N3AL5-5HWPSA5X.js.map
