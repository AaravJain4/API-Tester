import { BLOCKED_HOSTNAMES } from "./config.js";
import { ProxyError } from "./errors.js";

const BLOCKED_PROTOCOLS = new Set(["file:", "ftp:", "ws:", "wss:", "gopher:", "data:", "javascript:"]);
const BLOCKED_HOST_SUFFIXES = [".localhost", ".local", ".internal"];
const IPV4_PRIVATE_RANGES = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.168.0.0", 16],
];
const IPV6_PRIVATE_PREFIXES = [
  ["::1", 128],
  ["fc00::", 7],
  ["fe80::", 10],
];

export function validateTargetUrl(rawUrl) {
  if (typeof rawUrl !== "string" || rawUrl.trim() === "") {
    throw new ProxyError("Invalid URL", 400, "The url field must be a non-empty string");
  }

  let targetUrl;

  try {
    targetUrl = new URL(rawUrl);
  } catch {
    throw new ProxyError("Invalid URL", 400, "The provided URL is malformed");
  }

  if (!["http:", "https:"].includes(targetUrl.protocol) || BLOCKED_PROTOCOLS.has(targetUrl.protocol)) {
    throw new ProxyError("Invalid URL", 400, `Protocol ${targetUrl.protocol} is not allowed`);
  }

  const hostname = targetUrl.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname) || BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    throw new ProxyError("Target URL is not allowed", 403, `Hostname ${hostname} is blocked`);
  }

  if (isBlockedIpLiteral(hostname)) {
    throw new ProxyError("Target URL is not allowed", 403, `IP address ${hostname} is in a private or reserved range`);
  }

  return targetUrl;
}

function isBlockedIpLiteral(hostname) {
  if (isIpv4(hostname)) {
    const ip = ipv4ToNumber(hostname);
    return IPV4_PRIVATE_RANGES.some(([baseIp, prefix]) => matchesCidr(ip, ipv4ToNumber(baseIp), prefix, 32));
  }

  if (hostname.includes(":")) {
    const normalized = normalizeIpv6(hostname);
    return IPV6_PRIVATE_PREFIXES.some(([baseIp, prefix]) => matchesIpv6Prefix(normalized, normalizeIpv6(baseIp), prefix));
  }

  return false;
}

function isIpv4(hostname) {
  const octets = hostname.split(".");
  if (octets.length !== 4) {
    return false;
  }

  return octets.every((octet) => /^\d+$/.test(octet) && Number(octet) >= 0 && Number(octet) <= 255);
}

function ipv4ToNumber(ip) {
  return ip.split(".").reduce((accumulator, octet) => (accumulator << 8) + Number(octet), 0) >>> 0;
}

function matchesCidr(value, base, prefixLength, bitLength) {
  const shift = bitLength - prefixLength;
  if (shift <= 0) {
    return value === base;
  }

  return (value >>> shift) === (base >>> shift);
}

function normalizeIpv6(ip) {
  const zoneIndex = ip.indexOf("%");
  const sanitized = zoneIndex >= 0 ? ip.slice(0, zoneIndex) : ip;
  const [head, tail] = sanitized.split("::");
  const headParts = head ? head.split(":").filter(Boolean) : [];
  const tailParts = tail ? tail.split(":").filter(Boolean) : [];
  const missing = 8 - (headParts.length + tailParts.length);
  const expanded = [
    ...headParts,
    ...Array.from({ length: Math.max(missing, 0) }, () => "0"),
    ...tailParts,
  ];

  return expanded.map((part) => part.padStart(4, "0")).join("");
}

function matchesIpv6Prefix(ip, base, prefixLength) {
  const hexLength = Math.floor(prefixLength / 4);
  const remainder = prefixLength % 4;

  if (hexLength > 0 && ip.slice(0, hexLength) !== base.slice(0, hexLength)) {
    return false;
  }

  if (remainder === 0) {
    return true;
  }

  const mask = 0xf << (4 - remainder);
  const ipNibble = Number.parseInt(ip[hexLength], 16);
  const baseNibble = Number.parseInt(base[hexLength], 16);

  return (ipNibble & mask) === (baseNibble & mask);
}
