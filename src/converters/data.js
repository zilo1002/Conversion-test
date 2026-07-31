import { downloadBlob, readFileAsText, getExt } from '../utils.js';
import Papa from 'papaparse';
import yaml from 'js-yaml';
import TOML from '@iarna/toml';

function toXML(obj, rootName = 'root') {
  const esc = (s) => String(s).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
  const build = (val, tag) => {
    if (val === null || val === undefined) return '<' + tag + '></' + tag + '>';
    if (typeof val !== 'object') return '<' + tag + '>' + esc(val) + '</' + tag + '>';
    if (Array.isArray(val)) {
      return val.map(v => build(v, 'item')).join('');
    }
    return Object.entries(val).map(([k, v]) => build(v, k)).join('');
  };
  return '<?xml version="1.0" encoding="UTF-8"?>\n<' + rootName + '>\n' + build(obj, rootName) + '\n</' + rootName + '>';
}

function xmlToObj(xmlStr) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, 'text/xml');
  const parseNode = (node) => {
    if (node.children.length === 0) return node.textContent;
    const obj = {};
    for (const child of node.children) {
      const name = child.nodeName;
      if (obj[name] === undefined) obj[name] = parseNode(child);
      else if (Array.isArray(obj[name])) obj[name].push(parseNode(child));
      else obj[name] = [obj[name], parseNode(child)];
    }
    return obj;
  };
  return parseNode(doc.documentElement);
}

export async function convertData(file, targetFormat) {
  const ext = getExt(file.name);
  const text = await readFileAsText(file);
  let data;

  if (ext === 'json') {
    data = JSON.parse(text);
  } else if (ext === 'csv') {
    data = Papa.parse(text, { header: true }).data;
  } else if (ext === 'xml') {
    data = xmlToObj(text);
  } else if (ext === 'yaml' || ext === 'yml') {
    data = yaml.load(text);
  } else if (ext === 'toml') {
    data = TOML.parse(text);
  } else {
    throw new Error('不支持的数据格式');
  }

  let outText, mime, outExt = targetFormat;
  if (targetFormat === 'json') {
    outText = JSON.stringify(data, null, 2);
    mime = 'application/json';
  } else if (targetFormat === 'csv') {
    if (Array.isArray(data)) {
      outText = Papa.unparse(data);
    } else {
      outText = Papa.unparse([data]);
    }
    mime = 'text/csv';
  } else if (targetFormat === 'xml') {
    outText = toXML(data, 'data');
    mime = 'application/xml';
  } else if (targetFormat === 'yaml') {
    outText = yaml.dump(data);
    mime = 'text/yaml';
    outExt = 'yaml';
  } else if (targetFormat === 'toml') {
    outText = TOML.stringify(data);
    mime = 'text/toml';
  } else {
    throw new Error('不支持的目标格式');
  }

  const blob = new Blob([outText], { type: mime + ';charset=utf-8' });
  const newName = file.name.replace(/\.[^.]+$/, '.' + outExt);
  downloadBlob(blob, newName);
}